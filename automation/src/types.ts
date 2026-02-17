export interface ScrapedProfile {
  profileUrl: string
  name: string
  about: string
  experience: Array<{ title: string; company: string; duration?: string }>
  postsPreview?: string[]
  scrapedAt: string
}

export interface Candidate {
  _id: string
  userId?: string
  scrapedProfile: ScrapedProfile
  draftMessage: string
  status: 'draft' | 'approved' | 'sent'
  createdAt: string
}

export const LINKEDIN_SELECTORS = {
  name: [
    'h1.text-heading-xlarge',
    'h1[class*="text-heading"]',
    'h1.inline.t-24',
    'section[data-section="summary"] h1',
    'main h1',
    'h1'
  ],
  about: [
    '[data-section="summary"] .inline-show-more-text',
    '[data-section="summary"] [class*="inline-show-more"]',
    'section[data-section="summary"]',
    '#about ~ div',
    '[data-section="summary"]'
  ],
  experience: [
    'section[data-section="experience"] li',
    '[data-section="experience"] .experience-item',
    '.experience-item',
    'section[data-section="experience"] ul li'
  ],
  experienceTitle: [
    '.experience-item__title',
    '[class*="experience-item"] [class*="title"]',
    'span[aria-hidden="true"]'
  ],
  experienceCompany: [
    '.experience-item__subtitle',
    '[class*="experience-item"] [class*="subtitle"]',
    '.t-14.t-normal span'
  ],
  experienceDuration: [
    '.experience-item__duration',
    '[class*="experience-item"] [class*="duration"]',
    '.t-14.t-black--light'
  ],
  postsContainer: '.scaffold-layout__main'
} as const
