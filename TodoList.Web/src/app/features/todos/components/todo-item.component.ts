import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Todo } from '../../../core/models/todo.model';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, ButtonModule, MenuModule, PriorityBadgeComponent],
  template: `
    <div class="todo-card" [class.completed]="todo.isCompleted">
      <!-- Checkbox & Title Area -->
      <div class="todo-header">
        <p-checkbox 
          [ngModel]="todo.isCompleted" 
          (ngModelChange)="onToggleComplete()"
          [binary]="true" />
        
        <div class="todo-title" [class.line-through]="todo.isCompleted">
          {{ todo.title }}
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
        <app-priority-badge [priority]="todo.priority" />
        <div class="dates">
          <span>Created: {{ todo.createdAt | date:'MMM d, y' }}</span>
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

    .todo-title {
      flex: 1;
      font-weight: 600;
      color: var(--text-color);
      font-size: var(--font-size-md);
      margin-top: 2px; /* Align with checkbox */
      word-break: break-word;
      transition: color var(--transition-fast);
    }

    .todo-description {
      margin-left: 32px; /* Align past checkbox (20px + 12px gap) */
      color: var(--text-color-secondary);
      font-size: var(--font-size-sm);
      word-break: break-word;
    }

    .todo-footer {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-left: 32px;
      margin-top: var(--space-2);
    }

    .dates {
      font-size: var(--font-size-xs);
      color: var(--text-color-disabled);
    }

    .line-through {
      text-decoration: line-through;
      color: var(--text-color-disabled);
    }
  `]
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  
  @Output() toggle = new EventEmitter<Todo>();
  @Output() edit = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<Todo>();

  get menuItems(): MenuItem[] {
    return [
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
}
