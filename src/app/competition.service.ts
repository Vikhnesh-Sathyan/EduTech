import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CompetitionService {
  private API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  bubbleSort(data: number[]) {
    return this.http.post(`${this.API_URL}/bubble-sort`, { array: data });
  }
}
