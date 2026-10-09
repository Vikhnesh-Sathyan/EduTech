// Handles the admin mentor verification page

import { Component, OnInit, signal } from '@angular/core';
import { AdminMentor } from '../../../../services/admin/admin-mentor';

@Component({
  selector: 'app-mentor-verification',
  standalone: true,
  templateUrl: './mentor-verification.html',
  styleUrl: './mentor-verification.css'
})
export class MentorVerification implements OnInit {

  // Stores mentors waiting for verification
  mentors = signal<any[]>([]);

  // Controls loading state
  loading = signal(true);

  // Stores API error message
  errorMessage = signal('');

  // Stores success message
  successMessage = signal('');

  // Stores selected mentor for details view
  selectedMentor = signal<any | null>(null);

  // Controls rejection modal
  showRejectModal = signal(false);

  // Stores rejection reason entered by admin
  rejectionReason = signal('');

  constructor(
    private adminMentorService: AdminMentor
  ) {}

  ngOnInit(): void {
    this.loadPendingMentors();
  }

  // ==========================================
  // LOAD PENDING MENTORS
  // ==========================================

  loadPendingMentors(): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.adminMentorService
      .getPendingMentors()
      .subscribe({

        next: (response: any) => {

          this.mentors.set(
            response.mentors || []
          );

          this.loading.set(false);

        },

        error: (error: any) => {

          console.error(
            'MENTOR API ERROR:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load pending mentors'
          );

          this.loading.set(false);

        }

      });
  }

  // ==========================================
  // VIEW MENTOR DETAILS
  // ==========================================

  viewDetails(mentor: any): void {

    this.selectedMentor.set(mentor);

    // Clear old messages
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  // ==========================================
  // APPROVE MENTOR
  // ==========================================

  approveMentor(): void {

    const mentor = this.selectedMentor();

    if (!mentor) {
      return;
    }

    this.adminMentorService
      .approveMentor(mentor.id)
      .subscribe({

        next: (response: any) => {

          // Show success message
          this.successMessage.set(
            'Mentor approved successfully.'
          );

          // Remove approved mentor
          // from pending list
          this.mentors.update(
            mentors =>
              mentors.filter(
                item => item.id !== mentor.id
              )
          );

          // Return to mentor list
          this.selectedMentor.set(null);

        },

        error: (error: any) => {

          console.error(
            'MENTOR APPROVAL ERROR:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to approve mentor'
          );

        }

      });
  }

  // ==========================================
  // OPEN REJECT MODAL
  // ==========================================

  openRejectModal(): void {

    // Clear previous rejection reason
    this.rejectionReason.set('');

    // Open modal
    this.showRejectModal.set(true);
  }

  // ==========================================
  // CLOSE REJECT MODAL
  // ==========================================

  closeRejectModal(): void {

    this.showRejectModal.set(false);

    // Clear entered reason
    this.rejectionReason.set('');
  }

  // ==========================================
  // REJECT MENTOR
  // ==========================================

  rejectMentor(): void {

    const mentor = this.selectedMentor();

    if (!mentor) {
      return;
    }

    // Get rejection reason
    const reason = this.rejectionReason().trim();

    // Do not continue without a reason
    if (!reason) {
      return;
    }

    this.adminMentorService
      .rejectMentor(
        mentor.id,
        reason
      )
      .subscribe({

        next: (response: any) => {

          // Close rejection modal
          this.showRejectModal.set(false);

          // Clear rejection reason
          this.rejectionReason.set('');

          // Show success message
          this.successMessage.set(
            'Mentor profile rejected successfully.'
          );

          // Remove rejected mentor
          // from pending list
          this.mentors.update(
            mentors =>
              mentors.filter(
                item => item.id !== mentor.id
              )
          );

          // Return to mentor list
          this.selectedMentor.set(null);

        },

        error: (error: any) => {

          console.error(
            'MENTOR REJECTION ERROR:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to reject mentor'
          );

        }

      });
  }
}