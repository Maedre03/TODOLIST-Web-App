import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor — automatically attaches the JWT token to outgoing HTTP requests.
 *
 * How it works:
 * 1. Every HTTP request passes through this interceptor before leaving the app.
 * 2. It checks if the request is going to an auth endpoint (login/register).
 *    - If yes → skip (these endpoints don't need a token).
 * 3. For all other requests, it reads the token from AuthService.
 * 4. If a token exists, it clones the request and adds the Authorization header.
 *
 * Why clone? HttpRequest objects are immutable in Angular.
 * You can't modify them directly — you must create a new copy with the changes.
 *
 * This is a functional interceptor (Angular 22 style) — not a class-based one.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Don't attach token to authentication endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
