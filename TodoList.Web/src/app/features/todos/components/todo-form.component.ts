import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { Todo, Priority, CreateTodoRequest, UpdateTodoRequest } from '../../../core/models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    DatePickerModule
  ],
  template: `
    <p-dialog 
      [header]="isEditMode ? 'Edit Task' : 'Create New Task'" 
      [(visible)]="visible" 
      [modal]="true" 
      [style]="{ width: '100%', maxWidth: '500px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onHide()">
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="todo-form">
        <div class="field">
          <label for="title">Title <span class="text-danger">*</span></label>
          <input 
            pInputText 
            id="title" 
            formControlName="title" 
            placeholder="E.g., Complete project proposal" 
            autofocus 
            class="w-full" />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <small class="error-text">Title is required (max 200 chars).</small>
          }
        </div>

        <div class="field">
          <label for="description">Description</label>
          <textarea 
            pTextarea 
            id="description" 
            formControlName="description" 
            rows="4" 
            placeholder="Add any extra details here..." 
            class="w-full"></textarea>
          @if (form.get('description')?.invalid && form.get('description')?.touched) {
            <small class="error-text">Description cannot exceed 1000 characters.</small>
          }
        </div>

        <div class="field">
          <label for="priority">Priority</label>
          <p-select 
            id="priority" 
            formControlName="priority" 
            [options]="priorityOptions" 
            optionLabel="label" 
            optionValue="value" 
            styleClass="w-full" 
            appendTo="body">
            <ng-template pTemplate="selectedItem">
              <div class="flex align-items-center gap-2" *ngIf="form.get('priority')?.value !== null">
                <span class="priority-dot" [ngClass]="getPriorityClass(form.get('priority')?.value)"></span>
                <span>{{ getPriorityLabel(form.get('priority')?.value) }}</span>
              </div>
            </ng-template>
            <ng-template pTemplate="item" let-option>
              <div class="flex align-items-center gap-2">
                <span class="priority-dot" [ngClass]="getPriorityClass(option.value)"></span>
                <span>{{ option.label }}</span>
              </div>
            </ng-template>
          </p-select>
        </div>

        <div class="field">
          <label for="dueDate">Due Date</label>
          <p-datepicker 
            id="dueDate" 
            formControlName="dueDate" 
            [minDate]="minDate"
            dateFormat="M d, yy"
            placeholder="Select a due date"
            [showClear]="true"
            appendTo="body"
            styleClass="w-full">
          </p-datepicker>
        </div>

        <div class="dialog-footer">
          <p-button 
            type="button" 
            label="Cancel" 
            severity="secondary" 
            [text]="true" 
            (onClick)="onHide()" />
          <p-button 
            type="submit" 
            [label]="isEditMode ? 'Save Changes' : 'Create Task'" 
            [disabled]="form.invalid || isSaving" 
            [loading]="isSaving" />
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .todo-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin-top: var(--space-2);
    }

    .field label {
      display: block;
      font-weight: 500;
      margin-bottom: var(--space-2);
      color: var(--text-color);
    }

    .error-text {
      color: var(--color-danger);
      display: block;
      margin-top: var(--space-1);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--surface-border);
    }

    /* Custom dropdown item styling */
    .flex { display: flex; }
    .align-items-center { align-items: center; }
    .gap-2 { gap: 0.5rem; }
    
    .priority-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .priority-dot.high { background: var(--color-danger); }
    .priority-dot.medium { background: var(--color-warning); }
    .priority-dot.low { background: var(--color-info); }
  `]
})
export class TodoFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() todoToEdit: Todo | null = null;
  @Input() isSaving = false;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ request: CreateTodoRequest | UpdateTodoRequest, id?: string }>();

  form!: FormGroup;

  priorityOptions = [
    { label: 'Low', value: Priority.Low },
    { label: 'Medium', value: Priority.Medium },
    { label: 'High', value: Priority.High }
  ];

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true || (this.visible && changes['todoToEdit'])) {
      this.initForm();
    }
  }

  get isEditMode(): boolean {
    return !!this.todoToEdit;
  }

  minDate: Date = new Date();

  private initForm(): void {
    let initialDueDate = null;
    if (this.todoToEdit?.dueDate) {
      initialDueDate = new Date(this.todoToEdit.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (initialDueDate < today) {
        this.minDate = initialDueDate;
      } else {
        this.minDate = today;
      }
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.minDate = today;
    }

    this.form = this.fb.group({
      title: [this.todoToEdit?.title || '', [Validators.required, Validators.maxLength(200)]],
      description: [this.todoToEdit?.description || '', [Validators.maxLength(1000)]],
      priority: [this.todoToEdit?.priority ?? Priority.Medium, [Validators.required]],
      dueDate: [initialDueDate]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;
    
    const dueDateVal = formValue.dueDate ? new Date(formValue.dueDate).toISOString() : null;

    if (this.isEditMode) {
      const request: UpdateTodoRequest = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: dueDateVal
      };
      this.save.emit({ request, id: this.todoToEdit!.id });
    } else {
      const request: CreateTodoRequest = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        dueDate: dueDateVal
      };
      this.save.emit({ request });
    }
  }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset({ priority: Priority.Medium });
  }

  getPriorityClass(priority: Priority): string {
    switch (priority) {
      case Priority.High: return 'high';
      case Priority.Medium: return 'medium';
      case Priority.Low: return 'low';
      default: return '';
    }
  }

  getPriorityLabel(priority: Priority): string {
    switch (priority) {
      case Priority.High: return 'High';
      case Priority.Medium: return 'Medium';
      case Priority.Low: return 'Low';
      default: return 'Unknown';
    }
  }
}
