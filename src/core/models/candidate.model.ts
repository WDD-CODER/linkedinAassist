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

export type CandidateStatus = Candidate['status']

export type CandidateUpdate = Partial<Pick<Candidate, 'draftMessage' | 'status'>>
