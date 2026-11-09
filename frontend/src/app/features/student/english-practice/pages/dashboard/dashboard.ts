import { Component } from '@angular/core';

import { WelcomeSection } from '../../components/dashboard/welcome-section/welcome-section';

import { SpeakingOverview } from '../../components/dashboard/speaking-overview/speaking-overview';

import { RecentAttempts } from '../../components/dashboard/recent-attempts/recent-attempts';

@Component({
  selector: 'app-dashboard',
  imports: [
  WelcomeSection,
  SpeakingOverview,
  RecentAttempts
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

}
