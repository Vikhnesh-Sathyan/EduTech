import {
  Component,
  inject,
  output,
  signal,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityDoubtService } from '../../../../../../services/student/community-doubt.service';

@Component({
  selector: 'app-my-doubts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-doubts.html',
  styleUrl: './my-doubts.css'
})
export class MyDoubtsComponent implements OnInit {
  private doubtService = inject(CommunityDoubtService);

  doubtSelected = output<number>();

  doubts = signal<any[]>([]);
  loading = signal(false);
  deletingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadMyDoubts();
  }

  loadMyDoubts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.doubtService.getMyDoubts().subscribe({
      next: (response: any) => {
        this.doubts.set(response.doubts || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Load my doubts error:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load your doubts. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  openDoubt(doubtId: number): void {
    this.doubtSelected.emit(doubtId);
  }

  deleteDoubt(doubtId: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this doubt? Its replies will also be deleted.'
    );

    if (!confirmed) {
      return;
    }

    this.deletingId.set(doubtId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.doubtService.deleteDoubt(doubtId).subscribe({
      next: (response: any) => {
        this.doubts.update((currentDoubts) =>
          currentDoubts.filter((doubt) => doubt.id !== doubtId)
        );

        this.successMessage.set(
          response.message || 'Doubt deleted successfully.'
        );

        this.deletingId.set(null);
      },
      error: (error) => {
        console.error('Delete doubt error:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to delete this doubt. Please try again.'
        );

        this.deletingId.set(null);
      }
    });
  }

  refreshDoubts(): void {
    this.loadMyDoubts();
  }
}
