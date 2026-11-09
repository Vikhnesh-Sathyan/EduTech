import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SpeakingTopicsService } from '../../services/topics/topics.service';

import { SpeakingTopic } from '../../models/topics/speaking-topic.model';

import { TopicFilter } from '../../components/topics/topic-filter/topic-filter';
import { TopicList } from '../../components/topics/topic-list/topic-list';

@Component({
  selector: 'app-topics',
  imports: [
    TopicFilter,
    TopicList
  ],
  templateUrl: './topics.html',
  styleUrl: './topics.css'
})
export class Topics {

  private readonly topicsService = inject(SpeakingTopicsService);
  private readonly router = inject(Router);

  readonly topics = signal<SpeakingTopic[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  private category = '';
  private difficulty = '';

  // RECEIVE FILTER VALUES
  onFiltersChanged(filters: {
    category: string;
    difficulty: string;
  }): void {

    this.category = filters.category;
    this.difficulty = filters.difficulty;

  }

  // GENERATE SPEAKING TOPIC
  generateTopic(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.topicsService.generateTopic(
      this.category || undefined,
      this.difficulty || undefined
    ).subscribe({

      next: (response) => {

        this.topics.update(currentTopics => [
          response.topic,
          ...currentTopics.filter(
            topic => topic.id !== response.topic.id
          )
        ]);

        this.loading.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Unable to generate a speaking topic.'
        );

        this.loading.set(false);

      }

    });

  }

  // START SPEAKING PRACTICE
  startPractice(topic: SpeakingTopic): void {

    this.router.navigate(
      ['english-practice/speaking'],
      {
        state: { topic }
      }
    );

  }

}