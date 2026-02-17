import { Component, inject, computed } from '@angular/core'
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly auth = inject(AuthService)
  protected user = this.auth.currentUser
  protected displayName = computed(() => this.user()?.displayName ?? this.user()?.email ?? 'User')

  protected logout(): void {
    this.auth.logout()
  }
}
