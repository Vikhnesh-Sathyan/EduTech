import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AskDoubtComponent } from './components/ask-doubt/ask-doubt';
import { DoubtListComponent } from './components/doubt-list/doubt-list';
import { DoubtDetailComponent } from './components/doubt-detail/doubt-detail';
import { MyDoubtsComponent } from './components/my-doubts/my-doubts';

type DoubtView = 'browse' | 'ask' | 'mine' | 'detail';

@Component({
  selector: 'app-doubts',
  standalone: true,
  imports: [
    CommonModule,
    AskDoubtComponent,
    DoubtListComponent,
    DoubtDetailComponent,
    MyDoubtsComponent
  ],
  templateUrl: './doubts.html',
  styleUrl: './doubts.css'
})
export class DoubtsComponent {
  activeView = signal<DoubtView>('browse');
  selectedDoubtId = signal<number | null>(null);

  showBrowse(): void {
    this.activeView.set('browse');
    this.selectedDoubtId.set(null);
  }

  showAsk(): void {
    this.activeView.set('ask');
    this.selectedDoubtId.set(null);
  }

  showMyDoubts(): void {
    this.activeView.set('mine');
    this.selectedDoubtId.set(null);
  }

  openDoubt(doubtId: number): void {
    this.selectedDoubtId.set(doubtId);
    this.activeView.set('detail');
  }

  onDoubtSubmitted(): void {
    this.showBrowse();
  }
}
