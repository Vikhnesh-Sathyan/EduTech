
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

  // Get one question with its existing submitted code
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

  // Save the original code submitted with the question
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

  
getCodeHighlights(solutionId: number) {
  return this.http.get(
    `${this.apiUrl}/solutions/${solutionId}/highlights`
  );
}

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

deleteCodeHighlight(solutionId: number, highlightId: number) {
  return this.http.delete(
    `${this.apiUrl}/solutions/${solutionId}/highlights/${highlightId}`
  );
}

}
