import { TestBed } from '@angular/core/testing'
import { AppRoot } from './app-root'

describe('AppRoot', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRoot],
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppRoot)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it('should render router outlet', async () => {
    const fixture = TestBed.createComponent(AppRoot)
    await fixture.whenStable()
    const compiled = fixture.nativeElement as HTMLElement
    expect(compiled.querySelector('router-outlet')).toBeTruthy()
  })
})
