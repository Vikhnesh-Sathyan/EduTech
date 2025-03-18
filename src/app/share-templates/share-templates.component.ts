import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-templates',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './share-templates.component.html',
  styleUrls: ['./share-templates.component.css']
})
export class ShareTemplatesComponent implements OnInit {

  students: any[] = [];
  selectedStudents: { [key: number]: boolean } = {}; // Store selected students
  selectedFile!: File;
  photoPreview: string | ArrayBuffer | null = null; // For displaying photo preview
  companyName: string = ''; // For storing company name

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  // Handle file selection and display preview
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.photoPreview = reader.result; // Display image preview
      reader.readAsDataURL(file);
    }
  }

  // Load students (mock data from API)
  loadStudents(): void {
    this.http.get<any[]>('http://localhost:3000/api/students').subscribe(
      (data) => {
        this.students = data;
      },
      (error) => {
        console.error('Error loading students:', error);
      }
    );
  }

  // Share the selected photo with selected students
  shareTemplate(): void {
    // Check if a photo is uploaded
    if (!this.selectedFile) {
      alert('Please upload a photo.');
      return;
    }

    // Check if a company name is provided
    if (!this.companyName) {
      alert('Please provide the company name.');
      return;
    }

    // Filter selected students
    const selectedStudentIds = Object.keys(this.selectedStudents).filter(
      (key) => this.selectedStudents[+key]
    );

    // Check if at least one student is selected
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student.');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('companyName', this.companyName);
    formData.append('file', this.selectedFile);
    formData.append('studentIds', selectedStudentIds.join(','));

    // Send form data to the backend
    this.http.post('http://localhost:3000/api/shareTemplate', formData).subscribe(
      (response) => {
        console.log('Template shared successfully', response);
        alert('Template shared successfully!');
      },
      (error) => {
        console.error('Error sharing template:', error);
        alert('There was an error sharing the template.');
      }
    );
  }
}
