
// Displays and filters approved mentors for students
import {
  Component,
  OnInit,
  signal,
  computed
} from '@angular/core';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { StudentMentorService } from '../../../../services/student/student-mentor.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-student-mentors',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './student-mentors.html',
  styleUrl: './student-mentors.css'
})
export class StudentMentors implements OnInit {

  // Stores all mentors returned by the backend
  mentors = signal<any[]>([]);

  // Stores specializations dynamically from mentor data
  specializations = signal<string[]>([]);

  // Stores the current search text
  searchTerm = signal('');

  // Stores the selected specialization
  selectedSpecialization = signal('');

  // Stores the currently selected mentor
  selectedMentor = signal<any | null>(null);

  // Controls loading state
  loading = signal(false);

  // Stores an error message
  errorMessage = signal('');

  // Filters mentors based on search and specialization
  filteredMentors = computed(() => {

    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const specialization = this.selectedSpecialization()
      .trim()
      .toLowerCase();

    return this.mentors().filter((mentor) => {

      const name =
        mentor.name?.toLowerCase() || '';

      const mentorSpecialization =
        mentor.specialization?.trim().toLowerCase() || '';

      const professionalTitle =
        mentor.professional_title?.toLowerCase() || '';

      const skills =
        mentor.skills?.toLowerCase() || '';

      // Search by mentor name, title, specialization, or skills
      const matchesSearch =
        !search ||
        name.includes(search) ||
        mentorSpecialization.includes(search) ||
        professionalTitle.includes(search) ||
        skills.includes(search);

      // Match the selected specialization exactly
      const matchesSpecialization =
        !specialization ||
        mentorSpecialization === specialization;

      return matchesSearch && matchesSpecialization;

    });

  });

  constructor(
    private studentMentorService: StudentMentorService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMentors();
  }

  // Opens the selected mentor profile
  viewProfile(mentorId: number): void {
    this.router.navigate([
      '/mentors',
      mentorId
    ]);
  }

  // Opens the full skills popup
  showSkills(mentor: any): void {
    this.selectedMentor.set(mentor);
  }

  // Closes the skills popup
  closeSkills(): void {
    this.selectedMentor.set(null);
  }

  // Loads approved mentors and builds specialization options
  loadMentors(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.studentMentorService
      .getMentors()
      .subscribe({

        next: (response: any) => {

          console.log(
            'STUDENT MENTORS RESPONSE:',
            response
          );

          const mentors = Array.isArray(response?.mentors)
            ? response.mentors
            : [];

          this.mentors.set(mentors);

          // Extract unique, non-empty specializations dynamically
         
const uniqueSpecializations: string[] = [
  ...new Set<string>(
    mentors
      .map((mentor: any): string =>
        typeof mentor.specialization === 'string'
          ? mentor.specialization.trim()
          : ''
      )
      .filter((specialization: string) =>
        specialization.length > 0
      )
  )
].sort((a: string, b: string) =>
  a.localeCompare(b)
);

this.specializations.set(uniqueSpecializations);

          this.specializations.set(uniqueSpecializations);

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load mentors:',
            error
          );

          this.errorMessage.set(
            'Unable to load mentors right now.'
          );

          this.mentors.set([]);
          this.specializations.set([]);
          this.loading.set(false);

          this.toastService.error(
            'Unable to load mentors right now.'
          );

        }

      });

  }

  // Updates the mentor search text
  updateSearch(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);

  }

  // Updates the selected specialization
  updateSpecialization(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    this.selectedSpecialization.set(
      select.value
    );

  }

  // Sends a mentorship request
  requestMentorship(mentorId: number): void {

    this.studentMentorService
      .requestMentorship(mentorId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'MENTORSHIP REQUEST RESPONSE:',
            response
          );

          this.toastService.success(
            'Mentorship request sent successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Mentorship request failed:',
            error
          );

          this.toastService.error(
            error?.error?.message ||
            'Failed to send mentorship request.'
          );

        }

      });

  }

}
