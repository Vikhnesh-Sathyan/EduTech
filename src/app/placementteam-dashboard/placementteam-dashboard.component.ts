import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-placementteam-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './placementteam-dashboard.component.html',
  styleUrls: ['./placementteam-dashboard.component.css'] // Fixes 'styleUrl' to 'styleUrls'
})
export class PlacementteamDashboardComponent {
  constructor(private router: Router) {} // Inject Router into the constructor

  navigateToproblems():void{
    this.router.navigate(['problems']);
  }
  navigateTointerview():void{
    this.router.navigate(['mockInterview']);
  }
  navigateToquiz():void{
    this.router.navigate(['quiz']);
  }
}
