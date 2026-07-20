import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tag, CreateTagRequest } from '../models/tag.model';

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
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl).pipe(
      tap(tags => {
        if (tags) {
          this.tagsSubject.next(tags);
        }
      })
    );
  }

  /**
   * Creates a new tag.
   */
  createTag(request: CreateTagRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, request);
  }

  /**
   * Deletes a tag by its ID.
   */
  deleteTag(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
