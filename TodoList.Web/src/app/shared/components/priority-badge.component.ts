import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Priority } from '../../core/models/todo.model';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="priority-badge" [ngClass]="getPriorityClass()">
      {{ getPriorityLabel() }}
    </span>
  `,
  styles: [] // Styles are already defined globally in styles.css (.priority-badge)
})
export class PriorityBadgeComponent {
  @Input({ required: true }) priority!: Priority;

  getPriorityClass(): string {
    switch (this.priority) {
      case Priority.High: return 'high';
      case Priority.Medium: return 'medium';
      case Priority.Low: return 'low';
      default: return '';
    }
  }

  getPriorityLabel(): string {
    switch (this.priority) {
      case Priority.High: return 'High';
      case Priority.Medium: return 'Medium';
      case Priority.Low: return 'Low';
      default: return 'Unknown';
    }
  }
}
