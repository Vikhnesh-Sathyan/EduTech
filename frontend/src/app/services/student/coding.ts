
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CodingService {
  private apiUrl = 'http://localhost:5000/api/recommendation/coding';

  constructor(private http: HttpClient) {}

  // Get coding question cards
  getCodePosts(searchText = '', subjectId = '') {
    let params = new HttpParams();

    if (searchText.trim()) {
      params = params.set('search', searchText.trim());
    }

    if (subjectId) {
      params = params.set('subject_id', subjectId);
    }

    return this.http.get(this.apiUrl, { params });
  }

  // Get one question
  getCodePostById(postId: number) {
    return this.http.get(`${this.apiUrl}/${postId}`);
  }

  // Create a coding question
  createCodePost(question: {
    title: string;
    subject_id: number;
    problem_statement: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    search_keywords: string;
  }) {
    return this.http.post(this.apiUrl, question);
  }

  // Save code solution
  createCodeSolution(
    postId: number,
    solution: {
      solution_title: string;
      programming_language: string;
      code: string;
      algorithm_explanation: string;
      time_complexity: string;
      space_complexity: string;
    }
  ) {
    return this.http.post(`${this.apiUrl}/${postId}/solutions`, solution);
  }

  // Get code highlights
  getCodeHighlights(solutionId: number) {
    return this.http.get(
      `${this.apiUrl}/solutions/${solutionId}/highlights`
    );
  }

  // Create code highlight
  createCodeHighlight(
    solutionId: number,
    highlight: {
      start_line: number;
      end_line: number;
      explanation: string;
      highlight_color?: string;
    }
  ) {
    return this.http.post(
      `${this.apiUrl}/solutions/${solutionId}/highlights`,
      highlight
    );
  }

  // Update code highlight
  updateCodeHighlight(
    solutionId: number,
    highlightId: number,
    highlight: {
      start_line: number;
      end_line: number;
      explanation: string;
      highlight_color?: string;
    }
  ) {
    return this.http.put(
      `${this.apiUrl}/solutions/${solutionId}/highlights/${highlightId}`,
      highlight
    );
  }

  // Delete code highlight
  deleteCodeHighlight(solutionId: number, highlightId: number) {
    return this.http.delete(
      `${this.apiUrl}/solutions/${solutionId}/highlights/${highlightId}`
    );
  }

  // Generate algorithm steps using Gemini AI
  generateAlgorithm(solutionId: number) {
    return this.http.post(
      `${this.apiUrl}/solutions/${solutionId}/algorithm-generate`,
      {}
    );
  }

  // Save reviewed algorithm steps
  createAlgorithmSteps(
    solutionId: number,
    steps: {
      step_title: string;
      step_description: string;
      step_type: 'start' | 'input' | 'process' | 'condition' | 'output' | 'loop' | 'end';
      code_line_start: number | null;
      code_line_end: number | null;
    }[]
  ) {
    return this.http.post(
      `${this.apiUrl}/solutions/${solutionId}/algorithm-steps`,
      { steps }
    );
  }

  // Get saved algorithm steps
  getAlgorithmSteps(solutionId: number) {
    return this.http.get(
      `${this.apiUrl}/solutions/${solutionId}/algorithm-steps`
    );
  }
}
