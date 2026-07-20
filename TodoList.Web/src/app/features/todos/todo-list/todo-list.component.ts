import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TodoService } from '../../../core/services/todo.service';
import { Todo, TodoPagedParams, CreateTodoRequest, UpdateTodoRequest } from '../../../core/models/todo.model';
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
    ButtonModule,
    InputTextModule,
    SelectModule,
    PaginatorModule,
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
        <p-button 
          label="New Task" 
          icon="pi pi-plus" 
          (onClick)="openCreateForm()" 
          styleClass="p-button-primary" />
      </div>

      <!-- Controls (Search & Sort) -->
      <div class="controls-bar">
        <span class="p-input-icon-left search-input">
          <i class="pi pi-search"></i>
          <input 
            pInputText 
            type="text" 
            [(ngModel)]="searchTerm" 
            (ngModelChange)="onSearchChange()"
            placeholder="Search tasks..." 
            class="w-full" />
        </span>

        <p-select 
          [options]="sortOptions" 
          [(ngModel)]="selectedSort" 
          (ngModelChange)="onSortChange()"
          optionLabel="label" 
          optionValue="value"
          placeholder="Sort By" />
      </div>

      <!-- Main Content Area -->
      <div class="list-container">
        <!-- Loading State -->
        @if (isLoading()) {
          <app-loading-skeleton [count]="pageSize" />
        } 
        <!-- Empty State -->
        @else if (todos().length === 0) {
          <app-empty-state 
            [title]="searchTerm ? 'No matches found' : 'You\\'re all caught up!'"
            [subtitle]="searchTerm ? 'Try adjusting your search terms.' : 'You have no tasks. Enjoy your day or create a new one.'"
            [actionLabel]="searchTerm ? undefined : 'Create your first task'"
            (action)="openCreateForm()" />
        }
        <!-- Todo List -->
        @else {
          <div class="todo-grid">
            @for (todo of todos(); track todo.id) {
              <app-todo-item 
                class="stagger-item"
                [todo]="todo"
                (toggle)="onToggleComplete($event)"
                (edit)="openEditForm($event)"
                (delete)="confirmDelete($event)" />
            }
          </div>

          <!-- Pagination -->
          <div class="pagination-wrapper">
            <p-paginator 
              (onPageChange)="onPageChange($event)" 
              [first]="(currentPage - 1) * pageSize" 
              [rows]="pageSize" 
              [totalRecords]="totalItems()" 
              [rowsPerPageOptions]="[5, 10, 20]" />
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
      (save)="onSaveForm($event)" />

    <!-- Floating Action Button -->
    <div class="fab-container">
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
      gap: var(--space-6);
      max-width: 800px;
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

    .search-input i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-color-secondary);
      z-index: 1;
    }

    .search-input input {
      padding-left: 2.5rem !important;
    }

    .list-container {
      display: flex;
      flex-direction: column;
      min-height: 400px; /* Prevent jumping when loading */
    }

    .todo-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .pagination-wrapper {
      margin-top: var(--space-6);
      display: flex;
      justify-content: center;
    }

    @media (max-width: 600px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-4);
      }
      .page-header p-button {
        width: 100%;
      }
      ::ng-deep .page-header p-button button {
        width: 100%;
      }
      .controls-bar {
        flex-direction: column;
        align-items: stretch;
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
export class TodoListComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // State
  todos = signal<Todo[]>([]);
  totalItems = signal<number>(0);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  // Pagination & Filtering Params
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  isCompletedFilter?: boolean;
  private searchTimeout: any;

  // Sorting
  sortOptions = [
    { label: 'Newest First', value: { sortBy: 'CreatedAt', desc: true } },
    { label: 'Oldest First', value: { sortBy: 'CreatedAt', desc: false } },
    { label: 'Highest Priority', value: { sortBy: 'Priority', desc: true } },
    { label: 'Lowest Priority', value: { sortBy: 'Priority', desc: false } }
  ];
  selectedSort = this.sortOptions[0].value;

  // Form Dialog State
  isFormVisible = false;
  todoToEdit: Todo | null = null;

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const filter = params['filter'];
      if (filter === 'active') {
        this.isCompletedFilter = false;
      } else if (filter === 'completed') {
        this.isCompletedFilter = true;
      } else {
        this.isCompletedFilter = undefined;
      }
      this.currentPage = 1; // Reset to page 1 on filter change
      this.loadTodos();
    });
  }

  // ─── Data Loading ──────────────────────────────────────────

  loadTodos(): void {
    this.isLoading.set(true);

    const params: TodoPagedParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm,
      sortBy: this.selectedSort.sortBy,
      sortDescending: this.selectedSort.desc,
      isCompleted: this.isCompletedFilter
    };

    this.todoService.getPaged(params).subscribe({
      next: (result) => {
        this.todos.set(result.items);
        this.totalItems.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Error toast is handled by the global error interceptor
      }
    });
  }

  // ─── Controls ──────────────────────────────────────────────

  onSearchChange(): void {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset to first page on new search
      this.loadTodos();
    }, 400);
  }

  onSortChange(): void {
    this.currentPage = 1; // Reset to first page on sort change
    this.loadTodos();
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage = (event.page || 0) + 1;
    this.pageSize = event.rows || 10;
    this.loadTodos();
  }

  // ─── Actions ───────────────────────────────────────────────

  onToggleComplete(todo: Todo): void {
    // Optimistic UI update
    const previousState = todo.isCompleted;
    
    // Update local state immediately
    this.todos.update(current => 
      current.map(t => t.id === todo.id ? { ...t, isCompleted: !t.isCompleted } : t)
    );

    this.todoService.toggleComplete(todo.id).subscribe({
      next: () => {
        const status = !previousState ? 'completed' : 'uncompleted';
        this.messageService.add({ severity: 'success', summary: 'Task Updated', detail: `Task marked as ${status}.`, life: 2000 });
      },
      error: () => {
        // Revert on failure
        this.todos.update(current => 
          current.map(t => t.id === todo.id ? { ...t, isCompleted: previousState } : t)
        );
      }
    });
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
        
        // Handle pagination edge case: deleting last item on page
        if (this.todos().length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadTodos();
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
      // Update
      this.todoService.update(event.id, event.request as UpdateTodoRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isFormVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Task updated successfully.', life: 3000 });
          this.loadTodos(); // Reload to reflect changes
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      // Create
      this.todoService.create(event.request as CreateTodoRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isFormVisible = false;
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Task created successfully.', life: 3000 });
          // Go to first page to see the newly created task (assuming default sort is Newest First)
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
