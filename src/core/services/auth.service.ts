import { Injectable, signal, computed, inject } from '@angular/core'
import { Router } from '@angular/router'
import { AsyncStorageService } from './async-storage.service'
import type { User, Session } from '../models/user.model'

const SESSION_KEY = 'linkedin-assist-session'
const USER_ENTITY = 'user'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(AsyncStorageService)
  private readonly router = inject(Router)

  private readonly _currentUser = signal<User | null>(null)
  readonly currentUser = this._currentUser.asReadonly()
  readonly isLoggedIn = computed(() => this._currentUser() !== null)

  constructor() {
    this.restoreSession()
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return
    try {
      const session = JSON.parse(raw) as Session
      if (session?.userId) {
        this.storage.get<User>(USER_ENTITY, session.userId).then((user) => {
          this._currentUser.set(user)
        }).catch(() => this.clearSession())
      }
    } catch {
      this.clearSession()
    }
  }

  async login(email: string, displayName: string): Promise<void> {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = (displayName || trimmedEmail).trim()
    if (!trimmedEmail) return

    const users = await this.storage.query<User>(USER_ENTITY)
    let user = users.find((u) => u.email.toLowerCase() === trimmedEmail)

    if (!user) {
      user = await this.storage.post<Omit<User, '_id'>>(USER_ENTITY, {
        email: trimmedEmail,
        displayName: trimmedName
      }) as User
    }

    const session: Session = { userId: user._id, email: user.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    this._currentUser.set(user)
    await this.router.navigate(['/dashboard'])
  }

  logout(): void {
    this.clearSession()
    this.router.navigate(['/login'])
  }

  private clearSession(): void {
    localStorage.removeItem(SESSION_KEY)
    this._currentUser.set(null)
  }
}
