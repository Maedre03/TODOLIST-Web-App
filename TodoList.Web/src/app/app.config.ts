import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

/**
 * Custom PrimeNG theme preset — extends Aura with our dark-first design tokens.
 *
 * We override PrimeNG's default colors to match our design system:
 * - Primary accent: Violet (#8B5CF6)
 * - Surface colors: Deep ink/charcoal palette
 * - This ensures every PrimeNG component (buttons, inputs, dialogs)
 *   automatically uses our brand colors without per-component styling.
 */
const TodoAppPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '{violet.400}',
      500: '{violet.500}',
      600: '{violet.600}',
      700: '{violet.700}',
      800: '{violet.800}',
      900: '{violet.900}',
      950: '{violet.950}',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#E8EAF0',
          100: '#C9CCD6',
          200: '#A3A7B5',
          300: '#8B8FA3',
          400: '#6B7080',
          500: '#4A4E5A',
          600: '#22262F',
          700: '#1A1D24',
          800: '#111318',
          900: '#0B0D11',
          950: '#060709',
        },
      },
    },
  },
});

/**
 * Root application configuration.
 *
 * This is the "circuit breaker panel" of the Angular app — it wires together:
 * - Routing (which pages exist and how to navigate)
 * - HTTP client with interceptors (auth token + error handling)
 * - PrimeNG theming (Aura preset with our custom dark colors)
 * - Animations (required by PrimeNG for transitions)
 * - Global services (MessageService for toasts, ConfirmationService for dialogs)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Error listeners for uncaught errors
    provideBrowserGlobalErrorListeners(),

    // Router — defines which components render for which URLs
    provideRouter(routes),

    // HTTP client with interceptors — ORDER MATTERS:
    // 1. authInterceptor runs first (attaches JWT token)
    // 2. errorInterceptor runs second (catches HTTP errors)
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    // Animations — required by PrimeNG for smooth transitions
    provideAnimationsAsync(),

    // PrimeNG theme configuration — uses our custom dark preset
    providePrimeNG({
      theme: {
        preset: TodoAppPreset,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
      license:
        'eyJpZCI6IjFhZDExNmI1LTc1ODYtNDdiZC1hODYxLWRjMzYzYjc3YWJhMCIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODQ1Mjk2MDgsImV4cCI6MTgxNjA2NTYwOH0.K2q3cnpmhkA0JfZY0K-1HzZP01EWFW7nmFTVYk_4xg_u2555J_H-tau0bU0Je1e8zgz3NGQUkJUUHxsmULNbBA',
    }),

    // PrimeNG global services (injected by Toast and ConfirmDialog components)
    MessageService,
    ConfirmationService,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
