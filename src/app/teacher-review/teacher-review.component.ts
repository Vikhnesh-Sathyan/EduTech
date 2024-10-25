import { Component, OnInit } from '@angular/core';
import { SubmissionService } from '../submission.service'; // Adjust the import path as necessary
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // Import HttpClient

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

  constructor(private submissionService: SubmissionService, private http: HttpClient) {} // Inject HttpClient

  ngOnInit(): void {
    this.getSubmissions();
  }

  // Method to get all submissions
  getSubmissions(): void {
    this.submissionService.getSubmissions().subscribe(
      (data: any[]) => {
        this.submissions = data;
      },
      (error: any) => {
        console.error('Error fetching submissions:', error);
      }
    );
  }

  // Update the status of a submission
  updateSubmissionStatus(id: number, status: string) {
    this.http.patch(`http://localhost:3000/submissions/${id}`, { status }) // Make sure to use this.http
      .subscribe({
        next: () => {
          console.log('Status updated successfully');
          this.getSubmissions(); // Refresh the submissions
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
  }
}
