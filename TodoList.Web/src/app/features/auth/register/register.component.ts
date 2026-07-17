import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

/**
 * RegisterComponent — user registration page.
 *
 * Stub implementation — will be fully designed in Sub-Phase 6.3.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputText, Password, Button],
  template: `
    <div class="register-page">
      <div class="register-card">
        <h1>Create Account</h1>
        <p>Sign up to start managing your tasks</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="username">Username</label>
            <input pInputText id="username" formControlName="username" placeholder="johndoe" />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input pInputText id="email" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <p-password id="password" formControlName="password" [toggleMask]="true" placeholder="Min. 6 characters" />
          </div>
          <p-button type="submit" label="Create Account" [loading]="isLoading" [disabled]="form.invalid" styleClass="w-full" />
          <p class="link-text">Already have an account? <a routerLink="/login">Sign In</a></p>
        </form>
        @if (errorMessage) {
          <p class="error-text">{{ errorMessage }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--surface-ground);
      padding: var(--space-4);
    }
    .register-card {
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
    .field input {
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
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  isLoading = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Account Created',
          detail: 'Registration successful! Please sign in.',
          life: 4000
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
