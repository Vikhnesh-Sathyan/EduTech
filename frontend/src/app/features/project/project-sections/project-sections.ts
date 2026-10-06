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

import { StudentProjectService } from '../../../services/student-project.service';

@Component({
  selector: 'app-student-project-sections',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './project-sections.html',
  styleUrl: './project-sections.css'
})
export class ProjectSections implements OnInit {

  // =====================================================
  // ROUTE
  // =====================================================

  categoryId!: number;

  topicId!: number;


  // =====================================================
  // SECTIONS
  // =====================================================

  // Store sections received from backend
  sections = signal<any[]>([]);


  constructor(
    private route: ActivatedRoute,
    private studentProjectService: StudentProjectService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.categoryId = Number(
      this.route.snapshot.paramMap.get('categoryId')
    );

    this.topicId = Number(
      this.route.snapshot.paramMap.get('topicId')
    );

    this.loadSections();

  }


  // =====================================================
  // LOAD SECTIONS
  // =====================================================

  // Load active sections for the selected topic
  loadSections(): void {

    this.studentProjectService
      .getSections(this.topicId)
      .subscribe({

        next: (response: any) => {

          const sections =
            Array.isArray(response)
              ? response
              : response.sections || [];

          this.sections.set(sections);

        },

        error: (error) => {

          console.error(
            'Failed to load project sections:',
            error
          );

        }

      });

  }

}