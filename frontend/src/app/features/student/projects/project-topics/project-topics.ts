import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { StudentProjectService } from '../../../../services/student/student-project.service';

@Component({
  selector: 'app-student-project-topics',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './project-topics.html',
  styleUrl: './project-topics.css'
})
export class ProjectTopics implements OnInit {

  // =====================================================
  // CATEGORY
  // =====================================================

  categoryId!: number;


  // =====================================================
  // TOPICS
  // =====================================================

  // Store topics received from backend
  topics = signal<any[]>([]);


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.categoryId = Number(
      this.route.snapshot.paramMap.get('categoryId')
    );

    this.loadTopics();

  }


  constructor(
    private route: ActivatedRoute,
    private studentProjectService: StudentProjectService
  ) {}


  // =====================================================
  // LOAD TOPICS
  // =====================================================

  // Load active topics for the selected category
  loadTopics(): void {

    this.studentProjectService
      .getTopics(this.categoryId)
      .subscribe({

        next: (response: any) => {

          const topics =
            Array.isArray(response)
              ? response
              : response.topics || [];

          this.topics.set(topics);

        },

        error: (error) => {

          console.error(
            'Failed to load project topics:',
            error
          );

        }

      });

  }

}