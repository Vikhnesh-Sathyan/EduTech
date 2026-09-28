import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Study as StudyService } from '../../services/study';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './study.html',
  styleUrl: './study.css'
})
export class Study implements OnInit {

  subjects = signal<any[]>([]);

  loading = signal(true);

  errorMessage = signal('');

  constructor(
    private studyService: StudyService
  ) {}

  ngOnInit(): void {

    this.loadSubjects();

  }

  // Load subjects for the logged-in student's education year
  loadSubjects(): void {

    this.studyService
      .getSubjects()
      .subscribe({

        next: (response: any) => {

          this.subjects.set(
            response.subjects || []
          );

          this.loading.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load study subjects:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load subjects'
          );

          this.loading.set(false);

        }

      });

  }

}