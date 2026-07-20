import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../../core/services/todo.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Priority } from '../../../core/models/todo.model';
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let todoServiceSpy: any;
  let messageServiceSpy: any;
  let confirmationServiceSpy: any;

  beforeEach(async () => {
    todoServiceSpy = {
      getPaged: vi.fn(),
      toggleComplete: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      create: vi.fn()
    };
    messageServiceSpy = { add: vi.fn() };
    confirmationServiceSpy = { confirm: vi.fn() };
    
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();

    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [
        provideRouter([]),
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Data Loading', () => {
    it('should load todos on init', () => {
      const mockResult = {
        items: [{ id: '1', title: 'Test Todo', description: 'test', isCompleted: false, priority: Priority.Medium, dueDate: null, createdAt: '' }],
        totalCount: 1,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
      todoServiceSpy.getPaged.mockReturnValue(of(mockResult));

      fixture.detectChanges(); // triggers ngOnInit

      expect(todoServiceSpy.getPaged).toHaveBeenCalled();
      expect(component.todos().length).toBe(1);
      expect(component.totalItems()).toBe(1);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle error during load', () => {
      todoServiceSpy.getPaged.mockReturnValue(throwError(() => new Error('API Error')));
      
      fixture.detectChanges();

      expect(component.isLoading()).toBe(false);
      expect(component.todos().length).toBe(0);
    });
  });

  describe('Actions', () => {
    const mockTodo: any = { id: '1', title: 'Test Todo', description: 'desc', isCompleted: false, priority: Priority.Medium, dueDate: null, createdAt: '' };

    beforeEach(() => {
      todoServiceSpy.getPaged.mockReturnValue(of({
        items: [mockTodo],
        totalCount: 1, pageNumber: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false
      }));
      fixture.detectChanges();
    });

    it('should toggle completion status optimistically and handle success', () => {
      todoServiceSpy.toggleComplete.mockReturnValue(of(undefined));
      
      component.onToggleComplete(mockTodo);
      
      expect(component.todos()[0].isCompleted).toBe(true);
      expect(todoServiceSpy.toggleComplete).toHaveBeenCalledWith('1');
      expect(messageServiceSpy.add).toHaveBeenCalled();
    });

    it('should revert toggle if API fails', () => {
      todoServiceSpy.toggleComplete.mockReturnValue(throwError(() => new Error('API Error')));
      
      component.onToggleComplete(mockTodo);
      
      expect(component.todos()[0].isCompleted).toBe(false);
    });

    it('should call delete on confirmation', () => {
      confirmationServiceSpy.confirm.mockImplementation((config: any) => {
        if (config.accept) config.accept();
        return confirmationServiceSpy;
      });
      todoServiceSpy.delete.mockReturnValue(of(undefined));

      component.confirmDelete(mockTodo);

      expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
      expect(todoServiceSpy.delete).toHaveBeenCalledWith('1');
      expect(messageServiceSpy.add).toHaveBeenCalled();
    });
  });

  describe('Filtering and Search', () => {
    beforeEach(() => {
      todoServiceSpy.getPaged.mockReturnValue(of({
        items: [], totalCount: 0, pageNumber: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false
      }));
      fixture.detectChanges();
    });

    it('should debounce search input', () => {
      vi.useFakeTimers();
      component.searchTerm = 'test';
      component.onSearchChange();
      
      expect(todoServiceSpy.getPaged).toHaveBeenCalledTimes(1); // initial load
      
      vi.advanceTimersByTime(400);
      
      expect(todoServiceSpy.getPaged).toHaveBeenCalledTimes(2); // after search
      vi.useRealTimers();
    });

    it('should reset page when setting tab', () => {
      component.currentPage = 2;
      component.setTab('active');
      
      expect(component.currentPage).toBe(1);
      expect(component.isCompletedFilter).toBe(false);
    });
  });
});
