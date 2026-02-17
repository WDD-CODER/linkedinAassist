import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard'])
    }
  }

  protected email = signal('')
  protected displayName = signal('')
  protected pending = signal(false)

  async onSubmit(): Promise<void> {
    if (this.pending()) return
    this.pending.set(true)
    try {
      await this.auth.login(this.email(), this.displayName())
    } finally {
      this.pending.set(false)
    }
  }
}
