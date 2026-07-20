import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TodoService } from './todo.service';
import { environment } from '../../../environments/environment';
import { Priority } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return a list of todos and fix date strings', () => {
      const mockTodos = [
        { id: '1', title: 'Test', isCompleted: false, priority: Priority.Medium, dueDate: '2026-07-20T08:08:00', createdAt: '2026-07-19T08:08:00' }
      ];

      service.getAll().subscribe((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].dueDate).toBe('2026-07-20T08:08:00Z');
        expect(todos[0].createdAt).toBe('2026-07-19T08:08:00Z');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/todos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTodos);
    });
  });

  describe('getPaged', () => {
    it('should return paginated result and append HTTP params', () => {
      const mockResult = {
        items: [{ id: '1', title: 'Test', isCompleted: false, priority: Priority.Low, dueDate: '2026-07-20T08:08:00Z', createdAt: null }],
        totalCount: 1,
        pageNumber: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      };

      const params = { pageNumber: 1, pageSize: 10, searchTerm: 'test', sortBy: 'title', sortDescending: true, isCompleted: false };

      service.getPaged(params).subscribe((result) => {
        expect(result.totalCount).toBe(1);
        expect(result.items[0].dueDate).toBe('2026-07-20T08:08:00Z');
      });

      const req = httpMock.expectOne((request) => {
        return request.url === `${environment.apiUrl}/todos/paged` &&
               request.params.get('pageNumber') === '1' &&
               request.params.get('pageSize') === '10' &&
               request.params.get('searchTerm') === 'test' &&
               request.params.get('sortBy') === 'title' &&
               request.params.get('sortDescending') === 'true' &&
               request.params.get('isCompleted') === 'false';
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockResult);
    });
  });

  describe('create', () => {
    it('should create a todo', () => {
      const mockResponse = { id: 'guid-123' };
      const requestDto = { title: 'New Todo', description: 'desc', priority: Priority.High, dueDate: null };

      service.create(requestDto).subscribe((res) => {
        expect(res.id).toBe('guid-123');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/todos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestDto);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a todo', () => {
      const requestDto = { title: 'Updated', description: '', priority: Priority.Medium, dueDate: null };

      service.update('guid-123', requestDto).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/todos/guid-123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(requestDto);
      req.flush(null);
    });
  });

  describe('delete', () => {
    it('should delete a todo', () => {
      service.delete('guid-123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/todos/guid-123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('toggleComplete', () => {
    it('should toggle a todo completion status', () => {
      service.toggleComplete('guid-123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/todos/guid-123/toggle`);
      expect(req.request.method).toBe('PATCH');
      req.flush(null);
    });
  });
});
