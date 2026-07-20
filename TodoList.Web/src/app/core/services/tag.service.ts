import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tag, CreateTagRequest } from '../models/tag.model';
import { ApiResponse } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/tags`;
  
  private tagsSubject = new BehaviorSubject<Tag[]>([]);
  public tags$ = this.tagsSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all tags for the current user.
   */
  getTags(): Observable<ApiResponse<Tag[]>> {
    return this.http.get<ApiResponse<Tag[]>>(this.apiUrl).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.tagsSubject.next(res.data);
        }
      })
    );
  }

  /**
   * Creates a new tag.
   */
  createTag(request: CreateTagRequest): Observable<ApiResponse<{ id: string }>> {
    return this.http.post<ApiResponse<{ id: string }>>(this.apiUrl, request);
  }

  /**
   * Deletes a tag by its ID.
   */
  deleteTag(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
