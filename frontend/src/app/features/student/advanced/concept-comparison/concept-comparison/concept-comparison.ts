import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface ConceptComparison {
  id: number;
  title: string;
  description: string;
  concepts: string[];
}

@Component({
  selector: 'app-concept-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './concept-comparison.html',
  styleUrl: './concept-comparison.css'
})
export class ConceptComparisonComponent implements OnInit {

  loading = signal(true);
  errorMessage = signal('');

  comparisons = signal<ConceptComparison[]>([]);

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadComparisons();
  }

  loadComparisons(): void {
    // The backend service will be connected in the next step.
    this.comparisons.set([]);
    this.errorMessage.set('');
    this.loading.set(false);
  }

  openComparison(id: number): void {
    this.router.navigate([
      '/advanced-learning/comparison',
      id
    ]);
  }
}