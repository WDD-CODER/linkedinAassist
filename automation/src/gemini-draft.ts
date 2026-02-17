import { GoogleGenAI } from '@google/genai'
import type { ScrapedProfile } from './types.js'

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

function profileToPromptContext(profile: ScrapedProfile): string {
  const exp = profile.experience.map((e) => `${e.title} at ${e.company}${e.duration ? ` (${e.duration})` : ''}`).join('; ')
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
  const context = profileToPromptContext(profile)
  const prompt = `You are writing a short LinkedIn connection request message. Based on this profile, write a single personalized message (under 300 characters). Be professional and specific; do not be generic. Do not use hashtags or salutations like "Hi" at the start if it wastes space. Output only the message text, nothing else.

Profile:
${context}`

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  })
  const raw = response as { text?: string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  let text = raw.text
  if (!text && raw.candidates?.[0]?.content?.parts?.[0]?.text) {
    text = raw.candidates[0].content.parts[0].text
  }
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned no text')
  }
  return text.trim().slice(0, 300)
}
