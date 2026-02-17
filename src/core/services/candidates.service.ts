import { Injectable, signal, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import { environment } from '../../environments/environment'
import { UserMsgService } from './user-msg.service'
import type { Candidate, CandidateUpdate } from '../models/candidate.model'

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private readonly http = inject(HttpClient)
  private readonly msg = inject(UserMsgService)
  private readonly baseUrl = `${environment.apiBaseUrl}/api/candidates`
  private readonly statsUrl = `${environment.apiBaseUrl}/api/stats`

  private readonly _candidates = signal<Candidate[]>([])
  readonly candidates = this._candidates.asReadonly()

  private readonly _stats = signal<{ remaining: number } | null>(null)
  readonly stats = this._stats.asReadonly()

  async loadCandidates(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<Candidate[]>(this.baseUrl))
      this._candidates.set(data ?? [])
    } catch {
      this._candidates.set([])
    }
  }

  async triggerSync(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post<{ message: string }>(`${environment.apiBaseUrl}/api/sync`, {}))
      this.msg.onSetSuccessMsg('Sync started. Check API terminal for progress.')
      return true
    } catch {
      this.msg.onSetErrorMsg('Failed to start sync')
      return false
    }
  }

  async loadStats(): Promise<void> {
    try {
      const data = await firstValueFrom(
        this.http.get<{ actionCount: number; remaining: number; lastReset: string }>(this.statsUrl)
      )
      this._stats.set({ remaining: data.remaining })
    } catch {
      this._stats.set(null)
    }
  }

  async sendConnection(id: string): Promise<Candidate | null> {
    try {
      const updated = await firstValueFrom(
        this.http.post<Candidate>(`${this.baseUrl}/${id}/send`, {})
      )
      this._candidates.update((list) =>
        list.map((c) => (c._id === id ? updated : c))
      )
      await this.loadStats()
      this.msg.onSetSuccessMsg('Connection request sent')
      return updated
    } catch (err: unknown) {
      const body = err && typeof err === 'object' && 'error' in err ? (err as { error?: unknown }).error : null
      const msg = body && typeof body === 'object' && 'error' in body ? String((body as { error: unknown }).error) : 'Send failed'
      this.msg.onSetErrorMsg(msg)
      return null
    }
  }

  async updateCandidate(id: string, partial: CandidateUpdate): Promise<Candidate | null> {
    this._candidates.update((list) =>
      list.map((c) => (c._id === id ? { ...c, ...partial } : c))
    )
    try {
      const updated = await firstValueFrom(
        this.http.patch<Candidate>(`${this.baseUrl}/${id}`, partial)
      )
      this._candidates.update((list) =>
        list.map((c) => (c._id === id ? updated : c))
      )
      return updated
    } catch {
      // PATCH not implemented yet; optimistic update already applied
    }
    return null
  }
}
