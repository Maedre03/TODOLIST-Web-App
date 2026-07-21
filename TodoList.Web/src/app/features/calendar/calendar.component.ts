import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TodoService } from '../../../core/services/todo.service';
import { Todo } from '../../../core/models/todo.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="calendar-page fade-in">
      <div class="header">
        <h1>Calendar View</h1>
        <div class="controls">
          <p-button icon="pi pi-chevron-left" [text]="true" (onClick)="prevMonth()"></p-button>
          <h2 class="month-title">{{ monthYearString() }}</h2>
          <p-button icon="pi pi-chevron-right" [text]="true" (onClick)="nextMonth()"></p-button>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="day-header" *ngFor="let day of weekDays">{{ day }}</div>
        
        <!-- Empty cells for offset -->
        <div class="day-cell empty" *ngFor="let empty of emptyCells()"></div>
        
        <!-- Actual days -->
        <div class="day-cell" *ngFor="let dayObj of calendarDays()" [class.today]="dayObj.isToday">
          <div class="day-number">{{ dayObj.date }}</div>
          
          <div class="tasks">
            <div class="task-item" 
                 *ngFor="let task of dayObj.tasks" 
                 [ngClass]="getPriorityClass(task.priority)"
                 (click)="goToTask(task.id)"
                 [title]="task.title">
              {{ task.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .month-title {
      min-width: 200px;
      text-align: center;
      margin: 0;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      background: var(--surface-border);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .day-header {
      background: var(--surface-section);
      padding: 0.5rem;
      text-align: center;
      font-weight: 600;
      color: var(--text-color-secondary);
    }
    .day-cell {
      background: var(--surface-card);
      min-height: 120px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .day-cell.empty {
      background: var(--surface-ground);
    }
    .day-cell.today .day-number {
      background: var(--primary-color);
      color: var(--primary-color-text);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .day-number {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      margin-bottom: 0.25rem;
      align-self: flex-end;
    }
    .tasks {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
      flex: 1;
    }
    .task-item {
      font-size: 0.75rem;
      padding: 2px 4px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      color: #fff;
    }
    .task-item:hover {
      opacity: 0.9;
    }
    .priority-4 { background: #DC2626; } /* Critical */
    .priority-3 { background: #F59E0B; } /* High */
    .priority-2 { background: #3B82F6; } /* Medium */
    .priority-1 { background: #10B981; } /* Low */
  `]
})
export class CalendarComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly router = inject(Router);

  currentDate = signal(new Date());
  todos = signal<Todo[]>([]);
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  monthYearString = computed(() => {
    const d = this.currentDate();
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  emptyCells = computed(() => {
    const d = this.currentDate();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    return Array(firstDay).fill(0);
  });

  calendarDays = computed(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const allTodos = this.todos();
    const today = new Date();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD local

      const dayTasks = allTodos.filter(t => {
        if (!t.dueDate) return false;
        // dueDate is ISO UTC, we just compare the YYYY-MM-DD part roughly
        // To be safe, we parse it
        const tDate = new Date(t.dueDate);
        return tDate.getFullYear() === year && tDate.getMonth() === month && tDate.getDate() === i;
      });

      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
      days.push({ date: i, tasks: dayTasks, isToday });
    }
    return days;
  });

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    // For calendar, we ideally load ALL tasks for the month, but getting all is fine for now
    this.todoService.getAll().subscribe({
      next: (data) => this.todos.set(data),
      error: (err) => console.error(err)
    });
  }

  prevMonth() {
    this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  goToTask(id: string) {
    this.router.navigate(['/todos', id]);
  }

  getPriorityClass(priority: number): string {
    return 'priority-' + priority;
  }
}
