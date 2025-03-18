import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-short-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './short-list.component.html',
  styleUrls: ['./short-list.component.css']
})
export class ShortListComponent implements OnInit {
  shortlistedDetails: any[] = []; // Array to store shortlisted details

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Fetch shortlisted details from the backend
    this.http.get('http://localhost:3000/api/shortlisted-students').subscribe(
      (data: any) => {
        this.shortlistedDetails = data; // Assign data to the shortlistedDetails array
      },
      (error) => {
        console.error('Error fetching shortlisted details:', error);
        alert('Failed to fetch shortlisted details. Please try again later.');
      }
    );
  }
}
