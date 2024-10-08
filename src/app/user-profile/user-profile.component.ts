import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import axios from 'axios';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true, // Mark this component as standalone
  imports: [ReactiveFormsModule, CommonModule] // Include ReactiveFormsModule in imports
})
export class UserProfileComponent implements OnInit {
  userId = 1; // Example user ID (you can replace this with the actual logged-in user's ID)
  userProfile: any;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      skills: ['', Validators.required],
      interests: [''],
      availability: ['']
    });
  }

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    axios.get(`http://localhost:3000/api/profile/${this.userId}`)
      .then(response => {
        this.userProfile = response.data;
        // Populate the form with user profile data
        this.profileForm.patchValue({
          skills: this.userProfile.skills,
          interests: this.userProfile.interests,
          availability: this.userProfile.availability
        });
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
  }

  onSubmit(): void {
    axios.put(`http://localhost:3000/api/profile/${this.userId}`, this.profileForm.value)
      .then(response => {
        console.log('Profile updated:', response.data);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
      });
  }
}
