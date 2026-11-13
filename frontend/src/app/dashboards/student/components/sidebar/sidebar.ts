
import { Component, OnInit, signal } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { StudentLearning } from '../../../../services/student/student-learning';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})

export class Sidebar implements OnInit {

  currentStudy = signal<any | null>(null);

  // Daily Quiz dropdown state
  dailyQuizMenuOpen = signal(false);

  constructor(
    public router: Router,
    private studentLearningService: StudentLearning
  ) {}

  ngOnInit(): void {

    this.loadCurrentStudyProgress();

    // Automatically expand when visiting Daily Quiz pages
    this.dailyQuizMenuOpen.set(
      this.router.url.startsWith('/daily-quiz')
    );

  }

  loadCurrentStudyProgress(): void {

    this.studentLearningService
      .getCurrentStudyProgress()
      .subscribe({
        next: (response: any) => {

          if (response.has_current_study) {
            this.currentStudy.set(
              response.current_study
            );
          } else {
            this.currentStudy.set(null);
          }

        },

        error: (error) => {

          console.error(
            'Failed to load current study progress:',
            error
          );

          this.currentStudy.set(null);
        }
      });
  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}
