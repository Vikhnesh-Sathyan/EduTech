
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// NOTE INTERFACE
// =====================================================

export interface StudentNote {
  id: number;

  subject_id: number | null;
  subject_name?: string | null;

  problem_id: number | null;
  problem_title?: string | null;

  title: string;
  note_content: string;

  note_type: 'theory' | 'code' | 'concept' | 'mistake' | 'other';

  language: 'python' | 'javascript' | 'java' | null;

  is_pinned: number;

  created_at: string;
  updated_at: string;
}

// =====================================================
// API RESPONSE INTERFACES
// =====================================================

export interface StudentNotesResponse {
  success: boolean;
  message: string;
  totalNotes: number;
  data: StudentNote[];
}

export interface StudentNoteResponse {
  success: boolean;
  message: string;
  data: StudentNote;
}

export interface StudentNoteActionResponse {
  success: boolean;
  message: string;
  noteId?: number;
  is_pinned?: number;
}

// =====================================================
// CREATE / UPDATE NOTE REQUEST
// =====================================================

export interface StudentNotePayload {
  subject_id: number;
  problem_id?: number | null;
  title: string;
  note_content: string;
  note_type: 'theory' | 'code' | 'concept' | 'mistake' | 'other';
  language: 'python' | 'javascript' | 'java' | null;
}

// =====================================================
// STUDENT NOTES SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class StudentNotesService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/student/logic-to-code';

  // ===================================================
  // CREATE NOTE
  // ===================================================

  createNote(payload: StudentNotePayload): Observable<StudentNoteActionResponse> {

    return this.http.post<StudentNoteActionResponse>(
      `${this.apiUrl}/notes`,
      payload
    );

  }

  // ===================================================
  // GET ALL NOTES
  // ===================================================

  getNotes(): Observable<StudentNotesResponse> {

    return this.http.get<StudentNotesResponse>(
      `${this.apiUrl}/notes`
    );

  }

  // ===================================================
  // GET NOTE DETAILS
  // ===================================================

  getNoteById(noteId: number): Observable<StudentNoteResponse> {

    return this.http.get<StudentNoteResponse>(
      `${this.apiUrl}/notes/${noteId}`
    );

  }

  // ===================================================
  // UPDATE NOTE
  // ===================================================

  updateNote(
    noteId: number,
    payload: Partial<StudentNotePayload>
  ): Observable<StudentNoteActionResponse> {

    return this.http.put<StudentNoteActionResponse>(
      `${this.apiUrl}/notes/${noteId}`,
      payload
    );

  }

  // ===================================================
  // DELETE NOTE
  // ===================================================

  deleteNote(noteId: number): Observable<StudentNoteActionResponse> {

    return this.http.delete<StudentNoteActionResponse>(
      `${this.apiUrl}/notes/${noteId}`
    );

  }

  // ===================================================
  // PIN / UNPIN NOTE
  // ===================================================

  togglePin(noteId: number): Observable<StudentNoteActionResponse> {

    return this.http.patch<StudentNoteActionResponse>(
      `${this.apiUrl}/notes/${noteId}/pin`,
      {}
    );

  }

}
