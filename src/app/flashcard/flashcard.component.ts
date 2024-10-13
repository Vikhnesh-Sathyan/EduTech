import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Import Router
import { FlashcardService } from '../flashcard.service'; // Adjust path if necessary
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],  // Include RouterModule
  providers: [FlashcardService],
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent {
  flashcard: any = { question: '', answer: '', tags: '', deck: '' };

  constructor(private router: Router) {}  // Inject Router

  onSubmit(): void {
    let flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    flashcards.push(this.flashcard);
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    this.resetForm();
  }

  resetForm(): void {
    this.flashcard = { question: '', answer: '', tags: '', deck: '' };
  }

  goToFlashcardList(): void {
    this.router.navigate(['flashcard-list']);  // Navigate to flashcards list
  }
}
