import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * AppLayoutComponent — the main application shell.
 *
 * This wraps all authenticated pages with:
 * - Sidebar navigation (left)
 * - Top bar (top)
 * - Content area (center) via <router-outlet>
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-wrapper" [class.sidebar-collapsed]="isSidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="layout-sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <i class="pi pi-check-square text-primary text-2xl"></i>
            <span class="logo-text" *ngIf="!isSidebarCollapsed()">TaskFlow</span>
          </div>
          <button class="collapse-btn" (click)="toggleSidebar()" aria-label="Toggle Sidebar">
            <i class="pi" [class.pi-angle-left]="!isSidebarCollapsed()" [class.pi-angle-right]="isSidebarCollapsed()"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li>
              <a routerLink="/todos" routerLinkActive="active" class="nav-link">
                <i class="pi pi-list"></i>
                <span class="nav-text" *ngIf="!isSidebarCollapsed()">All Tasks</span>
              </a>
            </li>
            <!-- Placeholder for future filters -->
            <li>
              <a routerLink="/todos" [queryParams]="{ filter: 'active' }" routerLinkActive="active" class="nav-link">
                <i class="pi pi-clock"></i>
                <span class="nav-text" *ngIf="!isSidebarCollapsed()">Active</span>
              </a>
            </li>
            <li>
              <a routerLink="/todos" [queryParams]="{ filter: 'completed' }" routerLinkActive="active" class="nav-link">
                <i class="pi pi-check-circle"></i>
                <span class="nav-text" *ngIf="!isSidebarCollapsed()">Completed</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <button class="nav-link logout-btn" (click)="logout()">
            <i class="pi pi-sign-out"></i>
            <span class="nav-text" *ngIf="!isSidebarCollapsed()">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="layout-main-container">
        <!-- Top Bar -->
        <header class="layout-topbar">
          <div class="topbar-left">
             <!-- Mobile menu toggle could go here -->
          </div>
          <div class="topbar-right">
             <div class="user-profile" *ngIf="authService.currentUser() as user">
                <div class="avatar">
                  {{ getInitials(user.email) }}
                </div>
                <div class="user-info" *ngIf="!isMobile()">
                   <span class="user-name">{{ getDisplayName(user.email) }}</span>
                   <span class="user-email text-secondary text-xs">{{ user.email }}</span>
                </div>
             </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="layout-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--surface-ground);
      transition: all var(--transition-base);
    }

    /* ── Sidebar ── */
    .layout-sidebar {
      width: var(--sidebar-width);
      background: var(--surface-section);
      border-right: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-base);
      position: fixed;
      height: 100vh;
      z-index: 100;
    }

    .layout-wrapper.sidebar-collapsed .layout-sidebar {
      width: var(--sidebar-collapsed);
    }

    .sidebar-header {
      height: var(--topbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-4);
      border-bottom: 1px solid var(--surface-border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 700;
      font-size: var(--font-size-md);
      color: var(--text-color);
      overflow: hidden;
      white-space: nowrap;
    }

    .collapse-btn {
      background: transparent;
      border: none;
      color: var(--text-color-secondary);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast), color var(--transition-fast);
    }

    .collapse-btn:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--space-4) 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0 var(--space-2);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      color: var(--text-color-secondary);
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: all var(--transition-fast);
      overflow: hidden;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    .nav-link.active {
      background: var(--surface-hover);
      color: var(--primary-color);
    }

    .nav-link i {
      font-size: 1.1rem;
      min-width: 1.1rem; /* Ensure icon doesn't shrink when collapsed */
    }

    .sidebar-footer {
      padding: var(--space-4) var(--space-2);
      border-top: 1px solid var(--surface-border);
    }

    .logout-btn {
      width: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      text-align: left;
    }

    .logout-btn:hover {
      color: var(--color-danger);
    }

    /* ── Main Container ── */
    .layout-main-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: margin-left var(--transition-base);
      min-height: 100vh;
    }

    .layout-wrapper.sidebar-collapsed .layout-main-container {
      margin-left: var(--sidebar-collapsed);
    }

    /* ── Top Bar ── */
    .layout-topbar {
      height: var(--topbar-height);
      background: var(--surface-ground);
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-6);
      position: sticky;
      top: 0;
      z-index: 99;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background: var(--primary-color);
      color: var(--primary-color-text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-sm);
      text-transform: uppercase;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      line-height: 1.2;
    }

    /* ── Content ── */
    .layout-content {
      flex: 1;
      padding: var(--space-6);
      overflow-x: hidden;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .layout-sidebar {
        transform: translateX(-100%);
      }
      .layout-wrapper.sidebar-collapsed .layout-sidebar {
        transform: translateX(0);
      }
      .layout-main-container {
        margin-left: 0 !important;
      }
      .layout-content {
        padding: var(--space-4);
      }
    }
  `]
})
export class AppLayoutComponent {
  authService = inject(AuthService);
  
  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  }

  getDisplayName(email: string): string {
    if (!email) return 'User';
    return email.split('@')[0];
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
}
