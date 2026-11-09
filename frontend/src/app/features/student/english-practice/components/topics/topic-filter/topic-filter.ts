import { Component, output } from '@angular/core';

@Component({
  selector: 'app-topic-filter',
  imports: [],
  templateUrl: './topic-filter.html',
  styleUrl: './topic-filter.css'
})
export class TopicFilter {

  readonly filtersChanged = output<{
    category: string;
    difficulty: string;
  }>();

  category = '';
  difficulty = '';

  onCategoryChange(value: string): void {
    this.category = value;
    this.emitFilters();
  }

  onDifficultyChange(value: string): void {
    this.difficulty = value;
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChanged.emit({
      category: this.category,
      difficulty: this.difficulty
    });
  }

}