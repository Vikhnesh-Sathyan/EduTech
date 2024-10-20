import { Component, OnInit } from '@angular/core';
import { StudyTipsService } from '../study-tips.service';
import { CommonModule } from '@angular/common';  // Required for *ngIf and *ngFor
import { FormsModule } from '@angular/forms';  // Required for [(ngModel)]
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tips',
  standalone: true,
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.css'],  // Fixed typo (styleUrl -> styleUrls)
  imports: [CommonModule, FormsModule,HttpClientModule],  // Import CommonModule and FormsModule
  providers:[StudyTipsService]
})
export class TipsComponent implements OnInit {
  selectedClassId: number = 9;  // Default class (can be changed dynamically)
  tips: any[] = [];  // Store fetched tips

  constructor(private tipsService: StudyTipsService) {}

  ngOnInit() {
    this.fetchTips();  // Fetch tips when component initializes
  }

  fetchTips() {
    this.tipsService.getTipsByClass(this.selectedClassId).subscribe(
      (data) => {
        this.tips = data;  // Store the fetched tips in the array
      },
      (error) => {
        console.error('Failed to fetch tips:', error);  // Handle errors
      }
    );
  }
}
