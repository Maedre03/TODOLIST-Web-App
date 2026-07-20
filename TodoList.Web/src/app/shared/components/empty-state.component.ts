import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="empty-state fade-in">
      <div class="icon-wrapper">
        <i class="pi" [ngClass]="icon"></i>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
      
      @if (actionLabel) {
        <p-button 
          [label]="actionLabel" 
          [icon]="actionIcon" 
          (onClick)="action.emit()" 
          styleClass="mt-4" />
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-12) var(--space-6);
      background: var(--surface-card);
      border: 1px dashed var(--surface-border);
      border-radius: var(--radius-lg);
      margin: var(--space-6) 0;
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--surface-overlay) 0%, var(--surface-card) 100%);
      box-shadow: var(--shadow-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
      color: var(--text-color-secondary);
    }

    .icon-wrapper i {
      font-size: 2.5rem;
      color: var(--primary-color);
    }

    h3 {
      margin-bottom: var(--space-2);
      color: var(--text-color);
    }

    p {
      color: var(--text-color-secondary);
      max-width: 400px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'pi-inbox';
  @Input() title = 'No items found';
  @Input() subtitle = 'There is nothing to display here at the moment.';
  @Input() actionLabel?: string;
  @Input() actionIcon = 'pi-plus';
  
  @Output() action = new EventEmitter<void>();
}
