import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChallengeStats } from '../components/challenge-stats/challenge-stats';
import { ChallengeHero } from '../components/challenge-hero/challenge-hero';
import { ChallengeCategories } from '../components/challenge-categories/challenge-categories';
import { ChallengeDiscovery } from '../components/challenge-discovery/challenge-discovery';
import { RecentActivity } from '../components/recent-activity/recent-activity';

@Component({
  selector: 'app-student-challenge-dashboard',
  standalone: true,
 imports: [
  CommonModule,
  ChallengeStats,
  ChallengeHero,
  ChallengeCategories,
  ChallengeDiscovery,
  RecentActivity
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class StudentChallengeDashboard {

}