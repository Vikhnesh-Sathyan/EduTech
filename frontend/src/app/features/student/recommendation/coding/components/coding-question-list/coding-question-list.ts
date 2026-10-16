
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coding-question-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coding-question-list.html',
  styleUrl: './coding-question-list.css'
})
export class CodingQuestionListComponent {
  codePosts = input<any[]>([]);
  loadingPosts = input(false);
  postsError = input('');

  retry = output<void>();
  selectQuestion = output<any>();
}
