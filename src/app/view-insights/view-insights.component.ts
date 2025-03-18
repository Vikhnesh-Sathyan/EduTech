import { Component } from '@angular/core';
import { InterviewInsightsService } from '../interview-insights.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-view-insights',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule],
  templateUrl: './view-insights.component.html',
  styleUrl: './view-insights.component.css',
  providers:[InterviewInsightsService]
})
export class ViewInsightsComponent {
  companyName: string = '';
  insights: any = null;

  constructor(private insightsService: InterviewInsightsService) {}

  // Fetch insights for a company
  fetchInsights() {
    this.insightsService.getInsights(this.companyName).subscribe(response => {
      this.insights = response;
    }, error => {
      alert('No insights found for this company');
    });
  }
}
