
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CodingService {
  private apiUrl = 'http://localhost:5000/api/recommendation/coding';

  constructor(private http: HttpClient) {}

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

  
getCodeSolutions(postId: number) {
  return this.http.get(
    `${this.apiUrl}/${postId}/solutions`
  );
}

}
