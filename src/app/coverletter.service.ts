import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface CoverLetterInput {
  name: string;
  role: string;
  experience: number;
  skills: string;
  company: string;
  student_id: number;
}

interface CoverLetter {
  id: number;
  student_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
}

interface CoverLetterResponse {
  id: number;
  template: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoverletterService {
  private apiUrl = 'http://localhost:3000/api/coverletter';

  constructor(private http: HttpClient) {}

  // Generate and save a cover letter template
  generateCoverLetterTemplate(input: CoverLetterInput): Observable<CoverLetterResponse> {
    const template = this.createTemplate(input);
    console.log('Generating cover letter template for:', input);
    
    return this.http.post<CoverLetterResponse>(this.apiUrl, { 
      template,
      student_id: input.student_id 
    }).pipe(
      map(response => {
        if (!response) {
          throw new Error('Empty response from server');
        }
        if (!response.template) {
          throw new Error('No template in response');
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // Get all cover letters for a student
  getCoverLetters(studentId: number): Observable<CoverLetter[]> {
    return this.http.get<CoverLetter[]>(`${this.apiUrl}/${studentId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Update a cover letter
  updateCoverLetter(id: number, content: string): Observable<{ message: string; timestamp: string }> {
    return this.http.put<{ message: string; timestamp: string }>(
      `${this.apiUrl}/${id}`,
      { content }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a cover letter
  deleteCoverLetter(id: number): Observable<{ message: string; timestamp: string }> {
    return this.http.delete<{ message: string; timestamp: string }>(
      `${this.apiUrl}/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private createTemplate(input: CoverLetterInput): string {
    const today = new Date().toLocaleDateString();
    
    return `[Your Name]
[Your Address]
[City, State ZIP]
[Your Email]
[Your Phone]
${today}

[Hiring Manager's Name]
[Company Name]
[Company Address]
[City, State ZIP]

Dear Hiring Manager,

I am writing to express my strong interest in the ${input.role} position at ${input.company}. With ${input.experience} years of experience in the field, I am confident in my ability to contribute effectively to your team.

My key skills include ${input.skills}, which align perfectly with the requirements of this position. I have demonstrated success in similar roles and am particularly drawn to ${input.company}'s innovative approach and industry leadership.

I would welcome the opportunity to discuss how my experience and skills could benefit ${input.company}. Thank you for considering my application.

Best regards,
${input.name}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while processing the cover letter.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      console.error('Client-side error:', error.error);
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      console.error('Server-side error:', error);
    }
    
    console.error('Cover Letter Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
