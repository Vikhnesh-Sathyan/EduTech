
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminSkillSuggestionsService {

  private readonly apiUrl =
    'http://localhost:5000/api/admin/skillswap/suggestions';

  constructor(private http: HttpClient) {}

  // Get all student skill suggestions
  getAllSuggestions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Approve or reject a student suggestion
  reviewSuggestion(
    suggestionId: number,
    status: 'approved' | 'rejected'
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${suggestionId}/review`,
      { status }
    );
  }
}
