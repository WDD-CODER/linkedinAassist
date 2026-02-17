import { Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { UserMsgService } from '../../core/services/user-msg.service'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app-root.html',
  styleUrl: './app-root.css'
})
export class AppRoot {
  protected readonly msg = inject(UserMsgService)
}
