import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { TagService } from '../../core/services/tag.service';
import { Tag } from '../../core/models/tag.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    FormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="layout-wrapper" 
         [class.sidebar-collapsed]="isSidebarCollapsed() && !isMobile()"
         [class.mobile-menu-open]="isMobileMenuOpen() && isMobile()">
      
      <!-- Mobile Backdrop -->
      <div class="mobile-backdrop" *ngIf="isMobile() && isMobileMenuOpen()" (click)="closeMobileMenu()"></div>

      <!-- Sidebar -->
      <aside class="layout-sidebar" [class.open]="isMobileMenuOpen() && isMobile()">
        <div class="sidebar-header">
          <div class="logo" *ngIf="!isSidebarCollapsed() || isMobile()">
            <i class="pi pi-check-square text-primary text-2xl"></i>
            <span class="logo-text">TaskFlow</span>
          </div>
          <button class="collapse-btn" (click)="toggleSidebar()" aria-label="Toggle Sidebar" *ngIf="!isMobile()">
            <i class="pi" [class.pi-angle-left]="!isSidebarCollapsed()" [class.pi-angle-right]="isSidebarCollapsed()"></i>
          </button>
          <button class="collapse-btn" (click)="closeMobileMenu()" aria-label="Close Sidebar" *ngIf="isMobile()">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list mb-4">
            <li>
              <a routerLink="/todos" routerLinkActive="active" class="nav-link" (click)="onNavClick()">
                <i class="pi pi-inbox"></i>
                <span class="nav-text" *ngIf="!isSidebarCollapsed() || isMobile()">All Tasks</span>
              </a>
            </li>
          </ul>

          <ng-container *ngIf="!isSidebarCollapsed() || isMobile()">
            <!-- Progress Section -->
            <div class="sidebar-section">
              <div class="section-header interactive" (click)="toggleSection('progress')" routerLink="/todos" [queryParams]="{ section: 'progress' }">
                <div class="flex align-items-center gap-2">
                  <i class="pi" [class.pi-chevron-down]="isProgressExpanded()" [class.pi-chevron-right]="!isProgressExpanded()"></i>
                  <h3 class="section-title mb-0">Today's Progress</h3>
                </div>
              </div>
              <div class="progress-panel" *ngIf="isProgressExpanded()">
                <div class="progress-ring-container">
                  <div class="progress-circle" style="--progress: 65%">
                    <span>65%</span>
                  </div>
                </div>
                <div class="progress-details">
                  <span class="stat-value">5 / 8</span>
                  <span class="stat-label">completed</span>
                  <div class="streak mt-1 text-xs font-medium">
                    <i class="pi pi-fire text-orange-500 mr-1"></i> 3 day streak
                  </div>
                </div>
              </div>
            </div>

            <!-- Upcoming Section -->
            <div class="sidebar-section">
              <div class="section-header interactive" (click)="toggleSection('upcoming')" routerLink="/todos" [queryParams]="{ section: 'upcoming' }">
                <div class="flex align-items-center gap-2">
                  <i class="pi" [class.pi-chevron-down]="isUpcomingExpanded()" [class.pi-chevron-right]="!isUpcomingExpanded()"></i>
                  <h3 class="section-title mb-0">Upcoming</h3>
                </div>
              </div>
              <ul class="nav-list small-list" *ngIf="isUpcomingExpanded()">
                <li>
                  <a href="javascript:void(0)" class="nav-link text-sm" (click)="onNavClick()">
                    <span class="pulse-dot mr-2"></span>
                    <span class="nav-text text-truncate" title="Submit quarterly report">Submit quarterly report</span>
                    <span class="date-badge overdue">Today</span>
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0)" class="nav-link text-sm" (click)="onNavClick()">
                    <i class="pi pi-calendar mr-2 text-color-secondary"></i>
                    <span class="nav-text text-truncate" title="Doctor appointment">Doctor appointment</span>
                    <span class="date-badge">Tom</span>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Tags Section -->
            <div class="sidebar-section">
              <div class="section-header interactive" (click)="toggleSection('tags')">
                <div class="flex align-items-center gap-2">
                  <i class="pi" [class.pi-chevron-down]="isTagsExpanded()" [class.pi-chevron-right]="!isTagsExpanded()"></i>
                  <h3 class="section-title mb-0">Tags</h3>
                </div>
                <button class="icon-btn" title="Add Tag" (click)="preventProp($event); openCreateTag()"><i class="pi pi-plus"></i></button>
              </div>
              <ul class="nav-list small-list" *ngIf="isTagsExpanded()">
                <li *ngFor="let tag of userTags()">
                  <a [routerLink]="['/todos']" [queryParams]="{ tagId: tag.id }" routerLinkActive="active" class="nav-link text-sm" (click)="onNavClick()">
                    <span class="color-dot mr-2" [style.backgroundColor]="tag.color"></span>
                    <span class="nav-text text-truncate flex-1" [title]="tag.name">{{ tag.name }}</span>
                    <button class="icon-btn delete-tag-btn ml-auto" (click)="preventProp($event); confirmDeleteTag(tag)" title="Delete tag">
                      <i class="pi pi-times text-xs"></i>
                    </button>
                  </a>
                </li>
                <li *ngIf="userTags().length === 0" class="text-xs text-color-secondary p-2 ml-4">
                  No tags yet
                </li>
              </ul>
            </div>

            <!-- Pinned Section -->
            <div class="sidebar-section">
              <div class="section-header interactive" (click)="toggleSection('pinned')" routerLink="/todos" [queryParams]="{ section: 'pinned' }">
                <div class="flex align-items-center gap-2">
                  <i class="pi" [class.pi-chevron-down]="isPinnedExpanded()" [class.pi-chevron-right]="!isPinnedExpanded()"></i>
                  <h3 class="section-title mb-0">Pinned</h3>
                </div>
              </div>
              <ul class="nav-list small-list" *ngIf="isPinnedExpanded()">
                <li>
                  <a href="javascript:void(0)" class="nav-link text-sm" (click)="onNavClick()">
                    <i class="pi pi-thumbtack mr-2 text-yellow-500"></i>
                    <span class="nav-text text-truncate">Buy groceries</span>
                  </a>
                </li>
              </ul>
            </div>
          </ng-container>
        </nav>

        <div class="sidebar-footer">
          <div class="settings-menu" *ngIf="!isSidebarCollapsed() || isMobile()">
            <button class="nav-link w-full flex align-items-center gap-3 mb-1" (click)="toggleTheme()">
              <i class="pi" [class.pi-moon]="themeService.isDarkMode()" [class.pi-sun]="!themeService.isDarkMode()"></i>
              <span>{{ themeService.isDarkMode() ? 'Dark Mode' : 'Light Mode' }}</span>
            </button>
            <button class="nav-link w-full flex align-items-center gap-3 logout-btn" (click)="logout()">
              <i class="pi pi-sign-out"></i>
              <span>Logout</span>
            </button>
          </div>
          <div class="settings-menu-collapsed" *ngIf="isSidebarCollapsed() && !isMobile()">
            <button class="icon-btn mb-2 w-full" (click)="toggleTheme()" [title]="themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode'">
               <i class="pi" [class.pi-moon]="themeService.isDarkMode()" [class.pi-sun]="!themeService.isDarkMode()"></i>
            </button>
            <button class="icon-btn text-danger w-full logout-icon" (click)="logout()" title="Logout">
               <i class="pi pi-sign-out"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="layout-main-container">
        <!-- Top Bar -->
        <header class="layout-topbar">
          <div class="topbar-left">
             <button class="mobile-menu-btn" *ngIf="isMobile()" (click)="toggleMobileMenu()" aria-label="Open Sidebar">
               <i class="pi pi-bars text-xl"></i>
             </button>
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

    <!-- Create Tag Dialog -->
    <p-dialog 
      header="Create New Tag" 
      [(visible)]="isCreateTagVisible" 
      [modal]="true" 
      [style]="{ width: '100%', maxWidth: '400px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="isCreateTagVisible = false">
      
      <div class="flex flex-column gap-3 mt-2">
        <div class="field">
          <label for="tagName" class="block font-medium mb-2">Name <span class="text-danger">*</span></label>
          <input 
            pInputText 
            id="tagName" 
            [(ngModel)]="newTagName" 
            placeholder="e.g. Work, Personal" 
            autofocus 
            class="w-full" />
        </div>

        <div class="field">
          <label class="block font-medium mb-2">Color</label>
          <div class="flex gap-2 flex-wrap">
            <button 
              *ngFor="let color of predefinedColors"
              class="color-btn"
              [style.backgroundColor]="color"
              [class.selected]="newTagColor === color"
              (click)="newTagColor = color">
              <i class="pi pi-check" *ngIf="newTagColor === color"></i>
            </button>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4 pt-4 border-top-1 surface-border">
          <p-button 
            type="button" 
            label="Cancel" 
            severity="secondary" 
            [text]="true" 
            (onClick)="isCreateTagVisible = false" />
          <p-button 
            type="button" 
            label="Create" 
            [disabled]="!newTagName.trim() || isSavingTag()" 
            [loading]="isSavingTag()"
            (onClick)="saveTag()" />
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--surface-ground);
      transition: all var(--transition-base);
      position: relative;
    }

    /* ── Mobile Backdrop ── */
    .mobile-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      z-index: 99;
      backdrop-filter: blur(2px);
      animation: fadeIn var(--transition-fast) forwards;
    }

    /* ── Sidebar ── */
    .layout-sidebar {
      width: var(--sidebar-width);
      background: var(--surface-section);
      border-right: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-base), transform var(--transition-base);
      position: fixed;
      height: 100vh;
      z-index: 100;
    }

    .layout-wrapper.sidebar-collapsed:not(.mobile-menu-open) .layout-sidebar {
      width: var(--sidebar-collapsed);
    }

    .layout-wrapper.sidebar-collapsed:not(.mobile-menu-open) .sidebar-header {
      padding: 0;
      justify-content: center;
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
      width: 32px;
      height: 32px;
      background: var(--surface-hover);
      border: 1px solid var(--surface-border);
      color: var(--text-color-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .collapse-btn:hover {
      background: var(--surface-card);
      color: var(--text-color);
      border-color: var(--primary-color);
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
      text-decoration: none;
      background: transparent;
      border: none;
      font-family: inherit;
      font-size: 0.95rem;
      cursor: pointer;
      width: 100%;
      text-align: left;
    }

    .nav-link:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    .nav-link.active {
      background: var(--surface-hover);
      color: var(--primary-color);
      border-left: 3px solid var(--primary-color);
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
    }

    .nav-link i {
      font-size: 1.1rem;
      min-width: 1.1rem;
    }

    /* ── New Sidebar Sections ── */
    .sidebar-section {
      padding: var(--space-2) var(--space-4);
      margin-bottom: var(--space-3);
    }
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }

    .section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-color-secondary);
      font-weight: 600;
      margin: 0 0 var(--space-2) 0;
    }

    .section-header.interactive {
      cursor: pointer;
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
      margin-left: calc(-1 * var(--space-2));
      margin-right: calc(-1 * var(--space-2));
      text-decoration: none;
      color: inherit;
    }

    .section-header.interactive:hover {
      background: var(--surface-hover);
    }

    .section-header.interactive i.pi-chevron-down,
    .section-header.interactive i.pi-chevron-right {
      color: var(--text-color-secondary);
      font-size: 0.7rem;
      transition: transform 0.2s;
    }

    .progress-panel {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background: var(--surface-card);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--surface-border);
    }

    .progress-ring-container {
      position: relative;
      width: 40px;
      height: 40px;
    }

    .progress-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(var(--primary-color) var(--progress), var(--surface-hover) 0deg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: bold;
    }
    .progress-circle::before {
      content: "";
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      background: var(--surface-card);
      z-index: 1;
    }
    .progress-circle span {
      position: relative;
      z-index: 2;
    }

    .progress-details {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-weight: 700;
      font-size: 0.9rem;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 0.7rem;
      color: var(--text-color-secondary);
    }

    .small-list .nav-link {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
    }
    
    .text-truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date-badge {
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 10px;
      background: var(--surface-hover);
      color: var(--text-color-secondary);
      margin-left: auto;
    }
    .date-badge.overdue {
      background: rgba(248, 113, 113, 0.1);
      color: var(--color-danger);
    }

    .color-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .bg-blue-500 { background-color: #3b82f6; }
    .bg-green-500 { background-color: #22c55e; }

    .pulse-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--color-danger);
      animation: pulse 2s infinite;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-color-secondary);
      cursor: pointer;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    .sidebar-footer {
      padding: var(--space-4) var(--space-2);
      border-top: 1px solid var(--surface-border);
    }

    .logout-btn:hover, .logout-icon:hover {
      color: var(--color-danger) !important;
    }

    /* ── Tag Dialog Styles ── */
    .color-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: transform 0.2s;
    }
    .color-btn:hover {
      transform: scale(1.1);
    }
    .color-btn.selected {
      border-color: var(--text-color);
    }
    .delete-tag-btn {
      opacity: 0;
      color: var(--text-color-secondary);
    }
    .delete-tag-btn:hover {
      color: var(--color-danger);
    }
    .nav-link:hover .delete-tag-btn {
      opacity: 1;
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

    .layout-wrapper.sidebar-collapsed:not(.mobile-menu-open) .layout-main-container {
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
      z-index: 90;
    }

    .mobile-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--text-color);
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);
    }

    .mobile-menu-btn:hover {
      background: var(--surface-hover);
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
      .layout-sidebar.open {
        transform: translateX(0);
        width: 280px;
      }
      .layout-main-container {
        margin-left: 0 !important;
      }
      .layout-content {
        padding: var(--space-4);
      }
      .layout-topbar {
        padding: 0 var(--space-4);
      }
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private readonly tagService = inject(TagService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  
  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  isMobile = signal(false);

  isProgressExpanded = signal(true);
  isUpcomingExpanded = signal(true);
  isTagsExpanded = signal(true);
  isPinnedExpanded = signal(true);

  userTags = signal<Tag[]>([]);

  // Tag creation state
  isCreateTagVisible = false;
  newTagName = '';
  newTagColor = '#3b82f6';
  isSavingTag = signal(false);

  predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
  ];

  ngOnInit() {
    this.checkMobile();
    this.loadTags();
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.userTags.set(res.data);
        }
      }
    });
  }

  openCreateTag(): void {
    this.newTagName = '';
    this.newTagColor = this.predefinedColors[7]; // Default to blue
    this.isCreateTagVisible = true;
  }

  saveTag(): void {
    if (!this.newTagName.trim()) return;

    this.isSavingTag.set(true);
    this.tagService.createTag({ name: this.newTagName.trim(), color: this.newTagColor }).subscribe({
      next: () => {
        this.isSavingTag.set(false);
        this.isCreateTagVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Tag Created', detail: 'New tag added successfully.' });
        this.loadTags();
      },
      error: () => {
        this.isSavingTag.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create tag.' });
      }
    });
  }

  confirmDeleteTag(tag: Tag): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the tag "${tag.name}"? This will remove it from all tasks.`,
      header: 'Confirm Delete Tag',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.tagService.deleteTag(tag.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Tag Deleted', detail: 'Tag removed successfully.' });
            this.loadTags();
            // In a real app we might also need to tell the todo list to refresh if we're filtering by this tag.
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tag.' });
          }
        });
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
    if (!this.isMobile() && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  private checkMobile() {
    this.isMobile.set(window.innerWidth <= 768);
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  onNavClick() {
    if (this.isMobile()) {
      this.closeMobileMenu();
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
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

  toggleSection(section: 'progress' | 'upcoming' | 'tags' | 'pinned') {
    if (section === 'progress') this.isProgressExpanded.update(v => !v);
    else if (section === 'upcoming') this.isUpcomingExpanded.update(v => !v);
    else if (section === 'tags') this.isTagsExpanded.update(v => !v);
    else if (section === 'pinned') this.isPinnedExpanded.update(v => !v);
  }

  preventProp(event: Event) {
    event.stopPropagation();
  }
}
