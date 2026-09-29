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
  // ADD / EDIT QUESTION FORM
  // =====================================================

  // Show or hide question form
  showForm = signal(false);

  // Stores question ID when editing
  // null means we are creating a new question
  editingQuestionId = signal<number | null>(null);


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

  // Optional code for coding questions
  code = signal('');


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

    this.loading.set(true);

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

    // Make sure edit mode is disabled
    this.editingQuestionId.set(null);

    // Reset old form values
    this.resetFormFields();

    // Show form
    this.showForm.set(true);

    this.errorMessage.set('');

    // Load subjects
    this.loadSubjects();

  }


  // =====================================================
  // OPEN EDIT QUESTION FORM
  // =====================================================

  openEditQuestion(question: any): void {

    // Store question ID
    this.editingQuestionId.set(
      question.id
    );

    // Show form
    this.showForm.set(true);

    // Clear old error
    this.errorMessage.set('');

    // Fill question fields
    this.questionText.set(
      question.question || ''
    );

    this.code.set(
      question.code || ''
    );

    this.optionA.set(
      question.option_a || ''
    );

    this.optionB.set(
      question.option_b || ''
    );

    this.optionC.set(
      question.option_c || ''
    );

    this.optionD.set(
      question.option_d || ''
    );

    this.correctOption.set(
      question.correct_option || ''
    );

    this.difficulty.set(
      question.difficulty || ''
    );

    // Set selected subject
    this.selectedSubjectId.set(
      question.subject_id || null
    );

    // Reset topic before loading topics
    this.selectedTopicId.set(null);

    this.topics.set([]);

    // Load subjects for the edit form
    this.loadSubjects();

    // Load topics for the selected subject
    if (question.subject_id) {

      this.loadTopics(
        String(question.subject_id),
        question.topic_id
      );

    }

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

          this.subjects.set([]);

          this.loadingSubjects.set(false);

        }

      });

  }


  // =====================================================
  // LOAD TOPICS
  // =====================================================

  loadTopics(
    subjectId: string,
    editTopicId?: number
  ): void {

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

    this.topics.set([]);

    this.loadingTopics.set(true);

    this.adminDiagnosticService
      .getTopics(id)
      .subscribe({

        next: (response: any) => {

          this.topics.set(
            response.topics || []
          );

          this.loadingTopics.set(false);


          // When editing, automatically select
          // the question's existing topic
          if (editTopicId) {

            const topicExists =
              (response.topics || [])
                .some(
                  (topic: any) =>
                    topic.id === editTopicId
                );

            if (topicExists) {

              this.selectedTopicId.set(
                editTopicId
              );

            }

          }

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

    this.resetFormFields();

    this.errorMessage.set('');

  }


  // =====================================================
  // RESET FORM FIELDS
  // =====================================================

  resetFormFields(): void {

    // Exit edit mode
    this.editingQuestionId.set(null);

    // Reset subject
    this.selectedSubjectId.set(null);

    // Reset topic
    this.selectedTopicId.set(null);

    // Clear topics
    this.topics.set([]);

    // Reset question
    this.questionText.set('');

    // Reset optional code
    this.code.set('');

    // Reset options
    this.optionA.set('');
    this.optionB.set('');
    this.optionC.set('');
    this.optionD.set('');

    // Reset answer + difficulty
    this.correctOption.set('');
    this.difficulty.set('');
  }


  // =====================================================
  // SAVE QUESTION
  // =====================================================

  saveQuestion(): void {

    // Basic frontend validation
    // Code is optional because normal questions
    // do not need a code block.
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

      this.errorMessage.set(
        'Please fill all question fields'
      );

      return;

    }


    // Data sent to backend
    const data = {

      subjectId:
        this.selectedSubjectId(),

      topicId:
        this.selectedTopicId(),

      question:
        this.questionText().trim(),

      // Optional code
      // Empty code becomes NULL
      code:
        this.code().trim() || null,

      optionA:
        this.optionA().trim(),

      optionB:
        this.optionB().trim(),

      optionC:
        this.optionC().trim(),

      optionD:
        this.optionD().trim(),

      correctOption:
        this.correctOption(),

      difficulty:
        this.difficulty()

    };


    // ===================================================
    // EDIT EXISTING QUESTION
    // ===================================================

    if (this.editingQuestionId()) {

      const questionId =
        this.editingQuestionId()!;

      this.adminDiagnosticService
        .updateQuestion(
          questionId,
          data
        )
        .subscribe({

          next: (response: any) => {

            console.log(
              'Diagnostic question updated:',
              response
            );

            this.cancelForm();

            this.loadQuestions();

          },

          error: (error: any) => {

            console.error(
              'Failed to update diagnostic question:',
              error
            );

            this.errorMessage.set(
              error.error?.message ||
              'Failed to update diagnostic question'
            );

          }

        });

      return;

    }


    // ===================================================
    // CREATE NEW QUESTION
    // ===================================================

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