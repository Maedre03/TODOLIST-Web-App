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
  private readonly dismissedIds = signal<Set<string>>(new Set());

  // Computed state for due notifications
  public readonly dueTodos = computed(() => {
    const now = new Date();
    // Start of today
    now.setHours(0, 0, 0, 0);
    const dismissed = this.dismissedIds();

    return this.todos().filter(t => {
      if (t.isCompleted || !t.dueDate || dismissed.has(t.id)) return false;
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
      const user = this.authService.currentUser();
      if (user) {
        this.loadDismissed(user.sub);
        this.loadTodos();
      } else {
        this.todos.set([]);
        this.dismissedIds.set(new Set());
      }
    }, { allowSignalWrites: true });
  }

  private loadDismissed(userId: string) {
    const saved = localStorage.getItem(`dismissed_notifications_${userId}`);
    if (saved) {
      this.dismissedIds.set(new Set(JSON.parse(saved)));
    } else {
      this.dismissedIds.set(new Set());
    }
  }

  public dismiss(todoId: string) {
    const next = new Set(this.dismissedIds());
    next.add(todoId);
    this.dismissedIds.set(next);
    
    const user = this.authService.currentUser();
    if (user) {
      localStorage.setItem(`dismissed_notifications_${user.sub}`, JSON.stringify(Array.from(next)));
    }
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
