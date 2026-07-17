import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

/**
 * Application route definitions.
 *
 * Route structure:
 * - /login    → Login page (public, guest-only)
 * - /register → Register page (public, guest-only)
 * - /         → Main app layout (protected, requires auth)
 *   - /todos  → Todo list page (default)
 * - /**       → Fallback → redirect to login
 *
 * Lazy loading: Feature components are loaded lazily using dynamic imports.
 * This means the browser only downloads the code for a page when the user
 * actually navigates to it — improving initial load time.
 */
export const routes: Routes = [
  // ── Public routes (guest guard — already logged in users get redirected) ──
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // ── Protected routes (auth guard — must be logged in) ──
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'todos',
        pathMatch: 'full'
      },
      {
        path: 'todos',
        loadComponent: () =>
          import('./features/todos/todo-list/todo-list.component').then(m => m.TodoListComponent)
      }
    ]
  },

  // ── Fallback — redirect unknown paths to login ──
  {
    path: '**',
    redirectTo: 'login'
  }
];
