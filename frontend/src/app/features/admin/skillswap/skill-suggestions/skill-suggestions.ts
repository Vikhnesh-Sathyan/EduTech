import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { AdminSkillSuggestionsService } from '../../../../services/admin/skillswap/admin-skill-suggestions.service';

interface SkillSuggestion {
  id: number;
  name: string;
  category?: string | null;
  description?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  student_name?: string | null;
  student_id?: number;
  created_at?: string;
}

@Component({
  selector: 'app-skill-suggestions',
  standalone: true,
  imports: [CommonModule, DatePipe, TitleCasePipe],
  templateUrl: './skill-suggestions.html',
  styleUrl: './skill-suggestions.css'
})
export class SkillSuggestions implements OnInit {

  suggestions = signal<SkillSuggestion[]>([]);
  loading = signal(false);
  processingId = signal<number | null>(null);

  errorMessage = signal('');
  successMessage = signal('');
  selectedStatus = signal('pending');

  pendingCount = computed(() =>
    this.suggestions().filter(item => item.status === 'pending').length
  );

  approvedCount = computed(() =>
    this.suggestions().filter(item => item.status === 'approved').length
  );

  rejectedCount = computed(() =>
    this.suggestions().filter(item => item.status === 'rejected').length
  );

  filteredSuggestions = computed(() => {
    const status = this.selectedStatus();

    if (status === 'all') {
      return this.suggestions();
    }

    return this.suggestions().filter(item => item.status === status);
  });

  constructor(
    private adminSkillSuggestionsService: AdminSkillSuggestionsService
  ) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.adminSkillSuggestionsService.getAllSuggestions().subscribe({
      next: (response: any) => {
        this.suggestions.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to load student skill suggestions.'
        );
        this.loading.set(false);
      }
    });
  }

  reviewSuggestion(
    suggestion: SkillSuggestion,
    status: 'approved' | 'rejected'
  ): void {
    if (suggestion.status !== 'pending') {
      return;
    }

    this.processingId.set(suggestion.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminSkillSuggestionsService
      .reviewSuggestion(suggestion.id, status)
      .subscribe({
        next: (response: any) => {
          this.processingId.set(null);

          this.successMessage.set(
            response.message ||
            `Skill suggestion ${status} successfully.`
          );

          this.loadSuggestions();
        },
        error: (error) => {
          this.processingId.set(null);

          this.errorMessage.set(
            error.error?.message || 'Failed to review skill suggestion.'
          );
        }
      });
  }
}
