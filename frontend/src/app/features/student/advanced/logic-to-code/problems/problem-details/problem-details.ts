
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {
  LogicToCodeService,
  StudentLogicToCodeProblemDetailsResponse
} from '../../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-logic-to-code-problem-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './problem-details.html',
  styleUrl: './problem-details.css'
})
export class ProblemDetails implements OnInit {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private route = inject(ActivatedRoute);
  private logicToCodeService = inject(LogicToCodeService);
  private router = inject(Router);
  // =====================================================
  // COMPONENT STATES
  // =====================================================

  loading = signal<boolean>(true);

  errorMessage = signal<string>('');

  problemDetails = signal<
    StudentLogicToCodeProblemDetailsResponse['data'] | null
  >(null);

  // =====================================================
  // INITIALIZE COMPONENT
  // =====================================================

  ngOnInit(): void {
    this.loadProblemDetails();
  }

  // =====================================================
  // LOAD PROBLEM DETAILS
  // =====================================================

  loadProblemDetails(): void {

    const problemId = Number(
      this.route.snapshot.paramMap.get('problemId')
    );

    if (!Number.isInteger(problemId) || problemId <= 0) {

      this.errorMessage.set('Invalid problem ID.');

      this.loading.set(false);

      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService.getProblemDetails(problemId).subscribe({

      next: (response) => {

        if (response.success) {

          this.problemDetails.set(response.data);

        } else {

          this.errorMessage.set(
            response.message || 'Unable to load problem details.'
          );

        }

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to load problem details.'
        );

        this.loading.set(false);

      }

    });

  }

  // OPEN CODING WORKSPACE

startCoding(): void {
  const problemId = Number(
    this.route.snapshot.paramMap.get('problemId')
  );

  if (!Number.isInteger(problemId) || problemId <= 0) {
    return;
  }

  this.router.navigate([
    '/student/advanced/logic-to-code/problems',
    problemId,
    'workspace'
  ]);
}

}
