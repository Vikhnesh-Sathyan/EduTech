
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AdvancedTheoryQuiz {
  id: number;
  mentor_id?: number;
  title: string;
  description: string | null;
  topic_id: number | null;
  subtopic_id: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pass_percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TheoryQuizCsvPreview {
  message: string;
  valid: boolean;
  totalQuestions: number;
  questions: {
    question_text: string;
    options: {
      option_text: string;
      is_correct: number;
      display_order: number;
    }[];
    explanation: string | null;
    concept_tag: string | null;
    marks: number;
    display_order: number;
  }[];
}

export interface TheoryQuizOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: number | boolean;
  display_order: number;
}

export interface TheoryQuizQuestion {
  id: number;
  question_text: string;
  explanation: string | null;
  concept_tag: string | null;
  marks: number;
  display_order: number;
  status: string;
  options: TheoryQuizOption[];
}

export interface TheoryQuizDetails extends AdvancedTheoryQuiz {
  mentor_id: number;
  questions: TheoryQuizQuestion[];
}

export interface TheoryQuizDetailsResponse {
  message: string;
  quiz: TheoryQuizDetails;
}

export interface TheoryQuizCsvImportResponse {
  message: string;
  quizId: number;
  totalQuestions: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedTheoryQuizService {
  private readonly apiUrl =
    'http://localhost:5000/api/mentor/advanced/theory-quizzes';

  private readonly csvUrl = `${this.apiUrl}/csv`;

  constructor(private http: HttpClient) {}

  // Preview and validate the CSV file
  previewCsv(file: File): Observable<TheoryQuizCsvPreview> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<TheoryQuizCsvPreview>(
      `${this.csvUrl}/preview`,
      formData
    );
  }

  // Import CSV and create a draft quiz
  importCsv(
    file: File,
    quizDetails: {
      title: string;
      description?: string;
      topic_id?: number | null;
      subtopic_id?: number | null;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      pass_percentage: number;
    }
  ): Observable<TheoryQuizCsvImportResponse> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('title', quizDetails.title);
    formData.append('description', quizDetails.description ?? '');
    formData.append('topic_id', String(quizDetails.topic_id ?? ''));
    formData.append('subtopic_id', String(quizDetails.subtopic_id ?? ''));
    formData.append('difficulty', quizDetails.difficulty);
    formData.append(
      'pass_percentage',
      String(quizDetails.pass_percentage)
    );

    return this.http.post<TheoryQuizCsvImportResponse>(
      `${this.csvUrl}/import`,
      formData
    );
  }

  // Get all quizzes belonging to the logged-in mentor
  getMyQuizzes(): Observable<{
    message: string;
    quizzes: AdvancedTheoryQuiz[];
  }> {
    return this.http.get<{
      message: string;
      quizzes: AdvancedTheoryQuiz[];
    }>(this.apiUrl);
  }

  // Get one quiz with its questions, options and answer key
  getMyQuizById(
    quizId: number
  ): Observable<TheoryQuizDetailsResponse> {
    return this.http.get<TheoryQuizDetailsResponse>(
      `${this.apiUrl}/${quizId}`
    );
  }
}
