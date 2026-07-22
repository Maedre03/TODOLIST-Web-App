import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUpload } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TodoService } from '../../../core/services/todo.service';
import { TagService } from '../../../core/services/tag.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Todo, TodoPagedParams, CreateTodoRequest, UpdateTodoRequest, Priority } from '../../../core/models/todo.model';
import { Tag } from '../../../core/models/tag.model';
import { TodoItemComponent } from '../components/todo-item.component';
import { TodoFormComponent } from '../components/todo-form.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    DatePickerModule,
    TodoItemComponent,
    TodoFormComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="todo-list-page fade-in">
      <div class="page-header">
        <div class="header-content">
          <h1>My Tasks</h1>
          <p class="text-secondary">Manage and track your daily goals.</p>
        </div>
        <div class="header-actions">
          <p-button 
            label="Export" 
            icon="pi pi-download" 
            (onClick)="exportTasks()" 
            styleClass="p-button-secondary p-button-outlined hidden md:inline-flex" />
          
          <p-button 
            label="Import" 
            icon="pi pi-upload"
            (onClick)="fileInput.click()"
            styleClass="p-button-secondary p-button-outlined hidden md:inline-flex" />
          <input #fileInput type="file" accept=".csv" style="display: none;" (change)="onFileSelected($event)" />

          <p-button 
            label="New Task" 
            icon="pi pi-plus" 
            (onClick)="openCreateForm()" 
            styleClass="p-button-primary hidden md:inline-flex" />
        </div>
      </div>

      <!-- Controls (Search & Sort) & View Switcher -->
      <div class="controls-bar">
        <p-iconfield iconPosition="left" class="search-input">
          <p-inputicon>
            <i class="pi pi-search"></i>
          </p-inputicon>
          <input 
            #searchInput
            pInputText 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search tasks... (/)" 
            class="w-full" />
        </p-iconfield>

        <p-select 
          [options]="sortOptions" 
          [(ngModel)]="selectedSort" 
          (ngModelChange)="onSortChange()"
          optionLabel="label" 
          optionValue="value"
          placeholder="Sort By" />

        <p-select
          [options]="tagOptions()"
          [(ngModel)]="selectedTagId"
          (ngModelChange)="onTagChange()"
          optionLabel="name"
          optionValue="id"
          placeholder="Filter by Tag"
          [showClear]="true" />

        <p-datepicker 
          [ngModel]="dateRange()" 
          selectionMode="range" 
          [readonlyInput]="true" 
          placeholder="Filter by Due Date" 
          (ngModelChange)="dateRange.set($event); onDateRangeChange()" 
          [showButtonBar]="true" />

        <!-- View Switcher -->
        <div class="view-switcher ml-auto md:ml-0">
          <button class="icon-btn" [class.active]="viewMode() === 'list'" (click)="setViewMode('list')" title="List View">
            <i class="pi pi-list"></i>
          </button>
          <button class="icon-btn" [class.active]="viewMode() === 'kanban'" (click)="setViewMode('kanban')" title="Kanban View">
            <i class="pi pi-th-large"></i>
          </button>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="activeTab() === 'all'" (click)="setTab('all')">All</button>
        <button class="tab-btn" [class.active]="activeTab() === 'active'" (click)="setTab('active')">Active</button>
        <button class="tab-btn" [class.active]="activeTab() === 'completed'" (click)="setTab('completed')">Completed</button>
        <button class="tab-btn" [class.active]="activeTab() === 'overdue'" (click)="setTab('overdue')">Overdue <span class="badge" *ngIf="overdueCount() > 0">{{ overdueCount() }}</span></button>
      </div>

      <!-- Main Content Area -->
      <div class="list-container">
        <!-- Loading State -->
        @if (isLoading()) {
          <app-loading-skeleton [count]="pageSize" />
        } 
        <!-- Empty State -->
        @else if (filteredTodos().length === 0) {
          <app-empty-state 
            [title]="searchTerm || activeTab() !== 'all' ? 'No matches found' : 'You\\'re all caught up!'"
            [subtitle]="searchTerm || activeTab() !== 'all' ? 'Try adjusting your search terms or filters.' : 'You have no tasks. Enjoy your day or create a new one.'"
            [actionLabel]="searchTerm || activeTab() !== 'all' ? undefined : 'Create your first task'"
            (action)="openCreateForm()" />
        }
        <!-- List View -->
        @else if (viewMode() === 'list') {
          <div class="todo-grid">
            @for (todo of filteredTodos(); track todo.id) {
              <app-todo-item 
                class="stagger-item"
                [todo]="todo"
                (toggle)="onToggleComplete($event)"
                (edit)="openEditForm($event)"
                (delete)="confirmDelete($event)"
                (view)="openDetail($event)" />
            }
          </div>

          <!-- Pagination -->
          <div class="pagination-wrapper" *ngIf="activeTab() !== 'overdue'">
            <p-paginator 
              (onPageChange)="onPageChange($event)" 
              [first]="(currentPage - 1) * pageSize" 
              [rows]="pageSize" 
              [totalRecords]="totalItems()" 
              [rowsPerPageOptions]="[5, 10, 20]" />
          </div>
        }
        <!-- Kanban View -->
        @else if (viewMode() === 'kanban') {
          <div class="kanban-board" [class.reverse-columns]="isLowestPrioritySort">
            <!-- Critical Priority Column -->
            <div class="kanban-column">
              <div class="column-header">
                <h3>Critical</h3>
                <span class="count">{{ kanbanCritical().length }}</span>
              </div>
              <div class="kanban-drop-list"
                   cdkDropList
                   #criticalList="cdkDropList"
                   [cdkDropListData]="kanbanCritical()"
                   [cdkDropListConnectedTo]="[highList, mediumList, lowList]"
                   (cdkDropListDropped)="onKanbanDrop($event, 4)">
                @for (todo of kanbanCritical(); track todo.id) {
                  <div class="kanban-card" cdkDrag>
                    <app-todo-item 
                      [todo]="todo"
                      (toggle)="onToggleComplete($event)"
                      (edit)="openEditForm($event)"
                      (delete)="confirmDelete($event)"
                      (view)="openDetail($event)" />
                  </div>
                }
              </div>
            </div>

            <!-- High Priority Column -->
            <div class="kanban-column">
              <div class="column-header">
                <h3>High Priority</h3>
                <span class="count">{{ kanbanHigh().length }}</span>
              </div>
              <div class="kanban-drop-list"
                   cdkDropList
                   #highList="cdkDropList"
                   [cdkDropListData]="kanbanHigh()"
                   [cdkDropListConnectedTo]="[criticalList, mediumList, lowList]"
                   (cdkDropListDropped)="onKanbanDrop($event, 3)">
                @for (todo of kanbanHigh(); track todo.id) {
                  <div class="kanban-card" cdkDrag>
                    <app-todo-item 
                      [todo]="todo"
                      (toggle)="onToggleComplete($event)"
                      (edit)="openEditForm($event)"
                      (delete)="confirmDelete($event)"
                      (view)="openDetail($event)" />
                  </div>
                }
              </div>
            </div>

            <!-- Medium Priority Column -->
            <div class="kanban-column">
              <div class="column-header">
                <h3>Medium Priority</h3>
                <span class="count">{{ kanbanMedium().length }}</span>
              </div>
              <div class="kanban-drop-list"
                   cdkDropList
                   #mediumList="cdkDropList"
                   [cdkDropListData]="kanbanMedium()"
                   [cdkDropListConnectedTo]="[criticalList, highList, lowList]"
                   (cdkDropListDropped)="onKanbanDrop($event, 2)">
                @for (todo of kanbanMedium(); track todo.id) {
                  <div class="kanban-card" cdkDrag>
                    <app-todo-item 
                      [todo]="todo"
                      (toggle)="onToggleComplete($event)"
                      (edit)="openEditForm($event)"
                      (delete)="confirmDelete($event)"
                      (view)="openDetail($event)" />
                  </div>
                }
              </div>
            </div>

            <!-- Low Priority Column -->
            <div class="kanban-column">
              <div class="column-header">
                <h3>Low Priority</h3>
                <span class="count">{{ kanbanLow().length }}</span>
              </div>
              <div class="kanban-drop-list"
                   cdkDropList
                   #lowList="cdkDropList"
                   [cdkDropListData]="kanbanLow()"
                   [cdkDropListConnectedTo]="[criticalList, highList, mediumList]"
                   (cdkDropListDropped)="onKanbanDrop($event, 1)">
                @for (todo of kanbanLow(); track todo.id) {
                  <div class="kanban-card" cdkDrag>
                    <app-todo-item 
                      [todo]="todo"
                      (toggle)="onToggleComplete($event)"
                      (edit)="openEditForm($event)"
                      (delete)="confirmDelete($event)"
                      (view)="openDetail($event)" />
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Create/Edit Form Dialog -->
    <app-todo-form 
      [visible]="isFormVisible" 
      (visibleChange)="isFormVisible = $event"
      [todoToEdit]="todoToEdit"
      [isSaving]="isSaving()"
      [userTags]="userTags()"
      (save)="onSaveForm($event)" />

    <!-- Floating Action Button (Mobile Only) -->
    <div class="fab-container md:hidden">
      <p-button 
        icon="pi pi-plus" 
        [rounded]="true" 
        size="large" 
        (onClick)="openCreateForm()" 
        styleClass="p-button-primary shadow-6" />
    </div>
  `,
  styles: [`
    .todo-list-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin-bottom: var(--space-1);
    }

    .header-actions {
      display: flex;
      gap: var(--space-4);
      align-items: center;
    }
    
    .header-actions p-button {
      margin-left: var(--space-3);
    }

    .controls-bar {
      display: flex;
      gap: var(--space-4);
      align-items: center;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 250px;
      position: relative;
    }

    ::ng-deep .search-input .p-iconfield {
      width: 100%;
    }

    /* ── View Switcher ── */
    .view-switcher {
      display: flex;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    
    .view-switcher .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-color-secondary);
      padding: var(--space-2) var(--space-3);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    
    .view-switcher .icon-btn:hover {
      background: var(--surface-hover);
    }
    
    .view-switcher .icon-btn.active {
      background: var(--primary-color);
      color: var(--primary-color-text);
    }

    /* ── Filter Tabs ── */
    .filter-tabs {
      display: flex;
      gap: var(--space-4);
      border-bottom: 1px solid var(--surface-border);
      margin-top: var(--space-2);
      overflow-x: auto;
      scrollbar-width: none;
    }
    
    .filter-tabs::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-color-secondary);
      font-weight: 500;
      font-size: 0.95rem;
      padding: var(--space-3) 0;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: var(--text-color);
    }

    .tab-btn.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .badge {
      background: var(--color-danger);
      color: #fff;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: bold;
    }

    /* ── Main List Container ── */
    .list-container {
      display: flex;
      flex-direction: column;
      min-height: 400px;
    }

    .todo-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    /* ── Kanban Board ── */
    .kanban-board {
      display: flex;
      gap: var(--space-4);
      align-items: flex-start;
      overflow-x: auto;
      padding-bottom: var(--space-4);
    }

    .kanban-board.reverse-columns {
      flex-direction: row-reverse;
    }

    .kanban-column {
      flex: 1;
      min-width: 0;
      background: var(--surface-section);
      border-radius: var(--radius-lg);
      border: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      max-height: 70vh;
    }

    .column-header {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .column-header h3 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-color-secondary);
    }

    .column-header .count {
      background: var(--surface-hover);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .kanban-drop-list {
      flex: 1;
      padding: var(--space-3);
      overflow-y: auto;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .kanban-card {
      cursor: grab;
    }

    .kanban-card:active {
      cursor: grabbing;
    }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: var(--radius-md);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      opacity: 0.9;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .kanban-drop-list.cdk-drop-list-dragging .kanban-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* ── Pagination ── */
    .pagination-wrapper {
      margin-top: var(--space-6);
      display: flex;
      justify-content: center;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .controls-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .view-switcher {
        margin-left: 0;
        align-self: flex-start;
      }
      .kanban-board {
        flex-direction: column;
        align-items: stretch;
      }
      .kanban-board.reverse-columns {
        flex-direction: column-reverse;
      }
      .kanban-column {
        max-height: none;
      }
      .hidden.md\\:inline-flex {
        display: none !important;
      }
    }

    .fab-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
    }
  `]
})
export class TodoListComponent implements OnInit, OnDestroy {
  private readonly todoService = inject(TodoService);
  private readonly tagService = inject(TagService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly notificationService = inject(NotificationService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // State
  todos = signal<Todo[]>([]);
  userTags = signal<Tag[]>([]);
  totalItems = signal<number>(0);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  // View & Tabs
  viewMode = signal<'list' | 'kanban'>('list');
  activeTab = signal<'all' | 'active' | 'completed' | 'overdue'>('all');

  // Computed state for UI
  filteredTodos = computed(() => {
    let list = this.todos();
    if (this.activeTab() === 'overdue') {
      const now = new Date();
      return list.filter(t => {
        if (!t.dueDate || t.isCompleted) return false;
        const due = new Date(t.dueDate);
        return due < now;
      });
    }
    return list;
  });

  overdueCount = computed(() => {
    const now = new Date();
    return this.todos().filter(t => {
      if (!t.dueDate || t.isCompleted) return false;
      const due = new Date(t.dueDate);
      return due < now;
    }).length;
  });

  // Kanban lists
  kanbanCritical = computed(() => this.filteredTodos().filter(t => t.priority === Priority.Critical));
  kanbanHigh = computed(() => this.filteredTodos().filter(t => t.priority === Priority.High));
  kanbanMedium = computed(() => this.filteredTodos().filter(t => t.priority === Priority.Medium));
  kanbanLow = computed(() => this.filteredTodos().filter(t => t.priority === Priority.Low));

  // Pagination & Filtering Params
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  isCompletedFilter?: boolean;
  selectedTagId?: string;
  dateRange = signal<Date[] | null>(null);
  
  private searchSubject = new Subject<string>();

  tagOptions = computed(() => {
    return this.userTags();
  });

  // Sorting
  sortOptions = [
    { label: 'Newest First', value: { sortBy: 'CreatedAt', desc: true } },
    { label: 'Oldest First', value: { sortBy: 'CreatedAt', desc: false } },
    { label: 'Highest Priority', value: { sortBy: 'Priority', desc: true } },
    { label: 'Lowest Priority', value: { sortBy: 'Priority', desc: false } }
  ];
  selectedSort = this.sortOptions[0].value;

  get isLowestPrioritySort(): boolean {
    return this.selectedSort.sortBy === 'Priority' && !this.selectedSort.desc;
  }

  // Form Dialog State
  isFormVisible = false;
  todoToEdit: Todo | null = null;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // If user is typing in an input/textarea, don't trigger shortcuts unless it's Escape
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (event.key === 'Escape') {
      if (this.isFormVisible) {
        this.isFormVisible = false;
      } else if (isInput && target.tagName === 'INPUT') {
        (target as HTMLInputElement).blur();
      }
      return;
    }

    if (isInput) return;

    if (event.key.toLowerCase() === 'n') {
      event.preventDefault();
      this.openCreateForm();
    }

    if (event.key === '/') {
      event.preventDefault();
      this.searchInput?.nativeElement?.focus();
    }
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  ngOnInit(): void {
    const savedMode = localStorage.getItem('todo_view_mode') as 'list' | 'kanban';
    if (savedMode) {
      this.viewMode.set(savedMode);
    }

    const savedTab = localStorage.getItem('todo_active_tab') as 'all' | 'active' | 'completed' | 'overdue';
    if (savedTab) {
      this.activeTab.set(savedTab);
    }
    if (this.viewMode() === 'kanban') this.pageSize = 50;

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadTodos();
    });

    this.tagService.tags$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tags => {
      this.userTags.set(tags);
    });

    this.loadTags();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['tagId']) {
        this.selectedTagId = params['tagId'];
      } else if (params['searchTerm']) {
        this.searchTerm = params['searchTerm'];
      }
      this.loadTodos();
    });
  }

  loadTags(): void {
    this.tagService.getTags().subscribe();
  }

  onTagChange(): void {
    this.currentPage = 1;
    this.loadTodos();
  }

  // ─── Controls ──────────────────────────────────────────────

  setTab(tab: 'all' | 'active' | 'completed' | 'overdue'): void {
    this.activeTab.set(tab);
    localStorage.setItem('todo_active_tab', tab);
    if (tab === 'all') {
      this.isCompletedFilter = undefined;
    } else if (tab === 'active') {
      this.isCompletedFilter = false;
    } else if (tab === 'completed') {
      this.isCompletedFilter = true;
    } else if (tab === 'overdue') {
      this.isCompletedFilter = false;
    }
    this.currentPage = 1;
    this.loadTodos();
  }

  setViewMode(mode: 'list' | 'kanban'): void {
    this.viewMode.set(mode);
    localStorage.setItem('todo_view_mode', mode);
    if (mode === 'kanban') {
      this.pageSize = 50;
      this.currentPage = 1;
      this.loadTodos();
    } else {
      this.pageSize = 10;
      this.currentPage = 1;
      this.loadTodos();
    }
  }

  // ─── Data Loading ──────────────────────────────────────────

  loadTodos(): void {
    this.isLoading.set(true);

    let startIso: string | undefined;
    let endIso: string | undefined;
    const range = this.dateRange();
    if (range && range.length > 0) {
      if (range[0]) {
        const start = new Date(range[0]);
        start.setHours(0, 0, 0, 0);
        startIso = start.toISOString();

        // If no end date is selected yet, use the start date to filter for that single day
        const end = range[1] ? new Date(range[1]) : new Date(range[0]);
        end.setHours(23, 59, 59, 999);
        endIso = end.toISOString();
      }
    }

    const params: TodoPagedParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
      sortBy: this.selectedSort.sortBy,
      sortDescending: this.selectedSort.desc,
      isCompleted: this.isCompletedFilter,
      startDate: startIso,
      endDate: endIso,
      tagId: this.selectedTagId
    };

    this.todoService.getPaged(params).subscribe({
      next: (result) => {
        this.todos.set(result.items);
        this.totalItems.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadTodos();
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
    this.loadTodos();
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage = (event.page || 0) + 1;
    this.pageSize = event.rows || 10;
    this.loadTodos();
  }

  // ─── Actions ───────────────────────────────────────────────

  onKanbanDrop(event: CdkDragDrop<Todo[]>, newPriority: Priority): void {
    if (event.previousContainer === event.container) {
      // Reordering within same column (client-side visual only since backend lacks ordering)
      const currentList = [...event.container.data];
      moveItemInArray(currentList, event.previousIndex, event.currentIndex);
    } else {
      // Moving between priority columns
      const todo = event.previousContainer.data[event.previousIndex];
      const previousPriority = todo.priority;

      // Optimistic update
      this.todos.update(current =>
        current.map(t => t.id === todo.id ? { ...t, priority: newPriority } : t)
      );

      const updateReq: UpdateTodoRequest = {
        title: todo.title,
        description: todo.description || '',
        priority: newPriority,
        dueDate: todo.dueDate,
        recurrence: todo.recurrence,
        tagIds: todo.tags?.map(t => t.id) || []
      };

      this.todoService.update(todo.id, updateReq).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Priority Updated', detail: 'Task moved successfully.', life: 2000 });
        },
        error: () => {
          this.todos.update(current =>
            current.map(t => t.id === todo.id ? { ...t, priority: previousPriority } : t)
          );
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to move task.', life: 3000 });
        }
      });
    }
  }

  // --- Export / Import ---

  exportTasks() {
    this.todoService.exportTodos().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todos-export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not export tasks' });
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    this.todoService.importTodos(file).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Tasks imported successfully' });
        this.loadTodos();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not import tasks' });
      }
    });
  }

  onToggleComplete(todo: Todo): void {
    const previousState = todo.isCompleted;
    this.todos.update(current =>
      current.map(t => t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t)
    );

    this.todoService.toggleComplete(todo.id).subscribe({
      next: () => {
        const status = !previousState ? 'completed' : 'uncompleted';
        this.messageService.add({ severity: 'success', summary: 'Task Updated', detail: `Task marked as ${status}.`, life: 2000 });
      },
      error: () => {
        this.todos.update(current =>
          current.map(t => t.id === todo.id ? { ...t, isCompleted: previousState } : t)
        );
      }
    });
  }

  openDetail(todo: Todo): void {
    this.router.navigate(['/todos', todo.id]);
  }

  confirmDelete(todo: Todo): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${todo.title}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.deleteTodo(todo.id)
    });
  }

  private deleteTodo(id: string): void {
    this.todoService.delete(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Task deleted successfully.', life: 3000 });
        if (this.todos().length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadTodos();
        this.notificationService.refresh();
      }
    });
  }

  // ─── Form Dialog ───────────────────────────────────────────

  openCreateForm(): void {
    this.todoToEdit = null;
    this.isFormVisible = true;
  }

  openEditForm(todo: Todo): void {
    this.todoToEdit = todo;
    this.isFormVisible = true;
  }

  onSaveForm(event: { request: CreateTodoRequest | UpdateTodoRequest, id?: string }): void {
    this.isSaving.set(true);

    if (event.id) {
      this.todoService.update(event.id, event.request as UpdateTodoRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isFormVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Task updated successfully.', life: 3000 });
          this.loadTodos();
          this.notificationService.refresh();
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.todoService.create(event.request as CreateTodoRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isFormVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Task created successfully.', life: 3000 });
          if (this.selectedSort.sortBy === 'CreatedAt' && this.selectedSort.desc) {
            this.currentPage = 1;
          }
          this.loadTodos();
        },
        error: () => this.isSaving.set(false)
      });
    }
  }
}
