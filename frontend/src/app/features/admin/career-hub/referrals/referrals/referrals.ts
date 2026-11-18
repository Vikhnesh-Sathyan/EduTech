
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminCareerReferrals,
  CareerReferral
} from '../../../../../services/admin/career-hub/admin-career-referrals';

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './referrals.html',
  styleUrl: './referrals.css'
})
export class Referrals implements OnInit {

  private referralService = inject(AdminCareerReferrals);

  referrals = signal<CareerReferral[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadReferrals();
  }

  loadReferrals(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.referralService.getReferrals().subscribe({
      next: (response) => {
        this.referrals.set(response.referrals || []);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load referral opportunities'
        );
        this.loading.set(false);
      }
    });
  }

  archiveReferral(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to archive this referral opportunity?'
    );

    if (!confirmed) return;

    this.referralService.archiveReferral(id).subscribe({
      next: (response) => {
        this.successMessage.set(
          response.message || 'Referral archived successfully'
        );

        this.referrals.update(items =>
          items.filter(referral => referral.id !== id)
        );
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to archive referral'
        );
      }
    });
  }
}
