import { chromium, type BrowserContext } from 'playwright'
import { mkdir, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { jitterDelay_ } from './jitter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const AUTH_DIR = join(__dirname, '..', '..', 'data', '.auth')
const AUTH_STATE_PATH = join(AUTH_DIR, 'linkedin-state.json')
const LINKEDIN_LOGIN = 'https://www.linkedin.com/login'

export async function getAuthStatePath(): Promise<string> {
  await mkdir(AUTH_DIR, { recursive: true })
  return AUTH_STATE_PATH
}

export async function ensureLoggedIn(): Promise<BrowserContext> {
  const browser = await chromium.launch({ headless: true })
  const statePath = await getAuthStatePath()
  let hasState = false
  try {
    await access(statePath)
    hasState = true
  } catch {
    /* no saved state */
  }

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    ...(hasState ? { storageState: statePath } : {})
  })

  const email = process.env.LINKEDIN_EMAIL
  const password = process.env.LINKEDIN_PASSWORD

  const page = await context.newPage()
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' })
  await jitterDelay_()

  const currentUrl = page.url()
  if (currentUrl.includes('/login') || currentUrl.includes('/checkpoint') || !currentUrl.includes('/feed')) {
    if (!email || !password) {
      await page.close()
      await browser.close()
      throw new Error('LINKEDIN_EMAIL and LINKEDIN_PASSWORD must be set when no valid session exists')
    }
    await page.goto(LINKEDIN_LOGIN, { waitUntil: 'domcontentloaded' })
    await jitterDelay_()
    await page.getByLabel('Email or phone').fill(email)
    await jitterDelay_()
    await page.getByLabel('Password').fill(password)
    await jitterDelay_()
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL(/linkedin\.com\/(feed|mynetwork)/, { timeout: 30000 }).catch(() => {})
    await context.storageState({ path: statePath })
  }
  await page.close()
  return context
}
