import { Component } from '@angular/core';
import { AptitudeService } from '../aptitude.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-company-test',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule],
  templateUrl: './company-test.component.html',
  styleUrl: './company-test.component.css',
  providers:[AptitudeService]
  })

export class CompanyTestComponent {
  companyName: string = '';
  pdfFile: File | null = null;

  constructor(private aptitudeService: AptitudeService) {}

  // Handle file selection
  onFileChange(event: any) {
    this.pdfFile = event.target.files[0];
  }

  // Submit the form to upload aptitude questions
  onSubmit() {
    if (this.pdfFile && this.companyName) {
      this.aptitudeService.uploadAptitude(this.pdfFile, this.companyName).subscribe(response => {
        alert('File uploaded successfully');
      }, error => {
        alert('Error uploading file');
      });
    }
  }
}
