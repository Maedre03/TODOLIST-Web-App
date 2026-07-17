import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

/**
 * Error Interceptor — catches all HTTP errors globally and handles them.
 *
 * Instead of writing error handling in every service method or component,
 * this interceptor catches errors in ONE place and takes appropriate action:
 *
 * - 401 Unauthorized → Token expired or invalid → redirect to login
 * - 403 Forbidden    → User doesn't own this resource → show toast
 * - 400 Bad Request  → Validation error → show toast with details
 * - 404 Not Found    → Resource doesn't exist → show toast
 * - 500+ Server Error → Backend crashed → show generic error toast
 * - 0 (Network Error)→ No connection → show connection lost toast
 *
 * Note: We still re-throw the error after handling it, so components
 * can also react if needed (e.g., stop a loading spinner).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't show toasts for auth endpoint errors — those are handled
      // by the login/register components directly (e.g., "Invalid credentials").
      const isAuthEndpoint = req.url.includes('/auth/');

      switch (error.status) {
        case 0:
          // Network error — no response received from the server
          messageService.add({
            severity: 'error',
            summary: 'Connection Lost',
            detail: 'Unable to reach the server. Please check your connection.',
            life: 5000
          });
          break;

        case 401:
          if (!isAuthEndpoint) {
            // Token expired or invalid — clear it and redirect to login
            localStorage.removeItem('todo_app_token');
            messageService.add({
              severity: 'warn',
              summary: 'Session Expired',
              detail: 'Your session has expired. Please log in again.',
              life: 4000
            });
            router.navigate(['/login']);
          }
          break;

        case 403:
          messageService.add({
            severity: 'error',
            summary: 'Access Denied',
            detail: 'You do not have permission to perform this action.',
            life: 4000
          });
          break;

        case 404:
          if (!isAuthEndpoint) {
            messageService.add({
              severity: 'warn',
              summary: 'Not Found',
              detail: 'The requested item could not be found.',
              life: 3000
            });
          }
          break;

        case 400:
        case 422:
          if (!isAuthEndpoint) {
            const message = error.error?.message || 'Please check your input.';
            messageService.add({
              severity: 'error',
              summary: 'Validation Error',
              detail: message,
              life: 4000
            });
          }
          break;

        default:
          if (error.status >= 500) {
            messageService.add({
              severity: 'error',
              summary: 'Server Error',
              detail: 'Something went wrong on the server. Please try again later.',
              life: 5000
            });
          }
          break;
      }

      // Re-throw so individual components can also handle the error if needed
      return throwError(() => error);
    })
  );
};
