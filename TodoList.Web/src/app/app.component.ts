import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';

/**
 * Root application component.
 *
 * This is intentionally minimal — it only provides:
 * 1. <router-outlet> — renders the current page based on the URL
 * 2. <p-toast> — global toast notification container (triggered by MessageService)
 * 3. <p-confirmDialog> — global confirmation dialog (triggered by ConfirmationService)
 *
 * All actual page content lives in feature components (Login, Register, TodoList)
 * which are rendered inside the router-outlet.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast, ConfirmDialog],
  template: `
    <router-outlet />
    <p-toast position="top-right" />
    <p-confirmdialog />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App {}
