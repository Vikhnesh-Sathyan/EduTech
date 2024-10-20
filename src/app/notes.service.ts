import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private apiUrl = 'http://localhost:3000/api/notes'; // API base URL

  private notesSubject = new BehaviorSubject<any[]>([]);
  public notes$ = this.notesSubject.asObservable(); // Expose as observable

  constructor(private http: HttpClient) {}

  // Fetch notes for a specific class and update the subject
  fetchNotesForClass(classId: number): void {
    const url = `${this.apiUrl}/class/${classId}`;
    console.log(`Fetching notes from: ${url}`);
    
    this.http.get<any[]>(url).subscribe({
      next: (notes: any[]) => {
        console.log('Fetched notes:', notes);
        this.notesSubject.next(notes);
      },
      error: (err: any) => {
        console.error('Failed to fetch notes:', err);
        alert('Notes not found for this class!');
      },
    });
  }
  

  // Send a new note to a specific class
  sendNoteToClass(noteContent: string, classId: number): Observable<any> {
    const noteData = { noteContent, classId }; // Prepare data to be sent
    return this.http.post<any>(this.apiUrl, noteData); // Specify return type
  }
}
