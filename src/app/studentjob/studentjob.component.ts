import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import necessary modules
import { FormsModule } from '@angular/forms';
import { JobService } from '../job.service';

@Component({
  selector: 'app-studentjob',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule], // Include required modules
  templateUrl: './studentjob.component.html',
  styleUrls: ['./studentjob.component.css'],
  providers:[JobService] // Corrected from `styleUrl` to `styleUrls`
})
export class StudentjobComponent implements OnInit {
  jobs: any[] = []; // Initialize `jobs` as an array

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadJobs(); // Call `loadJobs` on initialization
  }

  loadJobs(): void {
    this.http.get<any[]>('http://localhost:3000/api/jobs').subscribe(
      (data) => {
        this.jobs = data; // Assign fetched data to the `jobs` array
      },
      (error) => {
        console.error('Error fetching jobs:', error);
      }
    );
  }
}
