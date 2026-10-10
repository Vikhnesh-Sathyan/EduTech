
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

import { StudentLearning } from '../../../../../services/student/student-learning';
import { StudentBasicChallengeService } from '../../../../../services/student/student-basic-challenge.service';
import { ToastService } from '../../../../../services/toast.service';

import { LearningHome } from '../components/learning-home/learning-home';
import { LearningSidebar } from '../components/learning-sidebar/learning-sidebar';
import { SectionContent } from '../components/section-content/section-content';
import { BasicChallengePanel } from '../components/basic-challenge-panel/basic-challenge-panel';

@Component({
  selector: 'app-student-learning-section',
  standalone: true,
  imports: [
    LearningHome,
    LearningSidebar,
    SectionContent,
    BasicChallengePanel
  ],
  templateUrl: './student-learning-section.html',
  styleUrl: './student-learning-section.css'
})
export class StudentLearningSection implements OnInit, OnDestroy {

  // SUBJECT
  subjectName = signal('Subject');
  subjectId = signal<number | null>(null);

  // LEARNING STRUCTURE
  topics = signal<any[]>([]);
  expandedTopicId = signal<number | null>(null);

  // SELECTION
  selectedSubtopicId = signal<number | null>(null);
  selectedSectionId = signal<number | null>(null);

  // BASIC CHALLENGE
  challengeStatus = signal<any | null>(null);
  challengeStatusLoading = signal(false);

  // SECTION CONTENT AND PROGRESS
  sectionContent = signal<any | null>(null);
  sectionProgress = signal<any | null>(null);

  // PAGE STATE
  loading = signal(true);
  errorMessage = signal('');

  private queryParamsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentLearningService: StudentLearning,
    private challengeService: StudentBasicChallengeService,
    private toastService: ToastService
  ) {}

  // BACK TO SUBJECT
  goBackToSubject(): void {
    const subjectId = this.subjectId();

    if (!subjectId) {
      return;
    }

    this.router.navigate(['/study']);
  }

  // PAGE INITIALIZATION
  ngOnInit(): void {
    const subjectId = Number(
      this.route.snapshot.paramMap.get('subjectId')
    );

    if (!subjectId) {
      this.errorMessage.set('Subject ID is missing');
      this.loading.set(false);
      return;
    }

    this.subjectId.set(subjectId);
    this.loadLearningStructure(subjectId);

    // Listen for sectionId query parameter changes.
    this.queryParamsSubscription =
      this.route.queryParams.subscribe(params => {
        const sectionId = Number(params['sectionId']);

        if (sectionId && this.topics().length > 0) {
          this.openSectionFromQuery(sectionId);
        }
      });
  }

  // LOAD LEARNING STRUCTURE
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

          this.topics.set(response.topics || []);

          const sectionId = Number(
            this.route.snapshot.queryParamMap.get('sectionId')
          );

          if (sectionId) {
            this.openSectionFromQuery(sectionId);
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

  // OPEN SECTION FROM URL
  openSectionFromQuery(sectionId: number): void {
    for (const topic of this.topics()) {
      for (const subtopic of topic.subtopics || []) {
        const sectionExists = (subtopic.sections || []).some(
          (section: any) =>
            Number(section.id) === sectionId
        );

        if (!sectionExists) {
          continue;
        }

        this.expandedTopicId.set(topic.id);
        this.selectedSubtopicId.set(subtopic.id);

        this.loadChallengeStatus();

        this.selectedSectionId.set(sectionId);
        this.sectionProgress.set(null);

        this.loadSectionContent(sectionId);
        this.accessSectionProgress(sectionId);

        return;
      }
    }

    console.warn(
      'Section not found in learning structure:',
      sectionId
    );
  }

  // EXPAND OR COLLAPSE TOPIC
  toggleTopic(topicId: number): void {
    if (this.expandedTopicId() === topicId) {
      this.expandedTopicId.set(null);
      this.selectedSubtopicId.set(null);
      this.selectedSectionId.set(null);
      this.challengeStatus.set(null);
      this.sectionContent.set(null);
      this.sectionProgress.set(null);
      return;
    }

    this.expandedTopicId.set(topicId);
    this.selectedSubtopicId.set(null);
    this.selectedSectionId.set(null);
    this.challengeStatus.set(null);
    this.sectionContent.set(null);
    this.sectionProgress.set(null);
  }

  // SELECT SUBTOPIC
  selectSubtopic(subtopicId: number): void {
    if (this.selectedSubtopicId() === subtopicId) {
      this.selectedSubtopicId.set(null);
      this.selectedSectionId.set(null);
      this.challengeStatus.set(null);
      this.sectionContent.set(null);
      this.sectionProgress.set(null);
      return;
    }

    this.selectedSubtopicId.set(subtopicId);
    this.selectedSectionId.set(null);
    this.challengeStatus.set(null);
    this.sectionContent.set(null);
    this.sectionProgress.set(null);

    this.loadChallengeStatus();
  }

  // LOAD BASIC CHALLENGE STATUS
  loadChallengeStatus(): void {
    const subtopicId = this.selectedSubtopicId();

    if (!subtopicId) {
      this.challengeStatus.set(null);
      this.challengeStatusLoading.set(false);
      return;
    }

    this.challengeStatusLoading.set(true);

    this.challengeService
      .getChallengeStatus(subtopicId)
      .subscribe({
        next: (response: any) => {
          this.challengeStatus.set(response);
          this.challengeStatusLoading.set(false);
        },

        error: (error: any) => {
          console.error(
            'Failed to load challenge status:',
            error
          );

          this.challengeStatus.set(null);
          this.challengeStatusLoading.set(false);
        }
      });
  }

  // SELECT SECTION
  selectSection(sectionId: number): void {
    this.openSectionFromQuery(sectionId);
  }

  // LOAD SECTION CONTENT
  loadSectionContent(sectionId: number): void {
    this.sectionContent.set(null);

    this.studentLearningService
      .getSectionLearningContent(sectionId)
      .subscribe({
        next: (response: any) => {
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

  // REGISTER SECTION ACCESS
  accessSectionProgress(sectionId: number): void {
    this.studentLearningService
      .accessSection(sectionId)
      .subscribe({
        next: (response: any) => {
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

  // COMPLETE SECTION
  completeSection(): void {
    const sectionId = this.selectedSectionId();

    if (!sectionId) {
      return;
    }

    this.studentLearningService
      .completeSection(sectionId)
      .subscribe({
        next: (response: any) => {
          this.sectionProgress.update(progress => ({
            ...(progress || {}),
            status: 'completed',
            completed_at: new Date()
          }));

          this.loadChallengeStatus();

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

  // GET SELECTED SUBTOPIC
  getSelectedSubtopic(): any | null {
    const subtopicId = this.selectedSubtopicId();

    if (!subtopicId) {
      return null;
    }

    for (const topic of this.topics()) {
      const subtopic = (topic.subtopics || []).find(
        (item: any) =>
          Number(item.id) === Number(subtopicId)
      );

      if (subtopic) {
        return subtopic;
      }
    }

    return null;
  }

  // START BASIC CHALLENGE
  startBasicChallenge(): void {
    const subtopicId = this.selectedSubtopicId();

    if (!subtopicId) {
      return;
    }

    this.router.navigate([
      '/basic-challenge',
      subtopicId
    ]);
  }

  // OPEN ADVANCED LEARNING
  openAdvancedLearning(): void {
    const subtopicId = this.selectedSubtopicId();

    if (!subtopicId) {
      return;
    }

    this.router.navigate([
      '/advanced-learning',
      subtopicId
    ]);
  }

  // CLEANUP
  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }
}