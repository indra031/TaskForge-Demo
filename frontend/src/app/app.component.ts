import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { AuthStore } from '@features/auth/store/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }
  `,
})
export class AppComponent implements OnInit {
  // Inject ThemeService at root level to initialize theme on app startup
  protected readonly themeService = inject(ThemeService);
  private readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    this.authStore.initializeFromStorage();
  }
}
