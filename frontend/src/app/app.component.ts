import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '@core/services/theme.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    ThemeToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle navigation">
        <mat-icon>menu</mat-icon>
      </button>
      <span>TaskForge</span>
      <span class="spacer"></span>
      <app-theme-toggle />
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/dashboard"
            routerLinkActive="active-nav-item"
            ariaCurrentWhenActive="page"
          >
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .sidenav-container {
      flex: 1;
    }
    .sidenav {
      width: 220px;
    }
    .active-nav-item {
      background-color: rgba(0, 0, 0, 0.08);
    }
    .spacer {
      flex: 1 1 auto;
    }
  `,
})
export class AppComponent {
  // Inject ThemeService at root level to initialize theme on app startup
  protected readonly themeService = inject(ThemeService);
}
