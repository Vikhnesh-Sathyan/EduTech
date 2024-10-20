import { Component, Input } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface UploadedContent {
  grade: number;
  title: string;
  description: string;
  type: string; // Subject
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
  @Input() availableGrades: number[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  grades: number[] = [8, 9, 10, 11, 12];
  subjectsByGrade: { [key: number]: string[] } = {
    8: ['Math', 'Science', 'English', 'History'],
    9: ['Math', 'Biology', 'Physics', 'Literature'],
    10: ['Math', 'Chemistry', 'Geography', 'Art'],
    11: ['Physics', 'Biology', 'Mathematics', 'Computer Science'],
    12: ['Mathematics', 'Statistics', 'Business Studies', 'Psychology'],
  };

  newContent = {
    grade: null as number | null,
    title: '',
    description: '',
    type: '',
    file: null,
  };

  uploadedContents: UploadedContent[] = [];
  selectedGrade: number | null = null;
  gradeContents: { [key: number]: UploadedContent[] } = {};
  selectedSubjects: string[] = [];
  uploading: boolean = false;
  successMessage: string | null = null;

  // Store search queries for each grade
  searchQuery: { [key: number]: string } = {};

  onFileSelected(event: any) {
    this.newContent.file = event.target.files[0];
  }

  uploadContent() {
    if (this.newContent.grade && this.newContent.file) {
      const formData = new FormData();
      formData.append('grade', this.newContent.grade.toString());
      formData.append('title', this.newContent.title);
      formData.append('description', this.newContent.description);
      formData.append('type', this.newContent.type);
      formData.append('file', this.newContent.file);

      this.uploading = true;
      this.successMessage = null;

      this.http.post('http://localhost:3000/api/upload-content', formData).subscribe(
        (response: any) => {
          const content: UploadedContent = response.content;
          this.uploadedContents.push(content);
          this.resetForm();
          this.successMessage = 'Upload successful!';
        },
        (error) => {
          console.error('Upload failed', error);
        },
        () => {
          this.uploading = false;
        }
      );
    } else {
      console.error('Please select a grade and file.');
    }
  }

  getContentForGrade(grade: number) {
    if (grade !== null) {
      this.selectedGrade = grade;

      if (!this.gradeContents[grade]) {
        this.http.get<UploadedContent[]>(`http://localhost:3000/api/get-content/${grade}`).subscribe(
          (data: UploadedContent[]) => {
            this.gradeContents[grade] = data;
          },
          (error) => {
            console.error('Error fetching content for grade:', error);
          }
        );
      }
    }
  }

  getContentsForGrade(grade: number): UploadedContent[] {
    return this.gradeContents[grade] || [];
  }

  getFilteredContentsForGrade(grade: number): UploadedContent[] {
    const query = this.searchQuery[grade]?.toLowerCase() || '';
    return this.getContentsForGrade(grade).filter((content) =>
      content.type.toLowerCase().includes(query)
    );
  }

  deleteContent(content: UploadedContent) {
    const fileName = content.fileUrl.substring(content.fileUrl.lastIndexOf('/') + 1);
    const grade = content.grade;

    this.http.delete(`http://localhost:3000/api/delete-content/${grade}/${fileName}`).subscribe(
      () => {
        this.gradeContents[grade] = this.gradeContents[grade].filter(
          (c) => c.fileUrl !== content.fileUrl
        );
      },
      (error) => {
        console.error('Error deleting content:', error);
      }
    );
  }

  resetForm() {
    this.newContent = { grade: null, title: '', description: '', type: '', file: null };
  }

  onGradeChange() {
    if (this.newContent.grade !== null) {
      this.selectedSubjects = this.subjectsByGrade[this.newContent.grade] || [];
    } else {
      this.selectedSubjects = [];
    }
  }
}
