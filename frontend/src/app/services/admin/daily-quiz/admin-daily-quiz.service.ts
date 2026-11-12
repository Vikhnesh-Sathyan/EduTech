import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface DailyQuizDashboardSubject {
  subject_id: number;
  subject_name: string;

  year_id: number;
  year_name: string;

  department_id: number;
  department_name: string;

  program_id: number;
  program_name: string;

  total_questions: number;
  unused_questions: number;
  possible_quizzes: number;

  low_stock: boolean;
  publish_time: string;
  low_stock_threshold: number;
  automation_status: string;
}

export interface DailyQuizDashboardResponse {
  success: boolean;
  message: string;
  data: DailyQuizDashboardSubject[];
}

export interface DailyQuizQuestionOption {
  option_id: number;
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

export interface DailyQuizQuestion {
  question_id: number;
  subject_id: number;
  question_text: string;
  status: 'active' | 'archived';
  is_used: boolean;

  can_edit: boolean;
  can_archive: boolean;
  can_restore: boolean;

  created_at: string;
  updated_at: string;

  options: DailyQuizQuestionOption[];
}

export interface DailyQuizQuestionBankResponse {
  success: boolean;
  message: string;
  total_questions: number;
  active_questions: number;
  archived_questions: number;
  used_questions: number;
  unused_questions: number;
  data: DailyQuizQuestion[];
}

export interface UpdateDailyQuizQuestion {
  question_text: string;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

export interface DailyQuizQuestionOption {
  option_id: number;
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

export interface DailyQuizQuestion {
  question_id: number;
  subject_id: number;
  question_text: string;
  status: 'active' | 'archived';
  is_used: boolean;
  can_edit: boolean;
  can_archive: boolean;
  can_restore: boolean;
  created_at: string;
  updated_at: string;
  options: DailyQuizQuestionOption[];
}

export interface QuestionBankResponse {
  success: boolean;
  message: string;
  total_questions: number;
  active_questions: number;
  archived_questions: number;
  used_questions: number;
  unused_questions: number;
  data: DailyQuizQuestion[];
}

export interface UpdateDailyQuizQuestion {
  question_text: string;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminDailyQuiz {

  private apiUrl =
    'http://localhost:5000/api/admin/daily-quiz';

  constructor(private http: HttpClient) {}

  // DASHBOARD
getDashboard() {
  return this.http.get<DailyQuizDashboardResponse>(
    `${this.apiUrl}/dashboard`
  );
}

  // CSV PREVIEW
  previewCsv(subjectId: number, file: File) {
    const formData = new FormData();

    formData.append('subject_id', subjectId.toString());
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}/csv/preview`,
      formData
    );
  }

  // CSV IMPORT
  importCsv(subjectId: number, file: File) {
    const formData = new FormData();

    formData.append('subject_id', subjectId.toString());
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}/csv/import`,
      formData
    );
  }

// QUESTION BANK
getQuestions(subjectId: number) {
  return this.http.get<QuestionBankResponse>(
    `${this.apiUrl}/question-bank`,
    {
      params: {
        subject_id: subjectId.toString()
      }
    }
  );
}


// UPDATE QUESTION
updateQuestion(
  questionId: number,
  data: UpdateDailyQuizQuestion
) {
  return this.http.put(
    `${this.apiUrl}/question-bank/${questionId}`,
    data
  );
}

  // ARCHIVE QUESTION
  archiveQuestion(questionId: number) {
    return this.http.patch(
      `${this.apiUrl}/question-bank/${questionId}/archive`,
      {}
    );
  }

  // RESTORE QUESTION
  restoreQuestion(questionId: number) {
    return this.http.patch(
      `${this.apiUrl}/question-bank/${questionId}/restore`,
      {}
    );
  }

  // AUTOMATION SETTINGS
  getAutomationSettings() {
    return this.http.get(`${this.apiUrl}/automation`);
  }

  // SAVE AUTOMATION SETTINGS
  saveAutomationSettings(data: any) {
    return this.http.put(
      `${this.apiUrl}/automation`,
      data
    );
  }

  // PAUSE / RESUME AUTOMATION
  updateAutomationStatus(
    subjectId: number,
    status: 'active' | 'paused'
  ) {
    return this.http.patch(
      `${this.apiUrl}/automation/${subjectId}/status`,
      { status }
    );
  }
}
