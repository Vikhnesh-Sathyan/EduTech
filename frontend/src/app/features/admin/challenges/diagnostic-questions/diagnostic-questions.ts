
import { Component, OnInit, signal } from '@angular/core';
import { AdminDiagnostic } from '../../../../services/admin/admin-diagnostic';

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

  questions = signal<any[]>([]);
  loading = signal(true);
  errorMessage = signal('');


  // =====================================================
  // ADD / EDIT QUESTION FORM
  // =====================================================

  showForm = signal(false);
  editingQuestionId = signal<number | null>(null);


  // =====================================================
  // SUBJECT FOR ADD / EDIT
  // =====================================================

  subjects = signal<any[]>([]);
  loadingSubjects = signal(false);
  selectedSubjectId = signal<number | null>(null);


  // =====================================================
  // TOPIC FOR ADD / EDIT
  // =====================================================

  topics = signal<any[]>([]);
  selectedTopicId = signal<number | null>(null);
  loadingTopics = signal(false);


  // =====================================================
  // QUESTION FIELDS
  // =====================================================

  questionText = signal('');
  code = signal('');

  optionA = signal('');
  optionB = signal('');
  optionC = signal('');
  optionD = signal('');

  correctOption = signal('');
  difficulty = signal('');


  // =====================================================
  // BULK IMPORT FORM
  // Separate from the Add / Edit form
  // =====================================================

  showImportForm = signal(false);

  importSubjects = signal<any[]>([]);
  loadingImportSubjects = signal(false);
  importSubjectId = signal<number | null>(null);

  importTopics = signal<any[]>([]);
  loadingImportTopics = signal(false);
  importTopicId = signal<number | null>(null);

  importFile = signal<File | null>(null);
  importing = signal(false);

  importMessage = signal('');
  importErrors = signal<any[]>([]);


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
    this.errorMessage.set('');

    this.adminDiagnosticService
      .getQuestions()
      .subscribe({

        next: (response: any) => {

          this.questions.set(response.questions || []);
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

    this.showImportForm.set(false);

    this.editingQuestionId.set(null);

    this.resetFormFields();

    this.showForm.set(true);

    this.errorMessage.set('');

    this.loadSubjects();

  }


  // =====================================================
  // OPEN EDIT QUESTION FORM
  // =====================================================

  openEditQuestion(question: any): void {

    this.showImportForm.set(false);

    this.editingQuestionId.set(question.id);

    this.showForm.set(true);

    this.errorMessage.set('');

    this.questionText.set(question.question || '');
    this.code.set(question.code || '');

    this.optionA.set(question.option_a || '');
    this.optionB.set(question.option_b || '');
    this.optionC.set(question.option_c || '');
    this.optionD.set(question.option_d || '');

    this.correctOption.set(question.correct_option || '');
    this.difficulty.set(question.difficulty || '');

    this.selectedSubjectId.set(
      question.subject_id || null
    );

    this.selectedTopicId.set(null);
    this.topics.set([]);

    this.loadSubjects();

    if (question.subject_id) {

      this.loadTopics(
        String(question.subject_id),
        question.topic_id
      );

    }

  }


  // =====================================================
  // LOAD SUBJECTS FOR ADD / EDIT
  // =====================================================

  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.adminDiagnosticService
      .getSubjects()
      .subscribe({

        next: (response: any) => {

          this.subjects.set(response.subjects || []);
          this.loadingSubjects.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load subjects:',
            error
          );

          this.subjects.set([]);
          this.loadingSubjects.set(false);

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load subjects'
          );

        }

      });

  }


  // =====================================================
  // LOAD TOPICS FOR ADD / EDIT
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
    this.selectedTopicId.set(null);
    this.topics.set([]);

    this.loadingTopics.set(true);

    this.adminDiagnosticService
      .getTopics(id)
      .subscribe({

        next: (response: any) => {

          this.topics.set(response.topics || []);
          this.loadingTopics.set(false);

          if (editTopicId) {

            const topicExists =
              (response.topics || []).some(
                (topic: any) =>
                  Number(topic.id) === Number(editTopicId)
              );

            if (topicExists) {
              this.selectedTopicId.set(Number(editTopicId));
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

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load topics'
          );

        }

      });

  }


  // =====================================================
  // CANCEL ADD / EDIT FORM
  // =====================================================

  cancelForm(): void {

    this.showForm.set(false);

    this.resetFormFields();

    this.errorMessage.set('');

  }


  // =====================================================
  // RESET ADD / EDIT FIELDS
  // =====================================================

  resetFormFields(): void {

    this.editingQuestionId.set(null);

    this.selectedSubjectId.set(null);
    this.selectedTopicId.set(null);

    this.topics.set([]);

    this.questionText.set('');
    this.code.set('');

    this.optionA.set('');
    this.optionB.set('');
    this.optionC.set('');
    this.optionD.set('');

    this.correctOption.set('');
    this.difficulty.set('');

  }


  // =====================================================
  // SAVE QUESTION
  // =====================================================

  saveQuestion(): void {

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


    const data = {

      subjectId: this.selectedSubjectId(),
      topicId: this.selectedTopicId(),

      question: this.questionText().trim(),

      code: this.code().trim() || null,

      optionA: this.optionA().trim(),
      optionB: this.optionB().trim(),
      optionC: this.optionC().trim(),
      optionD: this.optionD().trim(),

      correctOption: this.correctOption(),
      difficulty: this.difficulty()

    };


    // ---------------------------------------------------
    // UPDATE EXISTING QUESTION
    // ---------------------------------------------------

    if (this.editingQuestionId()) {

      const questionId = this.editingQuestionId()!;

      this.adminDiagnosticService
        .updateQuestion(questionId, data)
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


    // ---------------------------------------------------
    // CREATE NEW QUESTION
    // ---------------------------------------------------

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


  // =====================================================
  // OPEN IMPORT FORM
  // =====================================================

  openImportQuestions(): void {

    this.showForm.set(false);

    this.resetFormFields();

    this.showImportForm.set(true);

    this.resetImportFields();

    this.loadImportSubjects();

  }


  // =====================================================
  // LOAD SUBJECTS FOR IMPORT
  // =====================================================

  loadImportSubjects(): void {

    this.loadingImportSubjects.set(true);

    this.adminDiagnosticService
      .getSubjects()
      .subscribe({

        next: (response: any) => {

          this.importSubjects.set(response.subjects || []);
          this.loadingImportSubjects.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load import subjects:',
            error
          );

          this.importSubjects.set([]);
          this.loadingImportSubjects.set(false);

          this.importMessage.set(
            error.error?.message ||
            'Failed to load subjects. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // LOAD TOPICS FOR IMPORT
  // =====================================================

  loadImportTopics(subjectId: string): void {

    this.importSubjectId.set(
      subjectId ? Number(subjectId) : null
    );

    this.importTopicId.set(null);
    this.importTopics.set([]);

    this.importFile.set(null);
    this.importErrors.set([]);
    this.importMessage.set('');

    // Clear the previous file selection in the input
    const fileInput = document.getElementById(
      'questionImportFile'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }

    if (!subjectId) {
      return;
    }

    this.loadingImportTopics.set(true);

    this.adminDiagnosticService
      .getTopics(Number(subjectId))
      .subscribe({

        next: (response: any) => {

          this.importTopics.set(response.topics || []);
          this.loadingImportTopics.set(false);

        },

        error: (error: any) => {

          console.error(
            'Failed to load import topics:',
            error
          );

          this.importTopics.set([]);
          this.loadingImportTopics.set(false);

          this.importMessage.set(
            error.error?.message ||
            'Failed to load topics. Please try again.'
          );

        }

      });

  }


  // =====================================================
  // SELECT AND VALIDATE IMPORT FILE
  // =====================================================

  onImportFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.importFile.set(null);
    this.importErrors.set([]);
    this.importMessage.set('');

    if (!file) {
      return;
    }

    const extension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();


    // Validate file extension

    if (!['.xlsx', '.csv'].includes(extension)) {

      this.importMessage.set(
        'Only Excel (.xlsx) and CSV (.csv) files are allowed.'
      );

      input.value = '';

      return;

    }


    // Validate maximum file size: 5 MB

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {

      this.importMessage.set(
        'File size must not exceed 5 MB.'
      );

      input.value = '';

      return;

    }


    // Store valid file

    this.importFile.set(file);

    this.importMessage.set(
      'File selected successfully. Check the subject and topic before importing.'
    );

  }


  // =====================================================
  // DOWNLOAD CSV TEMPLATE
  // =====================================================

  downloadQuestionTemplate(): void {

    const template = [
      'question,code,option_a,option_b,option_c,option_d,correct_option,difficulty',
      '"What is the purpose of HTML?","","Structure of a webpage","Style a webpage","Manage a database","Run a server","A","easy"'
    ].join('\r\n');


    const blob = new Blob(
      [template],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = 'diagnostic-questions-template.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  }


  // =====================================================
  // IMPORT DIAGNOSTIC QUESTIONS
  // =====================================================

  importDiagnosticQuestions(): void {

    // Validate subject

    if (!this.importSubjectId()) {

      this.importMessage.set(
        'Please select a subject.'
      );

      return;

    }


    // Validate topic

    if (!this.importTopicId()) {

      this.importMessage.set(
        'Please select a topic.'
      );

      return;

    }


    // Validate file

    if (!this.importFile()) {

      this.importMessage.set(
        'Please select an Excel or CSV file.'
      );

      return;

    }


    // Prevent multiple submissions

    if (this.importing()) {
      return;
    }


    this.importing.set(true);

    this.importMessage.set('');
    this.importErrors.set([]);


    this.adminDiagnosticService
      .importQuestions(
        this.importSubjectId()!,
        this.importTopicId()!,
        this.importFile()!
      )
      .subscribe({

        // -----------------------------------------------
        // IMPORT SUCCESS
        // -----------------------------------------------

        next: (response: any) => {

          this.importing.set(false);

          this.importMessage.set(
            `${response.message || 'Questions imported successfully.'} ` +
            `Imported count: ${response.importedCount ?? 0}.`
          );

          this.importErrors.set([]);
          this.importFile.set(null);

          // Clear the selected file from the input

          const fileInput = document.getElementById(
            'questionImportFile'
          ) as HTMLInputElement | null;

          if (fileInput) {
            fileInput.value = '';
          }

          // Refresh the question list

          this.loadQuestions();

        },


        // -----------------------------------------------
        // IMPORT FAILURE
        // -----------------------------------------------

        error: (error: any) => {

          console.error(
            'Failed to import diagnostic questions:',
            error
          );

          this.importing.set(false);

          this.importMessage.set(
            error.error?.message ||
            'Failed to import questions. Please check your file and try again.'
          );

          this.importErrors.set(
            Array.isArray(error.error?.errors)
              ? error.error.errors
              : []
          );

        }

      });

  }


  // =====================================================
  // CLOSE IMPORT FORM
  // =====================================================

  closeImportQuestions(): void {

    this.showImportForm.set(false);

    this.resetImportFields();

  }


  // =====================================================
  // RESET IMPORT FIELDS
  // =====================================================

  resetImportFields(): void {

    this.importSubjectId.set(null);
    this.importTopicId.set(null);

    this.importTopics.set([]);
    this.importSubjects.set([]);

    this.importFile.set(null);

    this.importMessage.set('');
    this.importErrors.set([]);

    this.loadingImportSubjects.set(false);
    this.loadingImportTopics.set(false);

    this.importing.set(false);

    const fileInput = document.getElementById(
      'questionImportFile'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }

  }

}