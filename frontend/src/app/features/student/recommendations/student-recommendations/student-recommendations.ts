import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Resources } from '../resources/resources';
import { CommunityDoubts } from '../community-doubts/community-doubts';
import { InterviewPrep } from '../interview-prep/interview-prep';

type RecommendationTab = 'resources' | 'doubts' | 'interviews';

@Component({
  selector: 'app-student-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    Resources,
    CommunityDoubts,
    InterviewPrep
  ],
  templateUrl: './student-recommendations.html',
  styleUrl: './student-recommendations.css'
})
export class StudentRecommendations implements OnInit {

  subjectId = signal<string | null>(null);

  activeTab = signal<RecommendationTab>('resources');

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('subjectId');

    if (!id) {
      this.router.navigate(['/study']);
      return;
    }

    this.subjectId.set(id);
  }

  selectTab(tab: RecommendationTab): void {
    this.activeTab.set(tab);
  }

  goBackToSubject(): void {
    const id = this.subjectId();

    if (!id) {
      this.router.navigate(['/study']);
      return;
    }

    this.router.navigate(['/study', id]);
  }

}
