import {
  Component,
  inject,
  signal,
  OnInit
} from '@angular/core';

import { AdminSpeakingTopicsService } from '../../services/admin-speaking-topics.service';

import {
  AdminSpeakingTopic
} from '../../models/speaking-topic.model';

import { TopicList } from '../../components/topic-list/topic-list';

import { TopicForm } from '../../components/topic-form/topic-form';

@Component({
  selector: 'app-admin-speaking-topics',
  imports: [TopicList, TopicForm],
  templateUrl: './topics.html',
  styleUrl: './topics.css'
})
export class Topics implements OnInit {

  private readonly topicService =
    inject(AdminSpeakingTopicsService);

  readonly topics = signal<AdminSpeakingTopic[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadTopics();
  }

  // Fetch all topics
  loadTopics(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.topicService.getTopics().subscribe({

      next: (response) => {
        this.topics.set(response.topics);
        this.loading.set(false);
      },

      error: (error) => {
        this.errorMessage.set(
          error.error?.message ||
          'Unable to load speaking topics.'
        );

        this.loading.set(false);
      }

    });
  }

}