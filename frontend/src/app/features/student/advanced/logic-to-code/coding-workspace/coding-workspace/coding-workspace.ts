
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  LogicToCodeService,
  StudentLogicToCodeProblemDetailsResponse,
  ExecuteStudentSubmissionResponse
} from '../../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-student-logic-to-code-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coding-workspace.html',
  styleUrl: './coding-workspace.css'
})
export class CodingWorkspace implements OnInit {

  private route = inject(ActivatedRoute);
  private logicToCodeService = inject(LogicToCodeService);

  // PROBLEM INFORMATION

  problemId = 0;

  problemDetails = signal<
    StudentLogicToCodeProblemDetailsResponse['data'] | null
  >(null);

  // EDITOR STATE

  selectedLanguage = signal<string>('');

  sourceCode = signal<string>('');

  // LOADING STATE

  loading = signal<boolean>(true);

  submitting = signal<boolean>(false);

  errorMessage = signal<string>('');

  // EXECUTION RESULT

  executionResult = signal<
    ExecuteStudentSubmissionResponse['data'] | null
  >(null);

  executionError = signal<string>('');

  ngOnInit(): void {
    this.loadProblem();
  }

  // LOAD PROBLEM DETAILS

  loadProblem(): void {

    this.problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    if (
      !Number.isInteger(this.problemId) ||
      this.problemId <= 0
    ) {
      this.errorMessage.set('Invalid problem ID.');
      this.loading.set(false);
      return;
    }

    this.logicToCodeService
      .getProblemDetails(this.problemId)
      .subscribe({

        next: (response) => {

        if (response.success) {

  this.problemDetails.set(response.data);

  // GET MENTOR-SELECTED SUBJECT
// Get programming language directly from backend

const language = response.data.problem.programming_language;

if (!language) {
  this.errorMessage.set('Programming language is not configured for this subject.');
  this.loading.set(false);
  return;
}

// Set the language selected by the mentor

this.selectedLanguage.set(language);

// Start with an empty editor

this.sourceCode.set('');

  // VALIDATE SUPPORTED LANGUAGE
  if (!language) {
    this.errorMessage.set(
      `Coding language is not supported for subject: ${response.data.problem.subject_name}`
    );

    this.loading.set(false);
    return;
  }

  // SET SELECTED LANGUAGE AUTOMATICALLY
  this.selectedLanguage.set(language);

// START WITH AN EMPTY CODE EDITOR
this.sourceCode.set('');
} else {

            this.errorMessage.set(
              response.message || 'Unable to load problem.'
            );

          }

          this.loading.set(false);
        },

        error: (error) => {

          this.errorMessage.set(
            error.error?.message || 'Failed to load problem.'
          );

          this.loading.set(false);
        }

      });
  }

  // CHANGE PROGRAMMING LANGUAGE

  onLanguageChange(language: string): void {

    this.selectedLanguage.set(language);

    this.executionResult.set(null);

    this.executionError.set('');
  }

  // SUBMIT AND EXECUTE CODE

  submitAndRun(): void {

    if (this.submitting()) {
      return;
    }

    if (!this.sourceCode().trim()) {

      this.executionError.set('Please write your code first.');

      return;
    }

    this.submitting.set(true);

    this.executionResult.set(null);

    this.executionError.set('');

    // STEP 1: CREATE SUBMISSION

    this.logicToCodeService.createSubmission(
      this.problemId,
      this.selectedLanguage(),
      this.sourceCode()
    ).subscribe({

      next: (createResponse) => {

        if (!createResponse.success) {

          this.executionError.set(
            createResponse.message || 'Submission failed.'
          );

          this.submitting.set(false);

          return;
        }

        const submissionId =
          createResponse.data.submissionId;

        // STEP 2: EXECUTE SUBMISSION

        this.logicToCodeService
          .executeSubmission(submissionId)
          .subscribe({

            next: (executeResponse) => {

              if (executeResponse.success) {

                this.executionResult.set(
                  executeResponse.data
                );

              } else {

                this.executionError.set(
                  executeResponse.message ||
                  'Code execution failed.'
                );

              }

              this.submitting.set(false);
            },

            error: (error) => {

              this.executionError.set(
                error.error?.message ||
                'Code execution failed.'
              );

              this.submitting.set(false);
            }

          });

      },

      error: (error) => {

        this.executionError.set(
          error.error?.message ||
          'Failed to create submission.'
        );

        this.submitting.set(false);
      }

    });
  }

}
