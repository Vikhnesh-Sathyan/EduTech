// flashcard-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule

@Component({
  selector: 'app-flashcard-list',
  standalone: true,  // Ensure it’s a standalone component
  imports: [CommonModule], 
  templateUrl: './flashcard-list.component.html',
  styleUrls: ['./flashcard-list.component.css']
})
export class FlashcardListComponent implements OnInit {
  flashcards: any[] = [];

  ngOnInit(): void {
    const storedFlashcards = localStorage.getItem('flashcards');
    this.flashcards = storedFlashcards ? JSON.parse(storedFlashcards) : [];
  }

  toggleAnswer(card: any): void {
    card.showAnswer = !card.showAnswer;
  }
}
