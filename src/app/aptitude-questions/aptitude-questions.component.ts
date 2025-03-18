import { Component, OnInit } from '@angular/core';
import { AptitudeService } from '../aptitude.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-aptitude-questions',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule],
  templateUrl: './aptitude-questions.component.html',
  styleUrl: './aptitude-questions.component.css',
  providers:[AptitudeService]
})
export class AptitudeQuestionsComponent implements OnInit{
  companyName: string = '';
  aptitudeFilePath: string | null = null;
  isLoading: boolean = false;

  constructor(private aptitudeService: AptitudeService) {}

  ngOnInit(): void {
    // Fetch aptitude questions for the company
    this.getAptitudeQuestions();
  }

  getAptitudeQuestions() {
    this.isLoading = true;
    this.aptitudeService.getAptitudeQuestions(this.companyName).subscribe(response => {
      this.aptitudeFilePath = response.file_path;
      if (!this.aptitudeFilePath) {
        alert('No file path returned. Please check the backend response.');
      }
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      alert('Error fetching aptitude questions: ' + (error.message || 'Unknown error occurred.'));
    });
  }

}
