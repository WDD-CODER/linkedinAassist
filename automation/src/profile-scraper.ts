import type { Page } from 'playwright'
import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { ScrapedProfile } from './types.js'
import { LINKEDIN_SELECTORS } from './types.js'
import { jitterDelay_ } from './jitter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCRAPED_DIR = join(__dirname, '..', '..', 'data', 'scraped')

function slugFromUrl(url: string): string {
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/)
  return match ? match[1] : url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
}

async function trySelectors(page: Page, selectors: readonly string[], maxLen = 500): Promise<string> {
  for (const sel of selectors) {
    try {
      const text = await page.locator(sel).first().textContent({ timeout: 2000 }).catch(() => null)
      const trimmed = (text || '').trim()
      if (trimmed && trimmed.length <= maxLen) return trimmed
    } catch {
      /* try next */
    }
  }
  return ''
}

export async function scrapeProfile(page: Page, profileUrl: string): Promise<ScrapedProfile> {
  await jitterDelay_()
  await page.goto(profileUrl, { waitUntil: 'load', timeout: 30000 })
  await page.waitForSelector('h1, main, [data-section]', { timeout: 10000 }).catch(() => {})
  await jitterDelay_()

  let name = await trySelectors(page, LINKEDIN_SELECTORS.name, 150)
  if (!name) {
    const h1 = await page.getByRole('heading', { level: 1 }).first().textContent({ timeout: 2000 }).catch(() => null)
    name = (h1 || '').trim().slice(0, 150)
  }

  const about = await trySelectors(page, LINKEDIN_SELECTORS.about, 2000)

  const experience: ScrapedProfile['experience'] = []
  for (const expSel of LINKEDIN_SELECTORS.experience) {
    const items = await page.locator(expSel).all().catch(() => [])
    if (items.length === 0) continue
    for (const item of items.slice(0, 10)) {
      let title = ''
      let company = ''
      let duration: string | undefined
      for (const tSel of LINKEDIN_SELECTORS.experienceTitle) {
        title = await item.locator(tSel).first().textContent({ timeout: 500 }).catch(() => '').then((s) => (s || '').trim())
        if (title && title.length < 200) break
      }
      for (const cSel of LINKEDIN_SELECTORS.experienceCompany) {
        company = await item.locator(cSel).first().textContent({ timeout: 500 }).catch(() => '').then((s) => (s || '').trim())
        if (company && company.length < 200) break
      }
      for (const dSel of LINKEDIN_SELECTORS.experienceDuration) {
        const d = await item.locator(dSel).first().textContent({ timeout: 500 }).catch(() => '').then((s) => (s || '').trim())
        if (d && d.length < 100) {
          duration = d
          break
        }
      }
      if (!title && !company) {
        const allText = await item.textContent({ timeout: 500 }).catch(() => '').then((s) => (s || '').trim())
        const parts = allText.split('\n').map((p) => p.trim()).filter(Boolean)
        if (parts.length >= 1) title = parts[0]
        if (parts.length >= 2) company = parts[1]
        if (parts.length >= 3) duration = parts[2]
      }
      if (title || company) {
        experience.push({ title, company, duration })
      }
    }
    if (experience.length > 0) break
  }

  const scraped: ScrapedProfile = {
    profileUrl,
    name,
    about,
    experience,
    scrapedAt: new Date().toISOString()
  }
  return scraped
}

export async function saveScrapedProfile(profile: ScrapedProfile): Promise<string> {
  await mkdir(SCRAPED_DIR, { recursive: true })
  const slug = slugFromUrl(profile.profileUrl)
  const path = join(SCRAPED_DIR, `${slug}.json`)
  await writeFile(path, JSON.stringify(profile, null, 2), 'utf-8')
  return path
}
