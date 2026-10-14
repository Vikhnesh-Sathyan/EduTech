import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InterviewPrepFilters } from '../../../../services/student/interview-prep.service';

import { PrepListComponent } from './components/prep-list/prep-list';
import { PrepFiltersComponent } from './components/prep-filters/prep-filters';
import { PrepFormComponent } from './components/prep-form/prep-form';
import { PrepDetailComponent } from './components/prep-detail/prep-detail';
import { MyPrepComponent } from './components/my-prep/my-prep';

type InterviewPrepView = 'browse' | 'create' | 'mine' | 'detail';

@Component({
  selector: 'app-interview-prep',
  standalone: true,
  imports: [
    CommonModule,
    PrepListComponent,
    PrepFiltersComponent,
    PrepFormComponent,
    PrepDetailComponent,
    MyPrepComponent
  ],
  templateUrl: './interview-prep.html',
  styleUrl: './interview-prep.css'
})
export class InterviewPrepComponent {
  activeView = signal<InterviewPrepView>('browse');
  selectedPostId = signal<number | null>(null);
  activeFilters = signal<InterviewPrepFilters>({});

  onFiltersChanged(filters: InterviewPrepFilters): void {
    this.activeFilters.set(filters);
  }

  showBrowse(): void {
    this.activeView.set('browse');
    this.selectedPostId.set(null);
  }

  showCreate(): void {
    this.selectedPostId.set(null);
    this.activeView.set('create');
  }

  showEdit(id: number): void {
    this.selectedPostId.set(id);
    this.activeView.set('create');
  }

  showMyPosts(): void {
    this.activeView.set('mine');
    this.selectedPostId.set(null);
  }

  showDetail(id: number): void {
    this.selectedPostId.set(id);
    this.activeView.set('detail');
  }

  onPostSaved(): void {
    this.showBrowse();
  }
}
