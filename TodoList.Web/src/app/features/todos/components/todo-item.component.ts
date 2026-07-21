import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Todo, Priority } from '../../../core/models/todo.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, ButtonModule, MenuModule],
  template: `
    <div class="todo-card" [class.completed]="todo.isCompleted" [ngClass]="priorityClass" (click)="onCardClick($event)" style="cursor: pointer;">
      <!-- Checkbox & Title Area -->
      <div class="todo-header">
        <p-checkbox 
          [ngModel]="todo.isCompleted" 
          (ngModelChange)="onToggleComplete()"
          [binary]="true" />
        
        <div class="todo-title-wrapper">
          <div class="todo-title" [class.line-through]="todo.isCompleted">
            {{ todo.title }}
          </div>
          <i *ngIf="needsAttention" class="pi pi-exclamation-circle text-danger attention-icon" title="Requires attention"></i>
          <span *ngIf="todo.priority === 4" class="title-badge badge-critical">Critical</span>
          <span *ngIf="todo.priority === 3" class="title-badge badge-high">High</span>
          <span *ngIf="todo.priority === 2" class="title-badge badge-medium">Medium</span>
          <span *ngIf="todo.priority === 1" class="title-badge badge-low">Low</span>
        </div>

        <!-- Action Menu (Three dots) -->
        <p-button 
          icon="pi pi-ellipsis-v" 
          [text]="true" 
          [rounded]="true" 
          severity="secondary"
          (onClick)="menu.toggle($event)" />
        <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body" />
      </div>

      <!-- Description Area (if exists) -->
      @if (todo.description) {
        <div class="todo-description" [class.line-through]="todo.isCompleted">
          {{ todo.description }}
        </div>
      }

      <!-- Footer: Priority & Dates -->
      <div class="todo-footer">
        <div class="dates">
          <span *ngIf="todo.dueDate" class="due-date" [class.overdue]="isOverdue()">
            <span *ngIf="isOverdue()" class="pulse-dot"></span>
            Due: {{ todo.dueDate | date:'MMM d, y, HH:mm' }}
          </span>
          <span class="created-date">Created: {{ todo.createdAt | date:'MMM d, y' }}</span>
        </div>
        
        <div class="tags-container" *ngIf="todo.tags && todo.tags.length > 0">
          <span *ngFor="let tag of todo.tags" class="tag-badge" [style.backgroundColor]="tag.color">
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .todo-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      transition: all var(--transition-base);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      animation: fadeIn var(--transition-slow) forwards;
    }

    .todo-card:hover {
      border-color: var(--primary-color-hover);
      box-shadow: var(--shadow-sm);
      transform: translateY(-2px);
    }

    .todo-card.completed {
      opacity: 0.6;
    }
    
    .todo-card.completed:hover {
      opacity: 0.9;
    }

    .todo-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .todo-title-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .todo-title {
      font-weight: 600;
      color: var(--text-color);
      font-size: var(--font-size-md);
      margin-top: 2px; /* Align with checkbox */
      word-break: break-word;
      transition: color var(--transition-fast);
    }

    .title-badge {
      font-size: 0.6rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .badge-critical {
      background: rgba(220, 38, 38, 0.15);
      color: #EF4444;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }
    .badge-high {
      background: rgba(248, 113, 113, 0.15);
      color: #FCA5A5;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }
    .badge-medium {
      background: rgba(251, 191, 36, 0.15);
      color: #FCD34D;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .badge-low {
      background: rgba(96, 165, 250, 0.15);
      color: #93C5FD;
      border: 1px solid rgba(96, 165, 250, 0.3);
    }

    /* Priority Borders & Backgrounds */
    .todo-card.priority-critical {
      border-left: 4px solid #DC2626;
      background: linear-gradient(90deg, rgba(220, 38, 38, 0.05) 0%, var(--surface-card) 30%);
    }
    .todo-card.priority-high {
      border-left: 4px solid var(--color-danger);
      background: linear-gradient(90deg, rgba(248, 113, 113, 0.05) 0%, var(--surface-card) 30%);
    }
    .todo-card.priority-medium {
      border-left: 4px solid var(--color-warning);
    }
    .todo-card.priority-low {
      border-left: 4px solid var(--color-info);
    }

    .todo-description {
      margin-left: 32px; /* Align past checkbox (20px + 12px gap) */
      color: var(--text-color-secondary);
      font-size: var(--font-size-sm);
      word-break: break-word;
    }

    .attention-icon {
      font-size: 1.1rem;
      animation: pulse 2s infinite;
    }

    .todo-footer {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-left: 32px;
      margin-top: var(--space-2);
    }

    .dates {
      font-size: var(--font-size-xs);
      color: var(--text-color-disabled);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .due-date {
      display: flex;
      align-items: center;
    }

    .due-date.overdue {
      color: var(--color-danger);
      font-weight: 600;
    }

    .pulse-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--color-danger);
      animation: pulse 2s infinite;
      margin-right: 4px;
    }

    .line-through {
      text-decoration: line-through;
      color: var(--text-color-disabled);
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
      margin-top: var(--space-1);
    }

    .tag-badge {
      font-size: 0.65rem;
      font-weight: 600;
      color: #fff;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
  `]
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;

  @Output() toggle = new EventEmitter<Todo>();
  @Output() edit = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<Todo>();
  @Output() view = new EventEmitter<Todo>();

  onCardClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('p-checkbox') || target.closest('p-button') || target.closest('.p-menu')) {
      return; // Ignore clicks on action items
    }
    this.view.emit(this.todo);
  }

  get priorityClass(): string {
    switch (this.todo.priority) {
      case Priority.Critical: return 'priority-critical';
      case Priority.High: return 'priority-high';
      case Priority.Medium: return 'priority-medium';
      case Priority.Low: return 'priority-low';
      default: return '';
    }
  }

  get menuItems(): MenuItem[] {
    return [
      {
        label: 'View Details',
        icon: 'pi pi-eye',
        command: () => this.view.emit(this.todo)
      },
      {
        label: 'Edit Task',
        icon: 'pi pi-pencil',
        command: () => this.edit.emit(this.todo)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'text-danger',
        command: () => this.delete.emit(this.todo)
      }
    ];
  }

  onToggleComplete(): void {
    this.toggle.emit(this.todo);
  }

  isOverdue(): boolean {
    if (!this.todo.dueDate || this.todo.isCompleted) return false;
    const due = new Date(this.todo.dueDate);
    const now = new Date();
    return due < now;
  }

  isDueSoon(): boolean {
    if (!this.todo.dueDate || this.todo.isCompleted) return false;
    const due = new Date(this.todo.dueDate).getTime();
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (due - now) > 0 && (due - now) <= hours24;
  }

  get needsAttention(): boolean {
    return !this.todo.isCompleted && (this.todo.priority === Priority.Critical || this.isDueSoon());
  }
}
