import { Component } from '@angular/core';
import { PlacementService } from '../placement.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css',
  providers:[PlacementService]
})
export class AlertsComponent {
  alerts: any[] = [];

  constructor(private placementService: PlacementService) {}

  ngOnInit(): void {
    this.fetchAlerts();
  }

  fetchAlerts(): void {
    this.placementService.fetchAlerts().subscribe(
      (alerts) => {
        this.alerts = alerts;
      },
      (error) => {
        console.error('Failed to fetch alerts:', error);
      }
    );
  }
}
