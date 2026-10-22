import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { StudentLearning } from '../../../../services/student/student-learning';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartOptions, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-student-study-progress',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './student-study-progress.html',
  styleUrl: './student-study-progress.css'
})
export class StudentStudyProgress implements OnInit {

  subjects = signal<any[]>([]);
  overall = signal<any | null>(null);

  loading = signal(true);
  errorMessage = signal('');

  constructor(
    private studentLearningService: StudentLearning,
    private router: Router
  ) {}

  subjectChartData: any = {
    labels: [],
    datasets: [
      {
        label: 'Completion',
        data: [],
        backgroundColor: '#6366f1',
        borderRadius: 8,
        barThickness: 18
      }
    ]
  };

  subjectChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.parsed.x}% complete`
        }
      }
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        },
        grid: {
          color: '#f0f0f7'
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadStudyProgress();
  }

  loadStudyProgress(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.studentLearningService
      .getAllSubjectsStudyProgress()
      .subscribe({
        next: (response: any) => {
          console.log('ALL STUDY PROGRESS:', response);

          const subjectData = response.subjects || [];

          this.subjects.set(subjectData);
          this.overall.set(response.overall || null);

          // Update the chart with real API data
          this.subjectChartData = {
            labels: subjectData.map(
              (subject: any) => subject.subject_name
            ),
            datasets: [
              {
                label: 'Completion',
                data: subjectData.map(
                  (subject: any) =>
                    Number(subject.progress_percentage) || 0
                ),
                backgroundColor: '#6366f1',
                borderRadius: 8,
                barThickness: 18
              }
            ]
          };

          this.loading.set(false);
        },

        error: (error: any) => {
          console.error('Failed to load study progress:', error);

          this.errorMessage.set(
            error.error?.message ||
            'Failed to load study progress'
          );

          this.loading.set(false);
        }
      });
  }

  openSubjectProgress(subjectId: number): void {
    this.router.navigate([
      '/study-progress/subject',
      subjectId
    ]);
  }
}
