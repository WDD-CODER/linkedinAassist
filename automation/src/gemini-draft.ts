import './load-env.js'
import { GoogleGenAI } from '@google/genai'
import { loadCvContent } from './cv-loader.js'
import type { ScrapedProfile } from './types.js'

const apiKey = process.env.GEMINI_API_KEY
const envModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const model = envModel === 'gemini-1.5-flash' ? 'gemini-2.0-flash' : envModel

function profileToPromptContext(profile: ScrapedProfile): string {
  const exp = profile.experience
    .map((e) => `${e.title} at ${e.company}${e.duration ? ` (${e.duration})` : ''}`)
    .join('; ')
  return [
    `Name: ${profile.name}`,
    `About: ${profile.about || '(none)'}`,
    `Experience: ${exp || '(none)'}`
  ].join('\n')
}

export async function generateDraft(profile: ScrapedProfile): Promise<string> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY must be set')
  }
  const ai = new GoogleGenAI({ apiKey })
  const profileContext = profileToPromptContext(profile)
  const cvText = await loadCvContent()

  const prompt = cvText
    ? `You are writing a short LinkedIn connection request (under 300 characters).

TARGET PROFILE (the person receiving the message):
${profileContext}

SENDER'S CV/RESUME (the person writing — use this to personalize):
${cvText}

Instructions:
- Find connections between the target's profile and the sender's background (shared tech stack, similar roles, relevant experience).
- Write a message that references BOTH: why the sender is reaching out AND what they have in common or why they're a fit.
- Be specific and professional. No hashtags. No generic "I'd love to connect."
- Output only the message text.`
    : `You are writing a short LinkedIn connection request. The sender is a developer seeking job opportunities.
Based on this profile, write a personalized message (under 300 chars) that is professional and specific.
Mention shared interests or their role if relevant. No hashtags. Output only the message.

Profile:
${profileContext}`

  let raw: {
    text?: string
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await ai.models.generateContent({ model, contents: prompt })
      raw = res as typeof raw
      break
    } catch (err: unknown) {
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status?: number }).status : 0
      const details = err && typeof err === 'object' && 'details' in err ? (err as { details?: unknown[] }).details : []
      const retryInfo = Array.isArray(details) ? details.find((d) => d && typeof d === 'object' && 'retryDelay' in d) : null
      const delaySec = retryInfo && typeof retryInfo === 'object' && 'retryDelay' in retryInfo
        ? parseFloat(String((retryInfo as { retryDelay?: string }).retryDelay).replace(/s$/, ''))
        : 8
      const delayMs = Math.min(delaySec * 1000, 15000)
      if (status === 429 && attempt < 2) {
        console.warn('[sync] Gemini rate limited, retrying in', Math.round(delayMs / 1000), 's...')
        await new Promise((r) => setTimeout(r, delayMs))
      } else {
        throw err
      }
    }
  }
  const result = raw!
  let text = result.text
  if (!text && result.candidates?.[0]?.content?.parts?.[0]?.text) {
    text = result.candidates[0].content.parts[0].text
  }
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned no text')
  }
  return text.trim().slice(0, 300)
}
