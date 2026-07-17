import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      @for (item of itemsArray; track $index) {
        <div class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton skeleton-checkbox"></div>
            <div class="skeleton skeleton-title"></div>
          </div>
          <div class="skeleton skeleton-desc"></div>
          <div class="skeleton-footer">
            <div class="skeleton skeleton-pill"></div>
            <div class="skeleton skeleton-date"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .skeleton-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .skeleton-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .skeleton-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }

    .skeleton-title {
      height: 20px;
      width: 40%;
    }

    .skeleton-desc {
      height: 14px;
      width: 80%;
      margin-left: 32px; /* Align with title, past checkbox */
    }

    .skeleton-footer {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-left: 32px;
      margin-top: var(--space-2);
    }

    .skeleton-pill {
      height: 24px;
      width: 60px;
      border-radius: var(--radius-full);
    }

    .skeleton-date {
      height: 14px;
      width: 100px;
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() count = 3;

  get itemsArray() {
    return Array(this.count).fill(0);
  }
}
