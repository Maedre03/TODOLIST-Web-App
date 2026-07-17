import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  JwtPayload
} from '../models/auth.model';

/**
 * Key used to store the JWT token in localStorage.
 * Using a descriptive key avoids collision with other apps on the same domain.
 */
const TOKEN_KEY = 'todo_app_token';

/**
 * AuthService — handles all authentication logic.
 *
 * Responsibilities:
 * - Login / Register API calls
 * - JWT token storage in localStorage
 * - Token expiry checking
 * - Exposing reactive authentication state via signals
 * - Decoding JWT payload to extract user info
 *
 * Design decision: We use Angular signals (not BehaviorSubject) for reactive
 * state because Angular 22 promotes signal-first architecture.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /**
   * Internal signal holding the current JWT token.
   * null = not authenticated.
   */
  private readonly tokenSignal = signal<string | null>(this.getStoredToken());

  /**
   * Computed signal — true if the user has a valid (non-expired) token.
   * Components can use this reactively: `authService.isAuthenticated()`
   */
  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    if (!token) return false;
    return !this.isTokenExpired(token);
  });

  /**
   * Computed signal — returns decoded user info from the JWT payload.
   * Returns null if not authenticated.
   */
  readonly currentUser = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    return this.decodeToken(token);
  });

  /**
   * Logs in the user by sending credentials to the backend.
   * On success, stores the JWT token and updates the reactive signal.
   *
   * @param credentials - Email and password
   * @returns Observable of LoginResponse
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.token);
        })
      );
  }

  /**
   * Registers a new user account.
   * Does NOT auto-login — the user must log in after registering.
   *
   * @param data - Username, email, and password
   * @returns Observable of RegisterResponse (contains the new user's ID)
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/auth/register`,
      data
    );
  }

  /**
   * Logs out the user by clearing the token and navigating to the login page.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Returns the raw JWT token string.
   * Used by the auth interceptor to attach the token to HTTP headers.
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  // ─── Private helpers ──────────────────────────────────────────

  /**
   * Stores the token in localStorage and updates the signal.
   */
  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  /**
   * Reads the token from localStorage on app startup.
   * Called once during service initialization.
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null; // SSR safety
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Decodes a JWT token payload (the middle segment).
   * JWTs are Base64URL-encoded, so we decode without a library.
   *
   * Structure: header.payload.signature
   * We only need the payload part.
   */
  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Checks if a JWT token has expired by comparing the `exp` claim
   * to the current time. Adds a 60-second buffer to handle clock skew.
   */
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now + 60; // 60s buffer
  }
}
