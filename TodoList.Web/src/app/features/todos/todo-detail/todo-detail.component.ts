import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../../core/services/todo.service';
import { Todo, SubTask, TodoComment, Attachment } from '../../../core/models/todo.model';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import { environment } from '../../../../environments/environment';

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
    DividerModule,
    FileUploadModule
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
  newCommentText = signal<string>('');
  isUploading = signal<boolean>(false);
  apiUrl = environment.apiUrl.replace('/api/v1', ''); // Get base server URL for downloads

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

  // --- Comments ---
  addComment() {
    const text = this.newCommentText().trim();
    const currentTodo = this.todo();
    if (!text || !currentTodo) return;

    this.todoService.addComment(currentTodo.id, text).subscribe({
      next: (comment) => {
        const updated = { ...currentTodo };
        updated.comments = [...(updated.comments || []), comment];
        this.todo.set(updated);
        this.newCommentText.set('');
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not add comment' });
      }
    });
  }

  deleteComment(comment: TodoComment) {
    const currentTodo = this.todo();
    if (!currentTodo) return;

    this.todoService.deleteComment(currentTodo.id, comment.id).subscribe({
      next: () => {
        const updated = { ...currentTodo };
        updated.comments = updated.comments?.filter(c => c.id !== comment.id);
        this.todo.set(updated);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete comment' });
      }
    });
  }

  // --- Attachments ---
  onUploadAttachment(event: any) {
    const currentTodo = this.todo();
    if (!currentTodo) return;

    const file = event.files[0];
    if (!file) return;

    this.isUploading.set(true);
    this.todoService.uploadAttachment(currentTodo.id, file).subscribe({
      next: (attachment) => {
        const updated = { ...currentTodo };
        updated.attachments = [...(updated.attachments || []), attachment];
        this.todo.set(updated);
        this.isUploading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File uploaded' });
        
        // Clear PrimeNG FileUpload
        if (event.originalEvent && event.originalEvent.target) {
            // Can't reliably clear without ViewChild, but PrimeNG has customUpload.
            // When using customUpload, you usually call fileUpload.clear()
        }
      },
      error: (err) => {
        console.error(err);
        this.isUploading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not upload file' });
      }
    });
  }

  deleteAttachment(attachment: Attachment) {
    const currentTodo = this.todo();
    if (!currentTodo) return;

    this.todoService.deleteAttachment(currentTodo.id, attachment.id).subscribe({
      next: () => {
        const updated = { ...currentTodo };
        updated.attachments = updated.attachments?.filter(a => a.id !== attachment.id);
        this.todo.set(updated);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File deleted' });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete file' });
      }
    });
  }

  getDownloadUrl(filePath: string): string {
    // filePath is like "/uploads/xxx.png"
    // apiUrl is "http://localhost:5000"
    return `${this.apiUrl}${filePath}`;
  }
}
