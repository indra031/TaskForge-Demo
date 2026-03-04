import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { AuthStore } from '@features/auth/store/auth.store';

@Component({
  selector: 'app-main-layout',
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

      @if (authStore.isAuthenticated()) {
        <span class="user-name">{{ authStore.userDisplayName() }}</span>
      }

      <app-theme-toggle />

      <button mat-icon-button (click)="authStore.logout()" aria-label="Logout">
        <mat-icon>logout</mat-icon>
      </button>
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
    .user-name {
      font-size: 0.875rem;
      margin-right: 8px;
      opacity: 0.9;
    }
  `,
})
export class MainLayoutComponent {
  protected readonly authStore = inject(AuthStore);
}
