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

export async function scrapeProfile(page: Page, profileUrl: string): Promise<ScrapedProfile> {
  await jitterDelay_()
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded' })
  await jitterDelay_()

  const name = await page.locator(LINKEDIN_SELECTORS.name).first().textContent().catch(() => '').then((s) => (s || '').trim())

  const about = await page.locator(LINKEDIN_SELECTORS.about).first().textContent().catch(() => '').then((s) => (s || '').trim())

  const experience: ScrapedProfile['experience'] = []
  const items = await page.locator(LINKEDIN_SELECTORS.experience).all()
  for (const item of items.slice(0, 10)) {
    const title = await item.locator(LINKEDIN_SELECTORS.experienceTitle).first().textContent().catch(() => '').then((s) => (s || '').trim())
    const company = await item.locator(LINKEDIN_SELECTORS.experienceCompany).first().textContent().catch(() => '').then((s) => (s || '').trim())
    const duration = await item.locator(LINKEDIN_SELECTORS.experienceDuration).first().textContent().catch(() => undefined).then((s) => (s || '').trim() || undefined)
    if (title || company) {
      experience.push({ title, company, duration })
    }
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
