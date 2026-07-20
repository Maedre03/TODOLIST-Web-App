import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoFormComponent } from './todo-form.component';
import { FormBuilder } from '@angular/forms';
import { Priority } from '../../../core/models/todo.model';
import { vi } from 'vitest';

describe('TodoFormComponent', () => {
  let component: TodoFormComponent;
  let fixture: ComponentFixture<TodoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFormComponent],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with default values for a new task', () => {
      component.todoToEdit = null;
      component.visible = true;
      // trigger ngOnChanges
      component.ngOnChanges({ visible: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true } });

      expect(component.form.get('title')?.value).toBe('');
      expect(component.form.get('description')?.value).toBe('');
      expect(component.form.get('priority')?.value).toBe(Priority.Medium);
      expect(component.isEditMode).toBe(false);
    });

    it('should initialize with todo values when editing', () => {
      component.todoToEdit = {
        id: '1', title: 'Edit Test', description: 'Desc', priority: Priority.High, dueDate: null, isCompleted: false, createdAt: ''
      };
      component.visible = true;
      component.ngOnChanges({ visible: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true } });

      expect(component.form.get('title')?.value).toBe('Edit Test');
      expect(component.form.get('description')?.value).toBe('Desc');
      expect(component.form.get('priority')?.value).toBe(Priority.High);
      expect(component.isEditMode).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should invalidate the form if title is empty', () => {
      component.form.controls['title'].setValue('');
      expect(component.form.invalid).toBe(true);
    });

    it('should validate the form if title is provided', () => {
      component.form.controls['title'].setValue('Valid Title');
      expect(component.form.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should emit save event with CreateTodoRequest when creating', () => {
      vi.spyOn(component.save, 'emit');
      component.todoToEdit = null;
      component.form.controls['title'].setValue('New Todo');
      component.form.controls['description'].setValue('New Desc');
      component.form.controls['priority'].setValue(Priority.Low);
      component.form.controls['dueDate'].setValue(null);

      component.onSubmit();

      expect(component.save.emit).toHaveBeenCalledWith({
        request: {
          title: 'New Todo',
          description: 'New Desc',
          priority: Priority.Low,
          dueDate: null
        }
      });
    });

    it('should emit save event with UpdateTodoRequest and id when editing', () => {
      vi.spyOn(component.save, 'emit');
      component.todoToEdit = { id: 'guid-123', title: '', description: '', priority: Priority.Low, dueDate: null, isCompleted: false, createdAt: '' };
      // simulate edit mode
      Object.defineProperty(component, 'isEditMode', { get: () => true });

      component.form.controls['title'].setValue('Updated Todo');
      component.form.controls['description'].setValue('');
      component.form.controls['priority'].setValue(Priority.Medium);
      component.form.controls['dueDate'].setValue(null);

      component.onSubmit();

      expect(component.save.emit).toHaveBeenCalledWith({
        request: {
          title: 'Updated Todo',
          description: '',
          priority: Priority.Medium,
          dueDate: null
        },
        id: 'guid-123'
      });
    });
  });
});
