import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

/**
 * RegisterComponent — user registration page.
 *
 * Designed with a modern, split-screen SaaS aesthetic.
 * - Left side: Branding and abstract visual (hidden on mobile).
 * - Right side: Clean, focused registration form.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    InputTextModule, 
    PasswordModule, 
    ButtonModule
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
          <h1>Join the next generation of task management.</h1>
          <p>Organize your work, boost your productivity, and achieve your goals with ease.</p>

          <ul class="feature-list">
            <li>
              <i class="pi pi-check-circle text-primary"></i>
              <span>Smart Kanban boards for visual workflow</span>
            </li>
            <li>
              <i class="pi pi-check-circle text-primary"></i>
              <span>Optimistic UI updates for blazing speed</span>
            </li>
            <li>
              <i class="pi pi-check-circle text-primary"></i>
              <span>Robust filtering and progress tracking</span>
            </li>
          </ul>

          <div class="stats-container">
            <div class="stat-box">
              <div class="stat-number">10k+</div>
              <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">2M+</div>
              <div class="stat-label">Tasks Done</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">Uptime</div>
            </div>
          </div>
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
          <h2>Create an account</h2>
          <p class="subtitle">Start managing your tasks for free today.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-wrapper">
            <div class="field">
              <label for="username">Username</label>
              <input 
                pInputText 
                id="username" 
                formControlName="username" 
                placeholder="johndoe" 
                class="w-full p-inputtext-lg" />
            </div>

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
                placeholder="Min. 6 characters"
                styleClass="w-full"
                inputStyleClass="w-full p-inputtext-lg" />
            </div>

            <div class="field">
              <label for="confirmPassword">Confirm Password</label>
              <p-password 
                id="confirmPassword" 
                formControlName="confirmPassword" 
                [toggleMask]="true" 
                placeholder="Confirm your password"
                styleClass="w-full"
                inputStyleClass="w-full p-inputtext-lg" />
              @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
                <small class="error-text">Passwords do not match.</small>
              }
            </div>

            @if (errorMessage) {
              <div class="error-message fade-in">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <p-button 
              type="submit" 
              label="Sign Up" 
              [loading]="isLoading" 
              [disabled]="form.invalid" 
              styleClass="w-full p-button-lg mt-2" />
          </form>

          <p class="auth-footer">
            Already have an account? <a routerLink="/login">Sign in here</a>
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
      margin-bottom: var(--space-6);
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-8) 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .feature-list li {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: 1.05rem;
      color: var(--text-color);
    }

    .feature-list i {
      font-size: 1.25rem;
    }

    .stats-container {
      display: flex;
      gap: var(--space-6);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      backdrop-filter: blur(10px);
    }

    .stat-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: () => {
        // Auto-login after successful registration
        this.authService.login({ email: this.form.value.email, password: this.form.value.password }).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/todos']);
          },
          error: () => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Account Created',
              detail: 'Registration successful! Please sign in.',
              life: 4000
            });
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
