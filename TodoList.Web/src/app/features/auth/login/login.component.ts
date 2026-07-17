import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../../core/services/auth.service';

/**
 * LoginComponent — the first page users see.
 *
 * Designed with a modern, split-screen SaaS aesthetic.
 * - Left side: Branding and abstract visual (hidden on mobile).
 * - Right side: Clean, focused login form.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  template: `
    <div class="auth-layout">
      <!-- Left Side: Branding / Visual -->
      <div class="auth-brand fade-in">
        <div class="brand-content">
          <div class="logo">
            <i class="pi pi-check-square"></i>
            <span>TaskFlow</span>
          </div>
          <h1>Manage your work with clarity and purpose.</h1>
          <p>The intelligent task manager designed for modern professionals.</p>
        </div>
        
        <!-- Abstract decorative shapes -->
        <div class="decorative-shape shape-1"></div>
        <div class="decorative-shape shape-2"></div>
      </div>

      <!-- Right Side: Form -->
      <div class="auth-form-container fade-in">
        <div class="auth-card">
          <div class="mobile-logo">
            <i class="pi pi-check-square text-primary text-3xl"></i>
          </div>
          <h2>Welcome back</h2>
          <p class="subtitle">Enter your details to access your account.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-wrapper">
            <div class="field">
              <label for="email">Email</label>
              <input 
                pInputText 
                id="email" 
                formControlName="email" 
                placeholder="name@company.com" 
                class="w-full p-inputtext-lg" />
            </div>

            <div class="field">
              <label for="password">Password</label>
              <p-password 
                id="password" 
                formControlName="password" 
                [toggleMask]="true" 
                [feedback]="false" 
                placeholder="Enter password"
                styleClass="w-full"
                inputStyleClass="w-full p-inputtext-lg" />
            </div>

            <div class="field-checkbox">
              <p-checkbox formControlName="rememberMe" [binary]="true" inputId="remember"></p-checkbox>
              <label for="remember" class="ml-2">Remember me for 30 days</label>
            </div>

            @if (errorMessage) {
              <div class="error-message fade-in">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <p-button 
              type="submit" 
              label="Sign In" 
              [loading]="isLoading" 
              [disabled]="form.invalid" 
              styleClass="w-full p-button-lg mt-2" />
          </form>

          <p class="auth-footer">
            Don't have an account? <a routerLink="/register">Sign up for free</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      min-height: 100vh;
      background: var(--surface-ground);
    }

    /* ── Left Side: Brand ── */
    .auth-brand {
      flex: 1;
      background: linear-gradient(135deg, var(--surface-section) 0%, var(--surface-card) 100%);
      border-right: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: var(--space-12);
      position: relative;
      overflow: hidden;
    }

    .brand-content {
      position: relative;
      z-index: 2;
      max-width: 480px;
      margin: 0 auto;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: var(--space-8);
    }

    .logo i {
      color: var(--primary-color);
      font-size: 2rem;
    }

    .auth-brand h1 {
      font-size: 3rem;
      line-height: 1.1;
      margin-bottom: var(--space-4);
      background: linear-gradient(to right, var(--text-color), var(--text-color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .auth-brand p {
      font-size: var(--font-size-lg);
      color: var(--text-color-secondary);
    }

    .decorative-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      z-index: 1;
      opacity: 0.15;
    }

    .shape-1 {
      width: 400px;
      height: 400px;
      background: var(--primary-color);
      top: -100px;
      right: -100px;
    }

    .shape-2 {
      width: 300px;
      height: 300px;
      background: var(--color-info);
      bottom: -50px;
      left: -50px;
    }

    /* ── Right Side: Form ── */
    .auth-form-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    .mobile-logo {
      display: none;
      margin-bottom: var(--space-6);
      text-align: center;
    }

    h2 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-2);
    }

    .subtitle {
      color: var(--text-color-secondary);
      margin-bottom: var(--space-8);
    }

    .form-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .field label {
      display: block;
      font-weight: 500;
      margin-bottom: var(--space-2);
      color: var(--text-color);
    }

    .field-checkbox {
      display: flex;
      align-items: center;
      color: var(--text-color-secondary);
      font-size: var(--font-size-sm);
    }

    .error-message {
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.2);
      color: var(--color-danger);
      padding: var(--space-3);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .auth-footer {
      margin-top: var(--space-8);
      text-align: center;
      color: var(--text-color-secondary);
    }

    .auth-footer a {
      font-weight: 600;
    }

    /* ── Responsive ── */
    @media (max-width: 992px) {
      .auth-brand {
        display: none;
      }
      .mobile-logo {
        display: block;
      }
      .auth-form-container {
        padding: var(--space-8);
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Extracting email and password (ignoring rememberMe for the API call)
    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/todos']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
      }
    });
  }
}
