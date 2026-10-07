import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentLearning } from '../../../services/student-learning';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-student-learning-section',
  standalone: true,
  imports: [],
  templateUrl: './student-learning-section.html',
  styleUrl: './student-learning-section.css'
})
export class StudentLearningSection implements OnInit {

  // =====================================================
  // SUBJECT
  // =====================================================

  subjectName = signal('Subject');

  // Stores the current subject ID
  subjectId = signal<number | null>(null);


  // =====================================================
  // LEARNING TOPICS
  // =====================================================

  topics = signal<any[]>([]);


  // =====================================================
  // EXPANDED TOPIC
  // =====================================================

  expandedTopicId = signal<number | null>(null);


  // =====================================================
  // SELECTED SUBTOPIC
  // =====================================================

  selectedSubtopicId = signal<number | null>(null);


  // =====================================================
  // SELECTED SECTION
  // =====================================================

  selectedSectionId = signal<number | null>(null);


  // =====================================================
  // SELECTED SECTION CONTENT
  // =====================================================

  sectionContent = signal<any | null>(null);


  // =====================================================
  // SECTION PROGRESS
  // =====================================================

  sectionProgress = signal<any | null>(null);


  // =====================================================
  // SUBJECT PROGRESS
  // =====================================================

  subjectProgress = signal<any | null>(null);


  // =====================================================
  // PAGE STATE
  // =====================================================

  loading = signal(true);

  errorMessage = signal('');


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private studentLearningService: StudentLearning,
    private toastService: ToastService
  ) {}


  // =====================================================
  // PAGE LOAD
  // =====================================================

  ngOnInit(): void {

    const subjectId =
      Number(
        this.route.snapshot.paramMap.get('subjectId')
      );


    // ===================================================
    // VALIDATE SUBJECT ID
    // ===================================================

    if (!subjectId) {

      this.errorMessage.set(
        'Subject ID is missing'
      );

      this.loading.set(false);

      return;
    }


    // ===================================================
    // STORE SUBJECT ID
    // ===================================================

    this.subjectId.set(subjectId);


    // ===================================================
    // LOAD LEARNING STRUCTURE
    // ===================================================

    this.loadLearningStructure(subjectId);


    // ===================================================
    // LOAD SUBJECT PROGRESS
    // ===================================================

    this.loadSubjectProgress(subjectId);

  }


  // =====================================================
  // LOAD LEARNING STRUCTURE
  // =====================================================

  loadLearningStructure(subjectId: number): void {

    this.loading.set(true);

    this.errorMessage.set('');


    this.studentLearningService
      .getLearningStructure(subjectId)
      .subscribe({

        next: (response: any) => {

          this.subjectName.set(
            response.subject?.name || 'Subject'
          );

          this.topics.set(
            response.topics || []
          );

          this.loading.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load learning structure:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load learning structure'
          );

          this.loading.set(false);

        }

      });

  }


  // =====================================================
  // TOGGLE TOPIC
  // =====================================================

  toggleTopic(topicId: number): void {

    if (this.expandedTopicId() === topicId) {

      this.expandedTopicId.set(null);

      // Close selected subtopic
      this.selectedSubtopicId.set(null);

      // Close selected section
      this.selectedSectionId.set(null);

      return;
    }


    this.expandedTopicId.set(topicId);

    // Clear previous subtopic selection
    this.selectedSubtopicId.set(null);

    // Clear previous section selection
    this.selectedSectionId.set(null);

  }


  // =====================================================
  // SELECT SUBTOPIC
  // =====================================================

  selectSubtopic(subtopicId: number): void {

    if (this.selectedSubtopicId() === subtopicId) {

      this.selectedSubtopicId.set(null);

      this.selectedSectionId.set(null);

      return;
    }


    this.selectedSubtopicId.set(subtopicId);

    // Clear previous section selection
    this.selectedSectionId.set(null);

  }


  // =====================================================
  // SELECT SECTION
  // =====================================================

  selectSection(sectionId: number): void {

    this.selectedSectionId.set(sectionId);


    // Clear previous section progress
    this.sectionProgress.set(null);


    // Load the learning content
    this.loadSectionContent(sectionId);


    // Start or update section progress
    this.accessSectionProgress(sectionId);

  }


  // =====================================================
  // LOAD SECTION CONTENT
  // =====================================================

  loadSectionContent(sectionId: number): void {

    this.sectionContent.set(null);


    this.studentLearningService
      .getSectionLearningContent(sectionId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Section content:',
            response
          );

          this.sectionContent.set(response);

        },

        error: (error: any) => {

          console.error(
            'Failed to load section content:',
            error
          );

        }

      });

  }


  // =====================================================
  // ACCESS SECTION PROGRESS
  // =====================================================

  accessSectionProgress(sectionId: number): void {

    this.studentLearningService
      .accessSection(sectionId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Section progress:',
            response
          );

          this.sectionProgress.set(
            response.progress || null
          );

        },

        error: (error: any) => {

          console.error(
            'Failed to update section progress:',
            error
          );

        }

      });

  }


  // =====================================================
  // COMPLETE SECTION
  // =====================================================

  completeSection(): void {

    const sectionId =
      this.selectedSectionId();


    // ===================================================
    // CHECK SECTION
    // ===================================================

    if (!sectionId) {

      return;

    }


    // ===================================================
    // COMPLETE SECTION
    // ===================================================

    this.studentLearningService
      .completeSection(sectionId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Section completed:',
            response
          );


          // =============================================
          // UPDATE CURRENT SECTION PROGRESS
          // =============================================

          this.sectionProgress.update(
            (progress) => ({
              ...(progress || {}),
              status: 'completed',
              completed_at: new Date()
            })
          );


          // =============================================
          // RELOAD SUBJECT PROGRESS
          // =============================================

          const currentSubjectId =
            this.subjectId();


          if (currentSubjectId) {

            this.loadSubjectProgress(
              currentSubjectId
            );

          }


          // =============================================
          // SUCCESS TOAST
          // =============================================

          this.toastService.success(
            'Section completed successfully.'
          );

        },


        error: (error: any) => {

          console.error(
            'Failed to complete section:',
            error
          );


          this.toastService.error(
            error.error?.message ||
            'Failed to complete section.'
          );

        }

      });

  }


  // =====================================================
  // LOAD SUBJECT STUDY PROGRESS
  // =====================================================

  loadSubjectProgress(subjectId: number): void {

    this.studentLearningService
      .getSubjectStudyProgress(subjectId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Subject study progress:',
            response
          );

          this.subjectProgress.set(
            response
          );

        },

        error: (error: any) => {

          console.error(
            'Failed to load subject study progress:',
            error
          );

        }

      });

  }

}
