
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ImportResponse {
  message: string;
  total: number;
  added: number;
  skipped: number;
}

@Injectable({
  providedIn: 'root'
})
export class CheatsheetImportService {
  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/admin/cheatsheet/import';

  importTechnologies(): Observable<ImportResponse> {
    return this.http.post<ImportResponse>(
      `${this.apiUrl}/technologies`,
      {}
    );
  }
}
