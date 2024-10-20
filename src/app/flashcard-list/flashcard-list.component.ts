import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-flashcard-list',
  standalone: true, // Ensure it’s a standalone component
  imports: [CommonModule, FormsModule], 
  templateUrl: './flashcard-list.component.html',
  styleUrls: ['./flashcard-list.component.css']
})
export class FlashcardListComponent implements OnInit {
  flashcards: any[] = [];
  filteredFlashcards: any[] = [];

  ngOnInit(): void {
    const storedFlashcards = localStorage.getItem('flashcards');
    this.flashcards = storedFlashcards ? JSON.parse(storedFlashcards) : [];
    this.filteredFlashcards = [...this.flashcards]; // Initialize with all flashcards
  }

  toggleAnswer(card: any): void {
    card.showAnswer = !card.showAnswer;
  }

  // Enable edit mode
  enableEdit(card: any): void {
    card.isEditing = true;
  }

  // Save the edited flashcard
  saveEdit(card: any): void {
    card.isEditing = false;
    this.updateLocalStorage();
  }

  // Cancel edit mode without saving
  cancelEdit(card: any): void {
    card.isEditing = false;
  }

  // Search function to filter flashcards based on user input
  searchCards(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredFlashcards = this.flashcards.filter(card =>
      card.question.toLowerCase().includes(query) ||
      card.tags.toLowerCase().includes(query) ||
      card.deck.toLowerCase().includes(query)
    );
  }

  // Delete a flashcard
  deleteFlashcard(card: any): void {
    this.flashcards = this.flashcards.filter(c => c !== card);
    this.filteredFlashcards = this.filteredFlashcards.filter(c => c !== card);
    this.updateLocalStorage();
  }

  // Update the local storage when edits are saved
  updateLocalStorage(): void {
    localStorage.setItem('flashcards', JSON.stringify(this.flashcards));
  }
}
