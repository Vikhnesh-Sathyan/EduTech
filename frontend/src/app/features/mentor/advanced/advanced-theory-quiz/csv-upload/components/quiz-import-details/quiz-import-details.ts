
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

@Component({
  selector: 'app-quiz-import-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-import-details.html',
  styleUrl: './quiz-import-details.css'
})
export class QuizImportDetails {
  readonly quizTitle = input('');
  readonly quizDescription = input('');
  readonly difficulty = input<QuizDifficulty>('beginner');
  readonly passPercentage = input(60);

  readonly quizTitleChange = output<string>();
  readonly quizDescriptionChange = output<string>();
  readonly difficultyChange = output<QuizDifficulty>();
  readonly passPercentageChange = output<number>();
}
