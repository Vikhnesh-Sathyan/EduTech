import { Component,Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import the Router

interface UploadedContent {
  grade: number;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
}

@Component({
  selector: 'app-studentgenerated',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './studentgenerated.component.html',
  styleUrls: ['./studentgenerated.component.css'],
})
export class StudentgeneratedComponent {
  @Input() availableGrades: number[] = []; // Accept available grades from parent

  // Inject Router service for navigation and HttpClient for API requests
  constructor(private http: HttpClient, private router: Router) {}

  grades: number[] = [8, 9, 10, 11, 12]; // Grades list
  newContent = {
    grade: null as number | null,
    title: '',
    description: '',
    type: '',
    file: null,
  }; // Form model for uploading new content
  uploadedContents: UploadedContent[] = []; // List of uploaded contents
  selectedGrade: number | null = null; // Selected grade to display content for
  gradeContents: { [key: number]: UploadedContent[] } = {}; // Stores content per grade

  uploading: boolean = false; // Loading state
  successMessage: string | null = null; // Success message

  // When a file is selected, store it in the form model
  onFileSelected(event: any) {
    this.newContent.file = event.target.files[0];
  }

  // Upload content to the backend
  uploadContent() {
    if (this.newContent.grade && this.newContent.file) {
      const formData = new FormData();
      formData.append('grade', this.newContent.grade.toString());
      formData.append('title', this.newContent.title);
      formData.append('description', this.newContent.description);
      formData.append('type', this.newContent.type);
      formData.append('file', this.newContent.file);

      this.uploading = true; // Show loading indicator
      this.successMessage = null; // Reset success message

      this.http.post('http://localhost:3000/api/upload-content', formData).subscribe(
        (response: any) => {
          const content: UploadedContent = response.content;
          this.uploadedContents.push(content); // Add the new content to the uploaded contents array
          console.log('Uploaded Contents:', this.uploadedContents);
          this.resetForm(); // Reset the form fields after successful upload
          this.successMessage = 'Upload successful!'; // Set success message
        },
        (error) => {
          console.error('Upload failed', error); // Log errors
        },
        () => {
          this.uploading = false; // Hide loading indicator
        }
      );
    } else {
      console.error('Please select a grade and file.'); // Ensure a file is selected
    }
  }

  // Fetch content for a specific grade
  getContentForGrade(grade: number) {
    this.selectedGrade = grade;
    if (this.gradeContents[grade]) {
      // If contents for the grade are already fetched, do not fetch again
      return;
    }

    this.http.get<UploadedContent[]>(`http://localhost:3000/api/get-content/${grade}`).subscribe(
      (data: UploadedContent[]) => {
        // Save the fetched content for this grade
        this.gradeContents[grade] = data;
        console.log(`Fetched Contents for Grade ${grade}:`, data);
      },
      (error) => {
        console.error('Error fetching content for grade:', error);
      }
    );
  }

  // Return contents filtered by grade
  getContentsForGrade(grade: number): UploadedContent[] {
    return this.gradeContents[grade] || [];
  }

  // Delete content from both backend and the view
  deleteContent(content: UploadedContent) {
    // Extract just the file name from the file URL
    const fileName = content.fileUrl.substring(content.fileUrl.lastIndexOf('/') + 1);

    // Send DELETE request with the file name
    this.http.delete(`http://localhost:3000/api/delete-content/${fileName}`).subscribe(
      (response: any) => {
        // Remove the deleted content from the array
        this.gradeContents[content.grade] = this.gradeContents[content.grade].filter(
          (c) => c.fileUrl !== content.fileUrl
        );
        console.log(`Content deleted:`, content.title);
      },
      (error) => {
        console.error('Error deleting content:', error);
      }
    );
  }

  // Reset the form after submission
  resetForm() {
    this.newContent = { grade: null, title: '', description: '', type: '', file: null };
  }

  // Navigate to the view-content page
 
}
