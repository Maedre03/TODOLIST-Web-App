import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guest Guard — protects public routes from authenticated users.
 *
 * Use case: If a logged-in user manually navigates to /login or /register,
 * they should be redirected to /todos instead of seeing the auth forms again.
 *
 * This is the opposite of authGuard:
 * - authGuard: "Must be logged in to access"
 * - guestGuard: "Must NOT be logged in to access"
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Already authenticated — redirect to the main app
  return router.createUrlTree(['/todos']);
};
