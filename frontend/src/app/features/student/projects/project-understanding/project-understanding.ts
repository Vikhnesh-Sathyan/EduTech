import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { StudentProjectService } from '../../../../services/student/student-project.service';

@Component({
  selector: 'app-student-project-understanding',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './project-understanding.html',
  styleUrl: './project-understanding.css'
})
export class ProjectUnderstanding implements OnInit {

  // Store categories received from backend
  categories = signal<any[]>([]);


  constructor(
    private studentProjectService: StudentProjectService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadCategories();

  }


  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  // Load active Project Understanding categories
  loadCategories(): void {

    this.studentProjectService
      .getCategories()
      .subscribe({

        next: (response: any) => {

          const categories =
            Array.isArray(response)
              ? response
              : response.categories || [];

          this.categories.set(categories);

        },

        error: (error) => {

          console.error(
            'Failed to load project categories:',
            error
          );

        }

      });

  }

}