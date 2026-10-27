
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CodeShuffleService } from '../../../../../services/mentor/code-shuffle/code-shuffle.service';

interface CodeShuffleTopic {
  id: number;
  name: string;
  description: string | null;
}

@Component({
  selector: 'app-code-shuffle-topics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './code-shuffle-topics.html',
  styleUrl: './code-shuffle-topics.css'
})
export class CodeShuffleTopics implements OnInit {
  private readonly codeShuffleService = inject(CodeShuffleService);

  readonly topics = signal<CodeShuffleTopic[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  topicName = '';
  topicDescription = '';

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.codeShuffleService.getMyTopics().subscribe({
      next: (response) => {
        this.topics.set(response.topics ?? []);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load Code Shuffle topics:', error);
        this.errorMessage.set('Unable to load topics. Please try again.');
        this.loading.set(false);
      }
    });
  }

  createTopic(): void {
    const name = this.topicName.trim();
    const description = this.topicDescription.trim();

    if (!name) {
      this.errorMessage.set('Please enter a topic name.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.codeShuffleService.createTopic({
      name,
      description: description || null
    }).subscribe({
      next: (response) => {
        this.successMessage.set(
          response.message || 'Topic created successfully.'
        );
        this.topicName = '';
        this.topicDescription = '';
        this.saving.set(false);
        this.loadTopics();
      },
      error: (error: unknown) => {
        console.error('Failed to create Code Shuffle topic:', error);
        this.errorMessage.set(
          'Unable to create the topic. Check the details and try again.'
        );
        this.saving.set(false);
      }
    });
  }
}
