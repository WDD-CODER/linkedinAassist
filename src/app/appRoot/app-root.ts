import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app-root.html',
  styleUrl: './app-root.css'
})
export class AppRoot {
  protected readonly title = signal('linkedin-assist')
}
