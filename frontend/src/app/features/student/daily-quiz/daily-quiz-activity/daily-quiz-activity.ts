
import { Component, OnInit, signal } from '@angular/core';

import {
  StudentDailyQuizService,
  DailyQuizActivityItem,
  DailyQuizActivityStatistics
} from '../../../../services/student/daily-quiz/student-daily-quiz.service';

interface CalendarDay {
  date: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  level: number;
  isActive: boolean;
}

@Component({
  selector: 'app-daily-quiz-activity',
  standalone: true,
  imports: [],
  templateUrl: './daily-quiz-activity.html',
  styleUrl: './daily-quiz-activity.css'
})
export class DailyQuizActivity implements OnInit {

  statistics = signal<DailyQuizActivityStatistics | null>(null);

  activity = signal<DailyQuizActivityItem[]>([]);

  calendarDays = signal<CalendarDay[]>([]);

  loading = signal(false);

  errorMessage = signal('');

  constructor(
    private dailyQuizService: StudentDailyQuizService
  ) {}

  ngOnInit(): void {
    this.loadActivity();
  }

  loadActivity(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.dailyQuizService.getQuizActivity().subscribe({

      next: response => {

        this.statistics.set(response.statistics);
        this.activity.set(response.activity || []);

        this.generateCalendar();

        this.loading.set(false);

      },

      error: error => {

        this.errorMessage.set(
          error.error?.message || 'Unable to load quiz activity.'
        );

        this.loading.set(false);

      }

    });

  }

  generateCalendar(): void {

  const activityMap = new Map(
    this.activity().map(item => [item.date, item])
  );

  const today = new Date();

  // Use today's local calendar date.
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  const endDate = new Date(`${todayString}T00:00:00Z`);

  // Start approximately one year earlier.
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 364);

  // Align the calendar to Sunday.
  startDate.setUTCDate(
    startDate.getUTCDate() - startDate.getUTCDay()
  );

  const days: CalendarDay[] = [];

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {

    const date = currentDate.toISOString().split('T')[0];

    const record = activityMap.get(date);

    const score = record?.score ?? 0;

    days.push({
      date,
      score,
      correct_answers: record?.correct_answers ?? 0,
      total_questions: record?.total_questions ?? 3,
      level: !record ? 0 : score <= 1 ? 1 : score === 2 ? 2 : 3,
      isActive: !!record
    });

    currentDate.setUTCDate(
      currentDate.getUTCDate() + 1
    );

  }

  this.calendarDays.set(days);

}

}
