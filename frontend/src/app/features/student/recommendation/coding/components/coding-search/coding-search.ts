
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coding-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coding-search.html',
  styleUrl: './coding-search.css'
})
export class CodingSearchComponent {
  subjects = input<any[]>([]);
  loadingSubjects = input(false);
  subjectError = input('');

  searchText = input('');
  selectedSubjectId = input('');

  searchTextChange = output<string>();
  selectedSubjectIdChange = output<string>();
  search = output<void>();

  onSearchTextChange(value: string): void {
    this.searchTextChange.emit(value);
  }

  onSubjectChange(value: string): void {
    this.selectedSubjectIdChange.emit(value);
  }

  onSearch(): void {
    this.search.emit();
  }
}
