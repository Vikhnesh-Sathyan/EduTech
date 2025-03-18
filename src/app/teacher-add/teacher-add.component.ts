import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';  // <-- Import FormBuilder and FormGroup

@Component({
  selector: 'app-teacher-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './teacher-add.component.html',
  styleUrls: ['./teacher-add.component.css']
})
export class TeacherAddComponent implements OnInit {
  teacherForm: FormGroup;
  teachers: any[] = [];

  constructor(private http: HttpClient, private fb: FormBuilder) {
    // Initialize form
    this.teacherForm = this.fb.group({
      name: [''],
      email: [''],
      qualification: [''],
      resume: [null],
      certification: [null]
    });
  }

  ngOnInit(): void {
    this.fetchAllTeachers();
  }

  // Fetch all teachers from the backend
  fetchAllTeachers() {
    this.http.get<any[]>('http://localhost:3000/api/admin/all-teachers').subscribe(
      (data) => {
        console.log('Fetched teachers:', data);  // Log the data here
        this.teachers = data;
      },
      (error) => {
        console.error('Error fetching teacher details:', error);
        alert('Error loading teacher details');
      }
    );
  }
  
  // Handle file changes (for resume and certification)
  onFileChange(event: any) {
    const file = event.target.files[0];
    const fieldName = event.target.name;

    if (fieldName === 'resume') {
      this.teacherForm.patchValue({ resume: file });
    } else if (fieldName === 'certification') {
      this.teacherForm.patchValue({ certification: file });
    }
  }

  // Handle the registration submission
  registerTeacher() {
    const formData = new FormData();
    formData.append('name', this.teacherForm.value.name);
    formData.append('email', this.teacherForm.value.email);
    formData.append('qualification', this.teacherForm.value.qualification);
    formData.append('resume', this.teacherForm.value.resume);
    formData.append('certification', this.teacherForm.value.certification);

    this.http.post('http://localhost:3000/api/teacher/register', formData).subscribe(
      (response) => {
        console.log('Teacher registered:', response);
        alert('Teacher registered successfully');
      },
      (error) => {
        console.error('Error registering teacher:', error);
        alert('Error registering teacher');
      }
    );
  }

  // Bulk approve selected teachers
  bulkApprove() {
    const selectedTeachers = this.teachers.filter((teacher) => teacher.selected && teacher.status === 'pending');
    selectedTeachers.forEach((teacher) => {
      this.updateStatus(teacher.id, 'approved');
    });
  }

  // Bulk reject selected teachers
  bulkReject() {
    const selectedTeachers = this.teachers.filter((teacher) => teacher.selected && teacher.status === 'pending');
    selectedTeachers.forEach((teacher) => {
      this.updateStatus(teacher.id, 'rejected');
    });
  }

  // Update teacher status
  updateStatus(id: number, status: string) {
    this.http.put(`http://localhost:3000/api/admin/teacher/${id}/status`, { status }).subscribe(
      () => {
        alert(`Teacher ${status} successfully`);
        // Update status locally without removing
        const teacher = this.teachers.find((t) => t.id === id);
        if (teacher) {
          teacher.status = status;
        }
      },
      (error) => {
        console.error('Error updating teacher status:', error);
        alert('Error updating teacher status');
      }
    );
  }

  // Check if any pending teacher is selected
  hasSelectedTeachers(): boolean {
    return this.teachers.some((teacher) => teacher.selected && teacher.status === 'pending');
  }
}
