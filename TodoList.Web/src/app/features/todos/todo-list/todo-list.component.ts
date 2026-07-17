import { Component } from '@angular/core';

/**
 * TodoListComponent — the main page showing the user's todos.
 *
 * Stub implementation — will be fully built in Sub-Phase 6.4.
 */
@Component({
  selector: 'app-todo-list',
  standalone: true,
  template: `
    <div class="todo-list-page fade-in">
      <h1>My Tasks</h1>
      <p>Todo list will be built in Sub-Phase 6.4</p>
    </div>
  `,
  styles: [`
    .todo-list-page {
      padding: var(--space-8);
    }
  `]
})
export class TodoListComponent {}
