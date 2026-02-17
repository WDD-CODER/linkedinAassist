import type { Candidate } from './types.js'
import { canPerformAction, recordAction } from './daily-governor.js'
import { ensureLoggedIn } from './linkedin-auth.js'
import { jitterDelay_ } from './jitter.js'

/**
 * Send a LinkedIn connection request with personalized message.
 * Requires: candidate with status 'approved', scrapedProfile.profileUrl, draftMessage.
 * Governor check must pass before calling.
 */
export async function sendConnectionRequest(candidate: Candidate): Promise<void> {
  const permitted = await canPerformAction()
  if (!permitted) {
    throw new Error('Daily limit reached')
  }

  await jitterDelay_()

  const context = await ensureLoggedIn()
  const page = await context.newPage()

  try {
    const profileUrl = candidate.scrapedProfile?.profileUrl ?? ''
    const draftMessage = candidate.draftMessage ?? ''

    if (!profileUrl || !profileUrl.includes('linkedin.com/in/')) {
      throw new Error('Invalid profile URL')
    }

    await page.goto(profileUrl, { waitUntil: 'domcontentloaded' })
    await jitterDelay_()

    const connectBtn = page.getByRole('button', { name: /connect/i }).first()
    await connectBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      throw new Error('Connect button not found')
    })
    await jitterDelay_()
    await connectBtn.click()
    await jitterDelay_()

    const addNote = page.getByRole('button', { name: /add a note/i }).or(
      page.getByText(/add a note/i).first()
    )
    const addNoteVisible = await addNote.first().isVisible().catch(() => false)
    if (addNoteVisible) {
      await addNote.first().click()
      await jitterDelay_()
    }

    const messageBox = page.locator('textarea[placeholder*="message" i], textarea[placeholder*="note" i], [contenteditable="true"]').first()
    await messageBox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      throw new Error('Message input not found')
    })
    await messageBox.fill('')
    await jitterDelay_()
    await messageBox.type(draftMessage, { delay: Math.floor(Math.random() * 100) + 50 })
    await jitterDelay_()

    const sendBtn = page.getByRole('button', { name: /send/i }).or(
      page.getByRole('button', { name: /send now/i })
    ).first()
    await sendBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      throw new Error('Send button not found')
    })
    await jitterDelay_()
    await sendBtn.click()

    await recordAction()
  } finally {
    await context.browser()?.close()
  }
}
