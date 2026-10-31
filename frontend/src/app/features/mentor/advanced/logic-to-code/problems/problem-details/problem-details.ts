import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LogicToCodeService,
  LogicToCodeProblem
} from '../../../../../../services/mentor/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-problem-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './problem-details.html',
  styleUrl: './problem-details.css',
})
export class ProblemDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logicToCodeService = inject(LogicToCodeService);

  problem = signal<LogicToCodeProblem | null>(null);

  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const problemId = Number(this.route.snapshot.paramMap.get('problemId'));

    if (!problemId || isNaN(problemId)) {
      this.errorMessage.set('Invalid problem ID.');
      this.loading.set(false);
      return;
    }

    this.loadProblem(problemId);
  }

  // LOAD PROBLEM DETAILS
  loadProblem(problemId: number): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.logicToCodeService.getProblemById(problemId).subscribe({

      next: (response) => {

        this.problem.set(response.problem);
        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Unable to load problem details.'
        );

        this.loading.set(false);

      }

    });

  }

  // RETRY LOADING PROBLEM
retryLoad(): void {

  const problemId = Number(
    this.route.snapshot.paramMap.get('problemId')
  );

  if (problemId > 0) {
    this.loadProblem(problemId);
  }

}

  // BACK TO MANAGE PROBLEMS
  goBack(): void {
    this.router.navigate([
      '/mentor/advanced/logic-to-code/problems'
    ]);
  }

  getDifficultyLabel(difficulty: string): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  editProblem(problemId: number): void {
  this.router.navigate([
    '/mentor/advanced/logic-to-code/problems',
    problemId,
    'edit'
  ]);
}
}