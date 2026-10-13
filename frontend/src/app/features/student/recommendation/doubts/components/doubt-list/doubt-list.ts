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
  selector: 'app-doubt-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doubt-list.html',
  styleUrl: './doubt-list.css'
})
export class DoubtListComponent implements OnInit {
  private doubtService = inject(CommunityDoubtService);

  doubtSelected = output<number>();

  doubts = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadDoubts();
  }

  loadDoubts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.doubtService.getAllDoubts().subscribe({
      next: (response: any) => {
        this.doubts.set(response.doubts || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Load doubts error:', error);

        this.errorMessage.set(
          error.error?.message ||
          'Unable to load community doubts. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  openDoubt(doubtId: number): void {
    this.doubtSelected.emit(doubtId);
  }

  refreshDoubts(): void {
    this.loadDoubts();
  }
}
