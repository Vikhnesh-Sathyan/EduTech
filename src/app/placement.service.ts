import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacementService {
  private alertsUrl = 'http://localhost:3000/api/alerts';

  constructor(private http: HttpClient) {}

  sendAlert(alert: { title: string; message: string; sender: string }): Observable<any> {
    return this.http.post(this.alertsUrl, alert);
  }

  fetchAlerts(): Observable<any[]> {
    return this.http.get<any[]>(this.alertsUrl);
  }
}
