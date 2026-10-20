
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MentorCheatsheetSelectionService {

  selectedTechnologyId = signal<number | null>(null);

  selectTechnology(technologyId: number): void {
    this.selectedTechnologyId.set(technologyId);
  }

  clearSelection(): void {
    this.selectedTechnologyId.set(null);
  }
}
