import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    ToastModule,
    ConfirmDialog
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isProfileUpdating = signal(false);
  isPasswordUpdating = signal(false);

  ngOnInit() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loadProfile();
  }

  loadProfile() {
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          username: profile.username,
          email: profile.email
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load profile.' });
      }
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.isProfileUpdating.set(true);
    this.userService.updateMyProfile(this.profileForm.value).subscribe({
      next: (profile) => {
        this.isProfileUpdating.set(false);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully.' });
        // Optionally update authService state if we store username/email there
      },
      error: (err) => {
        this.isProfileUpdating.set(false);
        const errMsg = err.error?.errors?.Email?.[0] || 'Could not update profile.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errMsg });
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.isPasswordUpdating.set(true);
    this.userService.changeMyPassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isPasswordUpdating.set(false);
        this.passwordForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully.' });
      },
      error: (err) => {
        this.isPasswordUpdating.set(false);
        const errMsg = err.error?.errors?.CurrentPassword?.[0] || 'Could not change password.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errMsg });
      }
    });
  }

  confirmDeleteAccount() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to permanently delete your account? This action cannot be undone.',
      header: 'Delete Account',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.userService.deleteMyAccount().subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete account.' });
          }
        });
      }
    });
  }
}
