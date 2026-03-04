import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar color="primary" class="auth-toolbar">
      <span>TaskForge</span>
    </mat-toolbar>
    <main class="auth-content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .auth-toolbar {
      flex-shrink: 0;
    }
    .auth-content {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-y: auto;
    }
  `,
})
export class AuthLayoutComponent {}
