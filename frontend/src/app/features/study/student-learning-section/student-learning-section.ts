import {
  Component,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Subscription } from 'rxjs';

import { StudentLearning } from '../../../services/student-learning';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-student-learning-section',
  standalone: true,
  imports: [],
  templateUrl: './student-learning-section.html',
  styleUrl: './student-learning-section.css'
})
export class StudentLearningSection
  implements OnInit, OnDestroy {


  // =====================================================
  // SUBJECT
  // =====================================================

  subjectName = signal('Subject');

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
  // PAGE STATE
  // =====================================================

  loading = signal(true);

  errorMessage = signal('');


  private queryParamsSubscription?: Subscription;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentLearningService: StudentLearning,
    private toastService: ToastService
  ) {}


  // =====================================================
  // BACK TO SUBJECT
  // =====================================================

  goBackToSubject(): void {

    const subjectId = this.subjectId();

    if (!subjectId) {
      return;
    }

    this.router.navigate([
      '/study',
    ]);

  }


  // =====================================================
  // PAGE LOAD
  // =====================================================

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


    this.subjectId.set(subjectId);


    // Load learning structure
    this.loadLearningStructure(subjectId);


    // Listen for sectionId from URL
    this.queryParamsSubscription =
      this.route.queryParams.subscribe(params => {

        const sectionId =
          Number(params['sectionId']);


        if (!sectionId) {
          return;
        }


        /*
         * If learning structure is already loaded,
         * open the requested section immediately.
         */

        if (this.topics().length > 0) {

          this.openSectionFromQuery(
            sectionId
          );

        }

      });

  }


  // =====================================================
  // LOAD LEARNING STRUCTURE
  // =====================================================

  loadLearningStructure(
    subjectId: number
  ): void {

    this.loading.set(true);

    this.errorMessage.set('');


    this.studentLearningService
      .getLearningStructure(subjectId)
      .subscribe({

        next: (response: any) => {

          this.subjectName.set(
            response.subject?.name ||
            'Subject'
          );


          this.topics.set(
            response.topics || []
          );


          /*
           * Check whether a sectionId was
           * provided in the URL.
           */

          const sectionId =
            Number(
              this.route.snapshot.queryParamMap.get(
                'sectionId'
              )
            );


          /*
           * Learning structure is now available,
           * so we can safely find the section.
           */

          if (sectionId) {

            this.openSectionFromQuery(
              sectionId
            );

          }


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
  // OPEN SECTION FROM URL
  // =====================================================

  openSectionFromQuery(
    sectionId: number
  ): void {

    for (const topic of this.topics()) {

      for (
        const subtopic of
        topic.subtopics || []
      ) {


        const sectionExists =
          (subtopic.sections || []).some(
            (section: any) =>
              Number(section.id) === sectionId
          );


        if (sectionExists) {


          // Open topic
          this.expandedTopicId.set(
            topic.id
          );


          // Open subtopic
          this.selectedSubtopicId.set(
            subtopic.id
          );


          // Select section
          this.selectedSectionId.set(
            sectionId
          );


          // Clear previous progress
          this.sectionProgress.set(null);


          // Load content
          this.loadSectionContent(
            sectionId
          );


          // Register access
          this.accessSectionProgress(
            sectionId
          );


          return;
        }

      }

    }


    console.warn(
      'Section not found in learning structure:',
      sectionId
    );

  }


  // =====================================================
  // TOGGLE TOPIC
  // =====================================================

  toggleTopic(
    topicId: number
  ): void {

    if (
      this.expandedTopicId() === topicId
    ) {

      this.expandedTopicId.set(null);

      this.selectedSubtopicId.set(null);

      this.selectedSectionId.set(null);

      return;
    }


    this.expandedTopicId.set(
      topicId
    );

    this.selectedSubtopicId.set(null);

    this.selectedSectionId.set(null);

  }


  // =====================================================
  // SELECT SUBTOPIC
  // =====================================================

  selectSubtopic(
    subtopicId: number
  ): void {

    if (
      this.selectedSubtopicId() === subtopicId
    ) {

      this.selectedSubtopicId.set(null);

      this.selectedSectionId.set(null);

      return;
    }


    this.selectedSubtopicId.set(
      subtopicId
    );

    this.selectedSectionId.set(null);

  }


  // =====================================================
  // SELECT SECTION
  // =====================================================

  selectSection(
    sectionId: number
  ): void {

    this.sectionProgress.set(null);

    this.openSectionFromQuery(
      sectionId
    );

  }


  // =====================================================
  // LOAD SECTION CONTENT
  // =====================================================

  loadSectionContent(
    sectionId: number
  ): void {

    this.sectionContent.set(null);


    this.studentLearningService
      .getSectionLearningContent(sectionId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Section content:',
            response
          );


          this.sectionContent.set(
            response
          );

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

  accessSectionProgress(
    sectionId: number
  ): void {

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


    if (!sectionId) {
      return;
    }


    this.studentLearningService
      .completeSection(sectionId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Section completed:',
            response
          );


          this.sectionProgress.update(
            (progress) => ({

              ...(progress || {}),

              status: 'completed',

              completed_at: new Date()

            })
          );


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
  // CLEANUP
  // =====================================================

  ngOnDestroy(): void {

    this.queryParamsSubscription?.unsubscribe();

  }

}