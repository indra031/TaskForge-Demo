import { computed, effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'taskforge-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.resolveInitialTheme());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      const theme = this._theme();
      document.body.classList.toggle('dark-theme', theme === 'dark');
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  toggleTheme(): void {
    this._theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  private resolveInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
