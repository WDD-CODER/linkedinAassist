import type { Page } from 'playwright'
import { jitterDelay_ } from './jitter.js'

const SEARCH_BASE = 'https://www.linkedin.com/search/results/people/'
const MAX_PROFILES_PER_SEARCH = 10

function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({ keywords: query })
  return `${SEARCH_BASE}?${params.toString()}`
}

function normalizeProfileUrl(href: string): string | null {
  const match = href.match(/linkedin\.com\/in\/([^/?]+)/)
  if (!match) return null
  const slug = match[1]
  if (!slug || slug === 'login' || slug === 'pub' || slug.length < 2) return null
  return `https://www.linkedin.com/in/${slug}`
}

/**
 * Discovers profile URLs from LinkedIn people search.
 * Requires the page to be logged in and on a LinkedIn page.
 */
export async function discoverProfilesFromSearch(
  page: Page,
  query: string
): Promise<string[]> {
  const url = buildSearchUrl(query)
  await jitterDelay_()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await jitterDelay_()

  const hrefs = await page
    .locator('a[href*="/in/"]')
    .evaluateAll((links) =>
      links.map((a) => (a as HTMLAnchorElement).href).filter(Boolean)
    )

  const seen = new Set<string>()
  const profiles: string[] = []
  for (const href of hrefs) {
    const normalized = normalizeProfileUrl(href)
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized)
      profiles.push(normalized)
      if (profiles.length >= MAX_PROFILES_PER_SEARCH) break
    }
  }
  return profiles
}
