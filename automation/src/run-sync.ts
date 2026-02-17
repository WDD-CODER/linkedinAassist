import './load-env.js'
import { readFile, readdir, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { canPerformAction, recordAction } from './daily-governor.js'
import { ensureLoggedIn } from './linkedin-auth.js'
import { discoverProfilesFromSearch } from './search-discovery.js'
import { scrapeProfile, saveScrapedProfile } from './profile-scraper.js'
import { generateDraft } from './gemini-draft.js'
import { appendCandidate, readCandidates } from './candidates-store.js'
import type { ScrapedProfile } from './types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = join(__dirname, '..', '..', 'data')
const SEARCH_TARGETS_PATH = join(DATA_DIR, 'search-targets.json')
const SCRAPED_DIR = join(DATA_DIR, 'scraped')
const MAX_TO_SCRAPE_PER_RUN = 10
const PENDING_TARGET = 20

interface SearchTarget {
  query: string
  priority: number
}

function slugFromUrl(url: string): string {
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
  return match ? match[1] : url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
}

async function readSearchTargets(): Promise<SearchTarget[]> {
  await mkdir(DATA_DIR, { recursive: true })
  try {
    const raw = await readFile(SEARCH_TARGETS_PATH, 'utf-8')
    const data = JSON.parse(raw) as { targets?: SearchTarget[] }
    const targets = Array.isArray(data?.targets) ? data.targets : []
    return targets
      .filter((t) => t?.query && typeof t.query === 'string')
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
  } catch {
    const examplePath = join(DATA_DIR, '..', 'search-targets.example.json')
    try {
      const example = await readFile(examplePath, 'utf-8')
      await writeFile(SEARCH_TARGETS_PATH, example, 'utf-8')
      console.log('[sync] Created data/search-targets.json from example. Edit and restart.')
    } catch {
      const defaultTargets = {
        targets: [
          { query: 'recruiter software developer', priority: 1 },
          { query: 'technical recruiter', priority: 1 },
          { query: 'hiring manager developer', priority: 2 }
        ]
      }
      await writeFile(SEARCH_TARGETS_PATH, JSON.stringify(defaultTargets, null, 2), 'utf-8')
      console.log('[sync] Created data/search-targets.json. Edit and restart.')
    }
    return []
  }
}

async function getScrapedSlugs(): Promise<Set<string>> {
  try {
    const names = await readdir(SCRAPED_DIR)
    return new Set(names.filter((n) => n.endsWith('.json')).map((n) => n.replace('.json', '')))
  } catch {
    return new Set()
  }
}

export async function runSync(): Promise<void> {
  console.log('[sync] Starting sync...')
  const existingCandidates = await readCandidates()
  const pendingCount = existingCandidates.filter((c) => c.status !== 'sent').length
  if (pendingCount >= PENDING_TARGET) {
    console.log('[sync]', PENDING_TARGET, 'pending candidates (draft/approved). Skipping discovery and scrape.')
    return
  }
  console.log('[sync] Pending candidates:', pendingCount, '/', PENDING_TARGET)

  const targets = await readSearchTargets()
  if (targets.length === 0) {
    console.log('[sync] No search targets in data/search-targets.json. Add targets and restart.')
    return
  }
  console.log('[sync] Targets:', targets.length)

  const scrapedSlugs = await getScrapedSlugs()
  const discoveredUrls = new Set<string>()
  const slotsNeeded = Math.max(0, PENDING_TARGET - pendingCount)

  const permitted = await canPerformAction()
  if (!permitted) {
    console.log('[sync] Daily limit reached. Skipping discovery.')
  } else {
    console.log('[sync] Logging into LinkedIn...')
    const context = await ensureLoggedIn()
    const page = await context.newPage()
    try {
      for (const target of targets) {
        try {
          const urls = await discoverProfilesFromSearch(page, target.query)
          const newCount = urls.filter((u) => !scrapedSlugs.has(slugFromUrl(u))).length
          console.log('[sync] Discovery "' + target.query + '": found ' + urls.length + ' profiles, ' + newCount + ' new')
          for (const url of urls) {
            const slug = slugFromUrl(url)
            if (!scrapedSlugs.has(slug)) {
              discoveredUrls.add(url)
            }
          }
        } catch (err) {
          console.error('[sync] Discovery failed for', target.query, err)
        }
      }
      console.log('[sync] Total new profiles to scrape:', discoveredUrls.size)
    } finally {
      await context.browser()?.close()
    }
  }

  const toScrape = Array.from(discoveredUrls).slice(0, Math.min(MAX_TO_SCRAPE_PER_RUN, slotsNeeded))

  if (toScrape.length > 0) {
    const scrapePermitted = await canPerformAction()
    if (!scrapePermitted) {
      console.log('[sync] Daily limit reached. Skipping scrape.')
    } else {
      console.log('[sync] Scraping', toScrape.length, 'profiles...')
      const context = await ensureLoggedIn()
      const page = await context.newPage()
      try {
        for (const url of toScrape) {
          const stillPermitted = await canPerformAction()
          if (!stillPermitted) {
            console.log('[sync] Limit reached. Stopping scrape.')
            break
          }
          try {
            const profile = await scrapeProfile(page, url)
            await saveScrapedProfile(profile)
            await recordAction()
            console.log('[sync] Scraped:', profile.name)
          } catch (err) {
            console.error('[sync] Failed to scrape', url, err)
          }
        }
      } finally {
        await context.browser()?.close()
      }
    }
  }

  const existingUrls = new Set(existingCandidates.map((c) => c.scrapedProfile.profileUrl))

  let scrapedFiles: string[] = []
  try {
    const names = await readdir(SCRAPED_DIR)
    scrapedFiles = names
      .filter((n) => n.endsWith('.json'))
      .map((n) => join(SCRAPED_DIR, n))
  } catch {
    console.log('[sync] No scraped profiles yet. Discovery found 0 profiles or no data/scraped.')
    return
  }
  if (scrapedFiles.length === 0) {
    console.log('[sync] No scraped profiles to convert to candidates.')
    return
  }

  console.log('[sync] Creating candidates from', scrapedFiles.length, 'scraped profiles...')
  let pendingNow = pendingCount
  for (const file of scrapedFiles) {
    if (pendingNow >= PENDING_TARGET) {
      console.log('[sync] Reached', PENDING_TARGET, 'pending candidates. Stopping pipeline.')
      break
    }
    const raw = await readFile(file, 'utf-8')
    const profile = JSON.parse(raw) as ScrapedProfile
    if (existingUrls.has(profile.profileUrl)) {
      continue
    }
    try {
      let draftMessage: string
      try {
        draftMessage = await generateDraft(profile)
      } catch (err) {
        console.warn('[sync] Gemini failed for', profile.name, '- using fallback draft')
        draftMessage = `Hi${profile.name ? ` ${profile.name}` : ''}, I'd like to connect.`
      }
      await appendCandidate({
        scrapedProfile: profile,
        draftMessage,
        status: 'draft'
      })
      existingUrls.add(profile.profileUrl)
      pendingNow++
      console.log('[sync] Candidate created for', profile.name || profile.profileUrl)
    } catch (err) {
      console.error('[sync] Failed to create candidate for', profile.name, err)
    }
  }
  const total = await readCandidates()
  console.log('[sync] Sync complete. Total candidates:', total.length)
}
