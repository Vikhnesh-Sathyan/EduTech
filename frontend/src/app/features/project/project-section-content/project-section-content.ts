
import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { StudentProjectService } from '../../../services/student-project.service';

@Component({
  selector: 'app-project-section-content',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './project-section-content.html',
  styleUrl: './project-section-content.css'
})
export class ProjectSectionContent implements OnInit {

  // =====================================================
  // BACKEND URL
  // =====================================================

  // Backend serves uploaded images from port 5000
  backendUrl = 'http://localhost:5000';


  // =====================================================
  // SECTION
  // =====================================================

  sectionId!: number;


  // =====================================================
  // CONTENT
  // =====================================================

  // Store loaded section content
  content = signal<any | null>(null);


  // =====================================================
  // STATE
  // =====================================================

  // Track loading state
  loading = signal(false);


  constructor(
    private route: ActivatedRoute,
    private studentProjectService: StudentProjectService
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.sectionId = Number(
      this.route.snapshot.paramMap.get('sectionId')
    );

    this.loadContent();

  }


  // =====================================================
  // LOAD CONTENT
  // =====================================================

  // Load content belonging to the selected section
  loadContent(): void {

    this.loading.set(true);

    this.studentProjectService
      .getSectionContent(this.sectionId)
      .subscribe({

        next: (response: any) => {

          this.content.set(response);

          this.loading.set(false);

        },

        error: (error) => {

          this.loading.set(false);

          if (error.status === 404) {

            this.content.set(null);

            return;
          }

          console.error(
            'Failed to load project section content:',
            error
          );

        }

      });

  }

}