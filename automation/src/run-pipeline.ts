import './load-env.js'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { canPerformAction, recordAction } from './daily-governor.js'
import { generateDraft } from './gemini-draft.js'
import { appendCandidate } from './candidates-store.js'
import type { ScrapedProfile } from './types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SCRAPED_DIR = join(__dirname, '..', '..', 'data', 'scraped')

async function main(): Promise<void> {
  const pathArg = process.argv[2]
  let files: string[] = []
  if (pathArg) {
    files = [pathArg]
  } else {
    try {
      const names = await readdir(SCRAPED_DIR)
      files = names.filter((n) => n.endsWith('.json')).map((n) => join(SCRAPED_DIR, n))
    } catch {
      console.error('No scraped files. Run scrape first or pass a path: npm run pipeline -- <path-to-scraped.json>')
      process.exit(1)
    }
  }

  for (const file of files) {
    const permitted = await canPerformAction()
    if (!permitted) {
      console.log('Limit reached. Skipping remaining.')
      break
    }
    const raw = await readFile(file, 'utf-8')
    const profile = JSON.parse(raw) as ScrapedProfile
    const draftMessage = await generateDraft(profile)
    await appendCandidate({
      scrapedProfile: profile,
      draftMessage,
      status: 'draft'
    })
    await recordAction()
    console.log('Candidate created for', profile.name, '->', file)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
