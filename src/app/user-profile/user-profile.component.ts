// src/app/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      skills: ['', Validators.required],
      interests: [''],
      availability: ['']
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.profileForm.valid) {
      const studentProfile = this.profileForm.value;

      // Retrieve existing students from localStorage
      const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');

      // Push new student profile into the array
      existingStudents.push(studentProfile);

      // Save the updated students array back to localStorage
      localStorage.setItem('students', JSON.stringify(existingStudents));

      // Navigate to the skill list after saving
      this.router.navigate(['/skill-list']);
    }
  }

  navigateToSkillList() {
    this.router.navigate(['/skill-list']);
  }
}
