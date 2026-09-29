import { Component, OnInit, signal } from '@angular/core';
import { AdminDiagnostic } from '../../../services/admin-diagnostic';

@Component({
  selector: 'app-diagnostic-questions',
  standalone: true,
  imports: [],
  templateUrl: './diagnostic-questions.html',
  styleUrl: './diagnostic-questions.css'
})
export class DiagnosticQuestions implements OnInit {

  // =====================================================
  // QUESTION LIST
  // =====================================================

  // All diagnostic questions
  questions = signal<any[]>([]);

  // Page loading state
  loading = signal(true);

  // Error message
  errorMessage = signal('');


  // =====================================================
  // ADD QUESTION FORM
  // =====================================================

  // Show or hide Add Question form
  showForm = signal(false);


  // =====================================================
  // SUBJECT
  // =====================================================

  // Active subjects
  subjects = signal<any[]>([]);

  // Subject loading state
  loadingSubjects = signal(false);

  // Selected subject
  selectedSubjectId = signal<number | null>(null);


  // =====================================================
  // TOPIC
  // =====================================================

  // Topics for selected subject
  topics = signal<any[]>([]);

  // Selected topic
  selectedTopicId = signal<number | null>(null);

  // Topic loading state
  loadingTopics = signal(false);


  // =====================================================
  // QUESTION
  // =====================================================

  // Diagnostic question text
  questionText = signal('');


  // =====================================================
  // OPTIONS
  // =====================================================

  // Answer options
  optionA = signal('');
  optionB = signal('');
  optionC = signal('');
  optionD = signal('');


  // =====================================================
  // CORRECT ANSWER + DIFFICULTY
  // =====================================================

  // Correct answer
  correctOption = signal('');

  // Question difficulty
  difficulty = signal('');


  constructor(
    private adminDiagnosticService: AdminDiagnostic
  ) {}


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {
    this.loadQuestions();
  }


  // =====================================================
  // LOAD QUESTIONS
  // =====================================================

  loadQuestions(): void {

    this.adminDiagnosticService
      .getQuestions()
      .subscribe({

        next: (response: any) => {

          this.questions.set(
            response.questions || []
          );

          this.loading.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load diagnostic questions:',
            error
          );

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load diagnostic questions'
          );

          this.loading.set(false);

        }

      });

  }


  // =====================================================
  // OPEN ADD QUESTION FORM
  // =====================================================

  openAddQuestion(): void {

    this.showForm.set(true);

    this.loadSubjects();

  }


  // =====================================================
  // LOAD SUBJECTS
  // =====================================================

  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.adminDiagnosticService
      .getSubjects()
      .subscribe({

        next: (response: any) => {

          this.subjects.set(
            response.subjects || []
          );

          this.loadingSubjects.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load subjects:',
            error
          );

          this.loadingSubjects.set(false);

        }

      });

  }


  // =====================================================
  // LOAD TOPICS
  // =====================================================

  loadTopics(subjectId: string): void {

    if (!subjectId) {

      this.selectedSubjectId.set(null);
      this.selectedTopicId.set(null);
      this.topics.set([]);

      return;

    }

    const id = Number(subjectId);

    this.selectedSubjectId.set(id);

    // Reset previous topic
    this.selectedTopicId.set(null);

    this.loadingTopics.set(true);

    this.adminDiagnosticService
      .getTopics(id)
      .subscribe({

        next: (response: any) => {

          this.topics.set(
            response.topics || []
          );

          this.loadingTopics.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load topics:',
            error
          );

          this.topics.set([]);

          this.loadingTopics.set(false);

        }

      });

  }


  // =====================================================
  // CANCEL FORM
  // =====================================================

  cancelForm(): void {

    this.showForm.set(false);

    this.selectedSubjectId.set(null);
    this.selectedTopicId.set(null);

    this.topics.set([]);

    this.questionText.set('');

    this.optionA.set('');
    this.optionB.set('');
    this.optionC.set('');
    this.optionD.set('');

    this.correctOption.set('');
    this.difficulty.set('');

  }

  saveQuestion(): void {

  // Basic frontend validation
  if (
    !this.selectedSubjectId() ||
    !this.selectedTopicId() ||
    !this.questionText().trim() ||
    !this.optionA().trim() ||
    !this.optionB().trim() ||
    !this.optionC().trim() ||
    !this.optionD().trim() ||
    !this.correctOption() ||
    !this.difficulty()
  ) {
    this.errorMessage.set('Please fill all question fields');
    return;
  }

  const data = {
    subjectId: this.selectedSubjectId(),
    topicId: this.selectedTopicId(),
    question: this.questionText().trim(),
    optionA: this.optionA().trim(),
    optionB: this.optionB().trim(),
    optionC: this.optionC().trim(),
    optionD: this.optionD().trim(),
    correctOption: this.correctOption(),
    difficulty: this.difficulty()
  };

  this.adminDiagnosticService
    .createQuestion(data)
    .subscribe({
      next: (response: any) => {

        console.log(
          'Diagnostic question created:',
          response
        );

        this.cancelForm();
        this.loadQuestions();

        this.errorMessage.set('');
      },

      error: (error: any) => {

        console.error(
          'Failed to create diagnostic question:',
          error
        );

        this.errorMessage.set(
          error.error?.message ||
          'Failed to create diagnostic question'
        );
      }
    });
}

}