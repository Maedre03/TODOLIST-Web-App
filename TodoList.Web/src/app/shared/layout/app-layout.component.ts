import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * AppLayoutComponent — the main application shell.
 *
 * This wraps all authenticated pages with:
 * - Sidebar navigation (left)
 * - Top bar (top)
 * - Content area (center) via <router-outlet>
 *
 * Will be fully built in Sub-Phase 6.2.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-layout">
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      background: var(--surface-ground);
    }
  `]
})
export class AppLayoutComponent {}
