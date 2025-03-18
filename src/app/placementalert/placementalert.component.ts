import { Component, OnInit } from '@angular/core';
import { PlacementService } from '../placement.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-placementalert',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './placementalert.component.html',
  styleUrls: ['./placementalert.component.css'],
  providers: [PlacementService],
})
export class PlacementalertComponent {
  alert = {
    title: '',
    message: '',
    sender: 'Placement Officer', // Static sender
  };

  constructor(private placementService: PlacementService) {}

  sendAlert(): void {
    if (this.alert.title && this.alert.message) {
      this.placementService.sendAlert(this.alert).subscribe(
        (response) => {
          alert('Alert sent successfully!');
          this.alert = { title: '', message: '', sender: 'Placement Officer' };
        },
        (error) => {
          alert('Failed to send alert.');
          console.error(error);
        }
      );
    } else {
      alert('Please fill in all fields.');
    }
  }
}
