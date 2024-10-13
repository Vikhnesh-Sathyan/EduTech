import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Ensures the service is provided at the root level
})
export class TodoService {
  private apiUrl = 'http://localhost:3000/api/todos';  // Update to correct URL

  constructor(private http: HttpClient) {} // Inject HttpClient

  getTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createTodo(todo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, todo);
  }

  updateTodo(id: number, payload: { completed: boolean }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
