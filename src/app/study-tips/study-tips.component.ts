import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { StudyTipsService } from '../study-tips.service'; // Ensure correct path
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-study-tips',
  standalone: true,
  imports: [CommonModule, HttpClientModule,FormsModule], // Include HttpClientModule here
  templateUrl: './study-tips.component.html',
  styleUrls: ['./study-tips.component.css'],
  providers:[StudyTipsService]
})
export class StudyTipsComponent implements OnInit {
  selectedClassId: number | null = null;
  selectedSubject: string = '';
  searchTopic: string = '';
  subjects: string[] = ['Math', 'Science', 'English', 'History'];
  tips: any[] = [];
  filteredTips: any[] = [];
  newSubject: string = '';
  newTopic: string = '';
  newDifficulty: string = 'Easy';
  newTip: string = '';
  motivationalMessage: string = 'Keep going! The harder you work, the greater the reward!';

  constructor(private studyTipsService: StudyTipsService) {}

  ngOnInit(): void {
    this.fetchTips();
  }

  fetchTips(): void {
    if (this.selectedClassId) {
      this.studyTipsService.getTipsByClass(this.selectedClassId).subscribe(
        (data) => {
          this.tips = data;
          this.filterTips(); // Apply filtering on fetch
        },
        (error) => console.error('Failed to fetch tips:', error)
      );
    }
  }

  filterTips(): void {
    this.filteredTips = this.tips.filter(
      (tip) =>
        (!this.selectedSubject || tip.subject === this.selectedSubject) &&
        (!this.searchTopic || tip.topic.toLowerCase().includes(this.searchTopic.toLowerCase()))
    );
  }

  addTip(): void {
    const tip = {
      classId: this.selectedClassId,
      subject: this.newSubject,
      topic: this.newTopic,
      difficulty: this.newDifficulty,
      tip: this.newTip,
    };

    this.studyTipsService.addTip(tip).subscribe(
      () => {
        this.tips.push(tip);
        this.filterTips(); // Refresh filtered tips
        this.resetForm();
      },
      (error) => console.error('Failed to add tip:', error)
    );
  }

  deleteTip(id: number): void {
    this.studyTipsService.deleteTip(id).subscribe(
      () => {
        this.tips = this.tips.filter((tip) => tip.id !== id);
        this.filterTips();
      },
      (error) => console.error('Failed to delete tip:', error)
    );
  }

  resetForm(): void {
    this.newSubject = '';
    this.newTopic = '';
    this.newDifficulty = 'Easy';
    this.newTip = '';
  }
}
