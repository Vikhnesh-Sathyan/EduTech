
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CodeShuffleLanguage {
  id: number;
  name: string;
  slug: string;
}

export interface CodeShuffleTopic {
  id: number;
  name: string;
  description: string | null;
}

export interface CodeShuffleTaskPayload {
  title: string;
  description: string;
  languageId: number;
  difficulty: string;
  maxMarks: number;
  hintText: string;
  publishDate: string | null;
  dueDate: string | null;
  topicIds: number[];
  correctBlocks: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CodeShuffleService {

  private readonly apiUrl =
    'http://localhost:5000/api/mentor/advanced/code-shuffle';

  constructor(private readonly http: HttpClient) {}

  getAvailableLanguages(): Observable<{
    message: string;
    languages: CodeShuffleLanguage[];
  }> {
    return this.http.get<{
      message: string;
      languages: CodeShuffleLanguage[];
    }>(`${this.apiUrl}/languages`);
  }

  getMyTopics(): Observable<{
    message: string;
    topics: CodeShuffleTopic[];
  }> {
    return this.http.get<{
      message: string;
      topics: CodeShuffleTopic[];
    }>(`${this.apiUrl}/topics/mine`);
  }

  getFormOptions(): Observable<{
    languages: CodeShuffleLanguage[];
    topics: CodeShuffleTopic[];
  }> {
    return forkJoin({
      languageResponse: this.getAvailableLanguages(),
      topicResponse: this.getMyTopics()
    }).pipe(
      map((response) => ({
        languages: response.languageResponse.languages,
        topics: response.topicResponse.topics
      }))
    );
  }

  createTask(payload: CodeShuffleTaskPayload): Observable<{
    message: string;
    taskId?: number;
  }> {
    return this.http.post<{
      message: string;
      taskId?: number;
    }>(`${this.apiUrl}/tasks`, payload);
  }

  
createTopic(payload: {
  name: string;
  description: string | null;
}): Observable<{
  message: string;
  topic: {
    id: number;
    name: string;
    description: string | null;
  };
}> {
  return this.http.post<{
    message: string;
    topic: {
      id: number;
      name: string;
      description: string | null;
    };
  }>(`${this.apiUrl}/topics`, payload);
}

deleteTask(taskId: number): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(
    `${this.apiUrl}/tasks/${taskId}`
  );
}

}
