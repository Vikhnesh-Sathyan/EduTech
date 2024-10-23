// user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SkillSwapService } from '../skill-swap.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers: [SkillSwapService],
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  hours: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);

  constructor(
    private fb: FormBuilder,
    private skillSwapService: SkillSwapService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      skillsOffered: ['', Validators.required],
      skillsWanted: [''],
      availability: [''],
      startHour: ['', Validators.required],
      startMinute: ['', Validators.required],
      startAmPm: ['', Validators.required],
      endHour: ['', Validators.required],
      endMinute: ['', Validators.required],
      endAmPm: ['', Validators.required],
      interests: [''],
      experienceLevel: [''],
      location: [''],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.profileForm.valid) {
      const startTime = this.formatTime(
        this.profileForm.value.startHour,
        this.profileForm.value.startMinute,
        this.profileForm.value.startAmPm
      );
      const endTime = this.formatTime(
        this.profileForm.value.endHour,
        this.profileForm.value.endMinute,
        this.profileForm.value.endAmPm
      );

      const profileData = {
        ...this.profileForm.value,
        startTime,
        endTime,
      };

      console.log('Profile Data:', profileData); // Log data before sending

      this.skillSwapService.saveProfile(profileData).subscribe(
        (response) => {
          alert('Profile saved successfully!');
          this.navigateToSkillList();
        },
        (error) => {
          console.error('Error saving profile:', error);
          alert('Failed to save profile. Please try again.');
        }
      );
    }
  }

  formatTime(hour: string, minute: string, amPm: string): string {
    let formattedHour = parseInt(hour, 10);
    if (amPm === 'PM' && formattedHour !== 12) {
      formattedHour += 12;
    }
    if (amPm === 'AM' && formattedHour === 12) {
      formattedHour = 0;
    }
    const formattedMinute = minute.padStart(2, '0');
    return `${formattedHour}:${formattedMinute}:00`;
  }

  navigateToSkillList(): void {
    this.router.navigate(['/skill-list']);
  }
}
