import { canPerformAction, recordAction } from './daily-governor.js'
import { ensureLoggedIn } from './linkedin-auth.js'
import { scrapeProfile, saveScrapedProfile } from './profile-scraper.js'

async function main(): Promise<void> {
  const url = process.argv[2] || process.env.PROFILE_URL
  if (!url || !url.includes('linkedin.com/in/')) {
    console.error('Usage: npm run scrape -- <linkedin-profile-url>')
    console.error('   or set PROFILE_URL')
    process.exit(1)
  }

  const permitted = await canPerformAction()
  if (!permitted) {
    console.log('Limit reached')
    process.exit(0)
  }

  const context = await ensureLoggedIn()
  const page = await context.newPage()
  try {
    const profile = await scrapeProfile(page, url)
    const savedPath = await saveScrapedProfile(profile)
    await recordAction()
    console.log('Scraped and saved to', savedPath)
  } finally {
    await context.browser()?.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
