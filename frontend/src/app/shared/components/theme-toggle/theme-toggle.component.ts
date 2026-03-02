import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatIconButton, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      mat-icon-button
      (click)="themeService.toggleTheme()"
      [attr.aria-label]="isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
      [matTooltip]="isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
    >
      <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly isDark = this.themeService.isDark;
}
