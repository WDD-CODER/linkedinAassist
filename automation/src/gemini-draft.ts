import './load-env.js'
import { GoogleGenAI } from '@google/genai'
import { loadCvContent } from './cv-loader.js'
import type { ScrapedProfile } from './types.js'

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

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

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  })
  const raw = response as {
    text?: string
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  let text = raw.text
  if (!text && raw.candidates?.[0]?.content?.parts?.[0]?.text) {
    text = raw.candidates[0].content.parts[0].text
  }
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned no text')
  }
  return text.trim().slice(0, 300)
}
