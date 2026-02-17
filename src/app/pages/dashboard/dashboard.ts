import { Component, inject, computed, signal, OnInit } from '@angular/core'
import { AuthService } from '../../../core/services/auth.service'
import { CandidatesService } from '../../../core/services/candidates.service'
import type { Candidate } from '../../../core/models/candidate.model'

const ABOUT_MAX_LEN = 120

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly auth = inject(AuthService)
  private readonly candidatesSvc = inject(CandidatesService)

  protected user = this.auth.currentUser
  protected displayName = computed(() => this.auth.currentUser()?.displayName ?? this.auth.currentUser()?.email ?? 'User')
  protected candidates = this.candidatesSvc.candidates
  protected pendingCandidates = computed(() =>
    this.candidatesSvc.candidates().filter((c) => c.status !== 'sent')
  )
  protected stats = this.candidatesSvc.stats
  protected loading = signal(true)
  protected sending = signal<string | null>(null)
  protected syncing = signal(false)
  private readonly editDrafts = signal<Record<string, string>>({})

  protected draftDisplay(c: Candidate): string {
    return this.editDrafts()[c._id] ?? c.draftMessage
  }

  protected onDraftInput(id: string, ev: Event): void {
    const value = (ev.target as HTMLTextAreaElement)?.value ?? ''
    this.editDrafts.update((m) => ({ ...m, [id]: value }))
  }

  ngOnInit(): void {
    this.refresh()
  }

  protected refresh(): void {
    this.loading.set(true)
    Promise.all([
      this.candidatesSvc.loadCandidates(),
      this.candidatesSvc.loadStats()
    ]).finally(() => this.loading.set(false))
  }

  protected async syncMore(): Promise<void> {
    this.syncing.set(true)
    await this.candidatesSvc.triggerSync()
    this.syncing.set(false)
  }

  protected truncate(text: string, max = ABOUT_MAX_LEN): string {
    if (!text) return ''
    return text.length <= max ? text : text.slice(0, max).trim() + '…'
  }

  protected displayNameFor(c: Candidate): string {
    const name = c.scrapedProfile?.name?.trim()
    if (name) return name
    const match = c.scrapedProfile?.profileUrl?.match(/linkedin\.com\/in\/([^/?]+)/)
    return match ? match[1] : 'Unknown'
  }

  protected onDraftBlur(c: Candidate, ev: FocusEvent): void {
    const value = (ev.target as HTMLTextAreaElement)?.value?.trim() ?? ''
    this.editDrafts.update((m) => {
      const next = { ...m }
      delete next[c._id]
      return next
    })
    if (value !== c.draftMessage) {
      this.candidatesSvc.updateCandidate(c._id, { draftMessage: value })
    }
  }

  protected approve(c: Candidate): void {
    if (c.status === 'approved') return
    this.candidatesSvc.updateCandidate(c._id, { status: 'approved' })
  }

  protected async confirmAndSend(c: Candidate): Promise<void> {
    if (c.status !== 'approved') return
    const remaining = this.stats()?.remaining ?? 0
    if (remaining <= 0) return
    const messageToSend = this.draftDisplay(c)
    const confirmed = confirm(
      `Send this connection message to ${this.displayNameFor(c)}?\n\n"${messageToSend}"\n\nThis will send the message on LinkedIn.`
    )
    if (!confirmed) return
    if (messageToSend !== c.draftMessage) {
      await this.candidatesSvc.updateCandidate(c._id, { draftMessage: messageToSend })
    }
    this.sending.set(c._id)
    await this.candidatesSvc.sendConnection(c._id)
    this.sending.set(null)
  }

  protected logout(): void {
    this.auth.logout()
  }
}
