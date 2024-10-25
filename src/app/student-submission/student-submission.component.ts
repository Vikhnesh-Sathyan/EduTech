import { Component, OnInit } from '@angular/core';
import { SubmissionService } from '../submission.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-submission',
  standalone:true,
  imports:[CommonModule,HttpClientModule,FormsModule],
  templateUrl: './student-submission.component.html',
  styleUrls: ['./student-submission.component.css'],
  providers:[SubmissionService]
})
export class StudentSubmissionComponent implements OnInit {
  studentName: string = '';
  submissionText: string = '';
  className: number | null = null;
  message: string | null = null;
  submissions: any[] = [];

  constructor(private submissionService: SubmissionService) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  submit(): void {
    const submissionData = {
      text: this.submissionText,
      studentName: this.studentName,
      className: this.className,
    };

    this.submissionService.submitSubmission(submissionData).subscribe(
      (response) => {
        this.message = 'Submission successful!';
        this.submissionText = '';
        this.studentName = '';
        this.className = null;
        this.loadSubmissions(); // Reload submissions after new entry
      },
      (error) => {
        console.error('Submission error:', error);
        this.message = 'Error submitting submission. Please try again.';
      }
    );
  }

  loadSubmissions(): void {
    const studentName = 'John Doe'; // Replace with dynamic student name
    this.submissionService.getStudentSubmissions(studentName).subscribe(
      (data) => {
        this.submissions = data;
      },
      (error) => {
        console.error('Error loading submissions:', error);
      }
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }
}
