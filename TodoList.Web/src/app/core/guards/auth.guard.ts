import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard — protects routes that require authentication.
 *
 * How it works:
 * 1. Before a protected route loads, Angular runs this guard.
 * 2. It checks AuthService.isAuthenticated() — a reactive signal.
 * 3. If the user has a valid (non-expired) JWT → allow access.
 * 4. If not → redirect to /login.
 *
 * This is a functional guard (Angular 22 style) — cleaner than class-based guards.
 *
 * IMPORTANT (from project rules): This guard is for UX convenience only.
 * Real security is enforced by the backend's [Authorize] attribute + JWT validation.
 * Even if someone bypasses this guard, the API will reject unauthorized requests.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page
  return router.createUrlTree(['/login']);
};
