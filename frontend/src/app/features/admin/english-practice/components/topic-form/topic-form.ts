import {
  Component,
  inject,
  signal,
  OnInit,
  output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { AdminSubject } from '../../../../../services/admin/admin-subjects'

import { AdminSpeakingTopicsService } from '../../services/admin-speaking-topics.service';

import {
  SpeakingTopicSubject,
  SpeakingTopicSubjectsResponse
} from '../../models/speaking-topic.model';

@Component({
  selector: 'app-topic-form',
  imports: [FormsModule],
  templateUrl: './topic-form.html',
  styleUrl: './topic-form.css'
})
export class TopicForm implements OnInit {

  private readonly subjectService = inject(AdminSubject);
  private readonly topicService = inject(AdminSpeakingTopicsService);

  readonly subjects = signal<SpeakingTopicSubject[]>([]);
  readonly loadingSubjects = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly topicCreated = output<void>();

  subject_id: number | null = null;
  title = '';
  prompt = '';
  category = '';
  difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  ngOnInit(): void {
    this.loadSubjects();
  }

  // Load active subjects
  loadSubjects(): void {

    this.loadingSubjects.set(true);

    this.subjectService.getSubjects().subscribe({

      next: (response) => {

        const result = response as SpeakingTopicSubjectsResponse;

        this.subjects.set(
          result.subjects.filter(
            subject => subject.status === 'active'
          )
        );

        this.loadingSubjects.set(false);
      },

      error: () => {
        this.errorMessage.set('Failed to load subjects.');
        this.loadingSubjects.set(false);
      }

    });
  }

  // Create a speaking topic
  submitTopic(): void {

    if (!this.title.trim() || !this.prompt.trim()) {
      this.errorMessage.set('Title and prompt are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.topicService.createTopic({
      subject_id: this.subject_id,
      title: this.title.trim(),
      prompt: this.prompt.trim(),
      category: this.category.trim() || null,
      difficulty: this.difficulty
    }).subscribe({

      next: () => {

        this.successMessage.set('Speaking topic created successfully.');

        this.title = '';
        this.prompt = '';
        this.category = '';
        this.subject_id = null;
        this.difficulty = 'easy';

        this.saving.set(false);
        this.topicCreated.emit();
      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message || 'Failed to create speaking topic.'
        );

        this.saving.set(false);
      }

    });
  }

}