import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'taskflow_theme_preference';
  
  // true = dark mode, false = light mode
  isDarkMode = signal<boolean>(true);

  constructor() {
    // Load from local storage
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored) {
      this.isDarkMode.set(stored === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }

    // Effect to apply the theme class to body
    effect(() => {
      const isDark = this.isDarkMode();
      if (isDark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
      }
      localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.isDarkMode.update(dark => !dark);
  }
}
