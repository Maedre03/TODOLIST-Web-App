import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { Todo } from '../models/todo.model';
import { TodoService } from './todo.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly todoService = inject(TodoService);
  private readonly authService = inject(AuthService);

  // State for all todos
  private readonly todos = signal<Todo[]>([]);

  // Computed state for due notifications
  public readonly dueTodos = computed(() => {
    const now = new Date();
    // Start of today
    now.setHours(0, 0, 0, 0);

    return this.todos().filter(t => {
      if (t.isCompleted || !t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      // Strip time from due date for comparison
      dueDate.setHours(0, 0, 0, 0);

      // We want tasks due today or overdue
      return dueDate.getTime() <= now.getTime();
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  });

  public readonly notificationCount = computed(() => this.dueTodos().length);

  constructor() {
    // When user logs in, load todos for notifications
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadTodos();
      } else {
        this.todos.set([]);
      }
    });
  }

  public loadTodos() {
    this.todoService.getAll().subscribe({
      next: (todos) => this.todos.set(todos),
      error: (err) => console.error('Failed to load todos for notifications', err)
    });
  }

  // Can be called after a todo is created/updated/deleted to refresh notifications
  public refresh() {
    if (this.authService.isAuthenticated()) {
      this.loadTodos();
    }
  }
}
