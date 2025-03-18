import { Component } from '@angular/core';
import { InterviewInsightsService } from '../interview-insights.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-upload-insights',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule],
  templateUrl: './upload-insights.component.html',
  styleUrl: './upload-insights.component.css',
  providers:[InterviewInsightsService]
})
export class UploadInsightsComponent {
  companyName: string = '';
  commonQuestions: string = '';
  aptitudeTestTypes: string = '';
  mockFeedback: string = '';

  constructor(private insightsService: InterviewInsightsService) {}

  // Submit form to upload insights
  onSubmit() {
    const data = {
      company_name: this.companyName,
      common_questions: this.commonQuestions,
      aptitude_test_types: this.aptitudeTestTypes,
      mock_feedback: this.mockFeedback
    };

    this.insightsService.uploadInsights(data).subscribe(response => {
      alert('Interview insights uploaded successfully');
    }, error => {
      alert('Error uploading interview insights');
    });
  }

}
