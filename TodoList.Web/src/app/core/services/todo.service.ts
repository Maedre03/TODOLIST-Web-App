import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  PaginatedResult,
  TodoPagedParams
} from '../models/todo.model';

/**
 * TodoService — wraps all HTTP calls to the /api/v1/todos endpoints.
 *
 * Design decisions:
 * - All methods return Observable<T> — components subscribe to get data.
 * - The auth interceptor automatically attaches the JWT token.
 * - We never call HttpClient directly from components (project rule).
 * - Methods use typed generics for compile-time safety.
 */
@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);

  /** Base URL for all todo endpoints */
  private readonly baseUrl = `${environment.apiUrl}/todos`;

  /**
   * Gets all todos for the current user (non-paginated).
   * Backend endpoint: GET /api/v1/todos
   *
   * Note: The backend returns a List<TodoDto> directly (not wrapped in ApiResponse).
   */
  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.baseUrl).pipe(
      map(todos => todos.map(t => this.fixDateStrings(t)))
    );
  }

  /**
   * Gets a single todo by its GUID ID.
   * Backend endpoint: GET /api/v1/todos/{id}
   */
  getById(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`).pipe(
      map(t => this.fixDateStrings(t))
    );
  }

  /**
   * Gets a paginated list of todos with optional filtering and sorting.
   * Backend endpoint: GET /api/v1/todos/paged?pageNumber=&pageSize=&...
   *
   * This is the primary method used by the TodoListComponent for
   * displaying todos with server-side pagination.
   */
  getPaged(params: TodoPagedParams): Observable<PaginatedResult<Todo>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDescending !== undefined) {
      httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }
    if (params.isCompleted !== undefined && params.isCompleted !== null) {
      httpParams = httpParams.set('isCompleted', params.isCompleted.toString());
    }

    return this.http.get<PaginatedResult<Todo>>(`${this.baseUrl}/paged`, {
      params: httpParams
    }).pipe(
      map(result => {
        result.items = result.items.map(t => this.fixDateStrings(t));
        return result;
      })
    );
  }

  private fixDateStrings(todo: Todo): Todo {
    const fix = (dateStr: string | null) => {
      if (!dateStr) return dateStr;
      return dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
    };
    return {
      ...todo,
      dueDate: fix(todo.dueDate),
      createdAt: fix(todo.createdAt)
    } as Todo;
  }

  /**
   * Creates a new todo.
   * Backend endpoint: POST /api/v1/todos
   *
   * Returns: { id: string } — the GUID of the newly created todo.
   */
  create(request: CreateTodoRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.baseUrl, request);
  }

  /**
   * Updates an existing todo.
   * Backend endpoint: PUT /api/v1/todos/{id}
   *
   * Returns: void (204 No Content from backend).
   */
  update(id: string, request: UpdateTodoRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Soft-deletes a todo.
   * Backend endpoint: DELETE /api/v1/todos/{id}
   *
   * Returns: void (204 No Content from backend).
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggles the completion status of a todo.
   * Backend endpoint: PATCH /api/v1/todos/{id}/toggle
   *
   * Returns: void (204 No Content from backend).
   */
  toggleComplete(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/toggle`, {});
  }
}
