import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private apiUrl = 'http://localhost:3000/api/flashcards';

  constructor(private http: HttpClient) {}

  getFlashcards(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createFlashcard(flashcard: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, flashcard);
  }

  updateFlashcard(flashcard: any): Observable<any> {
    const url = `${this.apiUrl}/${flashcard.id}`;  // Assuming each flashcard has an `id` field
    return this.http.put<any>(url, flashcard);
  }
}
