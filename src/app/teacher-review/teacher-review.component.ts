import { Component, OnInit } from '@angular/core';
import { SubmissionService } from '../submission.service'; 
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-teacher-review',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './teacher-review.component.html',
  styleUrls: ['./teacher-review.component.css'],
  providers: [SubmissionService]
})
export class TeacherReviewComponent implements OnInit {
  submissions: any[] = [];

  constructor(private submissionService: SubmissionService, private http: HttpClient) {}

  ngOnInit(): void {
    this.getSubmissions();
  }

  getSubmissions(): void {
    this.submissionService.getSubmissions().subscribe(
      (data: any[]) => {
        console.log('Fetched submissions:', data); // Debug log
        this.submissions = data;
      },
      (error: any) => {
        console.error('Error fetching submissions:', error);
      }
    );
  }

  updateSubmissionStatus(id: number, status: string) {
    this.http.patch(`http://localhost:3000/submissions/${id}`, { status })
      .subscribe({
        next: () => {
          console.log('Status updated successfully');
          this.getSubmissions(); // Refresh the submissions list
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
  }
}
