
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';

interface SkillSuggestion {
  id: number;
  name: string;
  category?: string | null;
  description?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  admin_comment?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}

@Component({
  selector: 'app-my-suggestions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-suggestions.html',
  styleUrl: './my-suggestions.css'
})
export class MySuggestions implements OnInit {

  // Signals
  suggestions = signal<SkillSuggestion[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  // Computed counts
  totalCount = computed(() => this.suggestions().length);

  pendingCount = computed(
    () => this.suggestions().filter(s => s.status === 'pending').length
  );

  approvedCount = computed(
    () => this.suggestions().filter(s => s.status === 'approved').length
  );

  rejectedCount = computed(
    () => this.suggestions().filter(s => s.status === 'rejected').length
  );

  constructor(private skillSwapService: SkillSwapService) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.skillSwapService.getMySkillSuggestions().subscribe({
      next: (response: any) => {
        this.suggestions.set(
          Array.isArray(response.data) ? response.data : []
        );
        this.loading.set(false);
      },

      error: (error: any) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message ||
          'Unable to load your skill suggestions.'
        );
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'deleted':
        return 'deleted';
      default:
        return 'pending';
    }
  }

  getStatusLabel(status: string): string {
    if (status?.toLowerCase() === 'approved') return 'Approved';
    if (status?.toLowerCase() === 'rejected') return 'Rejected';
    if (status?.toLowerCase() === 'deleted') return 'Deleted';

    return 'Pending Review';
  }
}
