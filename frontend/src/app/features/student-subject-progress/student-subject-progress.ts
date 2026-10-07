import { Component, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { StudentLearning } from '../../services/student-learning';

@Component({
  selector: 'app-student-subject-progress',
  standalone: true,
  imports: [],
  templateUrl: './student-subject-progress.html',
  styleUrl: './student-subject-progress.css'
})
export class StudentSubjectProgress implements OnInit {

  subject = signal<any | null>(null);

  topics = signal<any[]>([]);

  progressData = signal<any | null>(null);

  loading = signal(true);

  errorMessage = signal('');


  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private studentLearningService: StudentLearning
) {}

openSection(sectionId: number): void {

  const subjectId =
    this.subject()?.id;

  if (!subjectId) {
    return;
  }

  this.router.navigate(
    ['/study', subjectId, 'learning'],
    {
      queryParams: {
        sectionId
      }
    }
  );
}

  ngOnInit(): void {

    const subjectId =
      Number(
        this.route.snapshot.paramMap.get('subjectId')
      );

    if (!subjectId) {

      this.errorMessage.set(
        'Subject ID is missing'
      );

      this.loading.set(false);

      return;
    }

    this.loadSubjectProgress(subjectId);
  }


  loadSubjectProgress(subjectId: number): void {

    this.loading.set(true);

    this.errorMessage.set('');

    this.studentLearningService
      .getSubjectStudyProgress(subjectId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'SUBJECT STUDY PROGRESS:',
            JSON.stringify(response, null, 2)
          );

          this.progressData.set(response);

          this.subject.set(
            response.subject || null
          );

          this.topics.set(
            response.topics || []
          );

          this.loading.set(false);
        },


        error: (error: any) => {

          console.error(
            'Failed to load subject progress:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load subject progress'
          );

          this.loading.set(false);
        }

      });
  }


  get subjectProgressPercentage(): number {

    return this.progressData()
      ?.progress_percentage ?? 0;
  }


  get subjectCompletedSections(): number {

    return this.progressData()
      ?.completed_sections ?? 0;
  }


  get subjectTotalSections(): number {

    return this.progressData()
      ?.total_sections ?? 0;
  }

}