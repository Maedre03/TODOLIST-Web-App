import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TodoService } from '../../core/services/todo.service';
import { Todo, Priority } from '../../core/models/todo.model';
import { ThemeService } from '../../core/services/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  // Data signals
  totalTasks = signal<number>(0);
  completedTasks = signal<number>(0);
  pendingTasks = signal<number>(0);
  completionRate = signal<number>(0);

  // Chart options and data
  priorityChartData: any;
  priorityChartOptions: any;
  statusChartData: any;
  statusChartOptions: any;

  isLoading = signal<boolean>(true);

  constructor() {
    // Re-render charts when theme changes to update text colors
    effect(() => {
      const isDark = this.themeService.isDarkMode();
      this.initChartOptions(isDark);
    });
  }

  ngOnInit(): void {
    this.todoService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (todos) => {
          this.processTodos(todos);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load tasks for stats', err);
          this.isLoading.set(false);
        }
      });
  }

  private processTodos(todos: Todo[]): void {
    const total = todos.length;
    const completed = todos.filter(t => t.isCompleted).length;
    const pending = total - completed;

    this.totalTasks.set(total);
    this.completedTasks.set(completed);
    this.pendingTasks.set(pending);
    this.completionRate.set(total > 0 ? Math.round((completed / total) * 100) : 0);

    // Calculate priorities
    let low = 0, medium = 0, high = 0, critical = 0;
    todos.forEach(t => {
      switch (t.priority) {
        case Priority.Low: low++; break;
        case Priority.Medium: medium++; break;
        case Priority.High: high++; break;
        case Priority.Critical: critical++; break;
      }
    });

    this.priorityChartData = {
      labels: ['Low', 'Medium', 'High', 'Critical'],
      datasets: [
        {
          data: [low, medium, high, critical],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green
            'rgba(59, 130, 246, 0.8)',  // Blue
            'rgba(249, 115, 22, 0.8)',  // Orange
            'rgba(239, 68, 68, 0.8)'    // Red
          ],
          hoverBackgroundColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 0
        }
      ]
    };

    this.statusChartData = {
      labels: ['Completed', 'Pending'],
      datasets: [
        {
          data: [completed, pending],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)', // Emerald
            'rgba(99, 102, 241, 0.8)'  // Indigo
          ],
          hoverBackgroundColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(99, 102, 241, 1)'
          ],
          borderWidth: 0
        }
      ]
    };
  }

  private initChartOptions(isDark: boolean): void {
    const textColor = isDark ? '#ffffff' : '#495057';
    
    this.priorityChartOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      cutout: '60%',
      maintainAspectRatio: false
    };

    this.statusChartOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      cutout: '60%',
      maintainAspectRatio: false
    };
  }
}
