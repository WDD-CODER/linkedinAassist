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
  about: '[data-section="summary"] .inline-show-more-text',
  experience: '.experience-item',
  experienceTitle: '.experience-item__title',
  experienceCompany: '.experience-item__subtitle',
  experienceDuration: '.experience-item__duration',
  name: 'h1.text-heading-xlarge',
  postsContainer: '.scaffold-layout__main'
} as const
