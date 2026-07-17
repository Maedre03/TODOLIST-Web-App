import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

/**
 * LoginComponent — the first page users see.
 *
 * Stub implementation — will be fully designed in Sub-Phase 6.3.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputText, Password, Button],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Login</h1>
        <p>Sign in to your account</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email">Email</label>
            <input pInputText id="email" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <p-password id="password" formControlName="password" [toggleMask]="true" [feedback]="false" placeholder="Enter password" />
          </div>
          <p-button type="submit" label="Sign In" [loading]="isLoading" [disabled]="form.invalid" styleClass="w-full" />
          <p class="link-text">Don't have an account? <a routerLink="/register">Register</a></p>
        </form>
        @if (errorMessage) {
          <p class="error-text">{{ errorMessage }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--surface-ground);
      padding: var(--space-4);
    }
    .login-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-lg);
      padding: var(--space-8);
      width: 100%;
      max-width: 420px;
      animation: fadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    h1 {
      margin-bottom: var(--space-1);
    }
    h1 + p {
      margin-bottom: var(--space-6);
    }
    .field {
      margin-bottom: var(--space-4);
    }
    .field label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-color-secondary);
      margin-bottom: var(--space-1);
    }
    .field input,
    .field :host ::ng-deep .p-password {
      width: 100%;
    }
    :host ::ng-deep .p-password {
      width: 100%;
    }
    :host ::ng-deep .p-password input {
      width: 100%;
    }
    .link-text {
      text-align: center;
      margin-top: var(--space-4);
      font-size: var(--font-size-sm);
    }
    .error-text {
      color: var(--color-danger);
      text-align: center;
      margin-top: var(--space-3);
      font-size: var(--font-size-sm);
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
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.form.value).subscribe({
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
