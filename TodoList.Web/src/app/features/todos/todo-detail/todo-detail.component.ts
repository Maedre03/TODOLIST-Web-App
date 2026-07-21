import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../../core/services/todo.service';
import { Todo, SubTask } from '../../../core/models/todo.model';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    TagModule,
    CardModule,
    ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './todo-detail.component.html',
  styleUrls: ['./todo-detail.component.css']
})
export class TodoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly todoService = inject(TodoService);
  private readonly messageService = inject(MessageService);

  todo = signal<Todo | null>(null);
  isLoading = signal<boolean>(true);

  newSubTaskTitle = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTodo(id);
    } else {
      this.router.navigate(['/todos']);
    }
  }

  loadTodo(id: string) {
    this.isLoading.set(true);
    this.todoService.getById(id).subscribe({
      next: (t) => {
        this.todo.set(t);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Task not found' });
        this.router.navigate(['/todos']);
      }
    });
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  }

  getPrioritySeverity(priority: number): 'success' | 'info' | 'warn' | 'danger' {
    switch (priority) {
      case 1: return 'info';
      case 2: return 'success';
      case 3: return 'warn';
      case 4: return 'danger';
      default: return 'info';
    }
  }

  goBack() {
    this.router.navigate(['/todos']);
  }

  addSubTask() {
    const title = this.newSubTaskTitle().trim();
    const currentTodo = this.todo();

    if (!title || !currentTodo) return;

    this.todoService.addSubTask(currentTodo.id, title).subscribe({
      next: (subTask) => {
        const updated = { ...currentTodo };
        updated.subTasks = [...(updated.subTasks || []), subTask];
        this.todo.set(updated);
        this.newSubTaskTitle.set('');
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not add subtask' });
      }
    });
  }

  toggleSubTask(subTask: SubTask) {
    const currentTodo = this.todo();
    if (!currentTodo) return;

    this.todoService.toggleSubTaskComplete(currentTodo.id, subTask.id).subscribe({
      next: () => {
        const updated = { ...currentTodo };
        const st = updated.subTasks?.find(s => s.id === subTask.id);
        if (st) {
          st.isCompleted = !st.isCompleted;
        }
        this.todo.set(updated);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not toggle subtask' });
      }
    });
  }

  deleteSubTask(subTask: SubTask) {
    const currentTodo = this.todo();
    if (!currentTodo) return;

    this.todoService.deleteSubTask(currentTodo.id, subTask.id).subscribe({
      next: () => {
        const updated = { ...currentTodo };
        updated.subTasks = updated.subTasks?.filter(s => s.id !== subTask.id);
        this.todo.set(updated);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete subtask' });
      }
    });
  }
}
