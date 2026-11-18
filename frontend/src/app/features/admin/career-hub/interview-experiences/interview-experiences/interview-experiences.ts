
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCareerInterviewExperiencesService } from '../../../../../services/admin/career-hub/admin-career-interview-experiences.service';

interface InterviewExperience {
  id: number;
  company_name: string;
  role_name: string;
  country_name: string;
  experience_level: string;
  questions_text: string;
  contributor_name: string;
  contributor_role: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-interview-experiences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-experiences.html',
  styleUrl: './interview-experiences.css'
})
export class InterviewExperiences implements OnInit {

  private service = inject(AdminCareerInterviewExperiencesService);

  experiences = signal<InterviewExperience[]>([]);
  selectedExperience = signal<InterviewExperience | null>(null);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadExperiences();
  }

  loadExperiences(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getInterviewExperiences().subscribe({

      next: (response) => {

        this.experiences.set(response.data || []);
        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load interview experiences.'
        );

        this.loading.set(false);

      }

    });

  }

  archiveExperience(id: number): void {

    const confirmed = window.confirm(
      'Are you sure you want to archive this interview experience?'
    );

    if (!confirmed) {
      return;
    }

    this.service.archiveInterviewExperience(id).subscribe({

      next: (response) => {

        this.successMessage.set(
          response.message || 'Interview experience archived successfully.'
        );

        this.loadExperiences();

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to archive interview experience.'
        );

      }

    });

  }

  viewExperience(experience: InterviewExperience): void {
  this.selectedExperience.set(experience);
}

closeExperienceDetails(): void {
  this.selectedExperience.set(null);
}


}
