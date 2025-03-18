import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-placement',
  standalone: true,
  imports: [],
  templateUrl: './placement.component.html',
  styleUrl: './placement.component.css'
})
export class PlacementComponent {
    constructor(private router: Router) {}
  
  navigateTosharetemplates(): void {
    this.router.navigate(['share-templates']);
  }
  navigateToaptitude(): void {
    this.router.navigate(['company-test']);
  }
  navigateToinsights():void{
    this.router.navigate(['upload-insights']);
  }
  // navigateTointerview():void{
  //   this.router.navigate(['mockInterview']);
  // }
  navigateToproblems():void{
    this.router.navigate(['problems']);
  }
  navigateToalerts():void{
    this.router.navigate(['placementalert']);
  }
  navigateToshortlist():void{
    this.router.navigate(['shortlisted-officer']);
  }
}
