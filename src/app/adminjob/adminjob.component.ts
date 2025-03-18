import { Component, OnInit } from '@angular/core';
import { JobService } from '../job.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

interface Job {
  jobId?: number; // `jobId` is optional since it's auto-generated
  jobTitle: string;
  companyName: string;
  timeLimit: string;
  jobDescription: string;
  salaryRange: string;
  jobLocation: string;
  jobType: string;
  qualifications: string;
  experienceLevel: string;
  contactInfo: string;
}

@Component({
  selector: 'app-adminjob',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './adminjob.component.html',
  styleUrls: ['./adminjob.component.css'],
  providers: [JobService],
})
export class AdminjobComponent implements OnInit {
  jobs: Job[] = []; // List of jobs
  newJob: Job = {
    jobTitle: '',
    companyName: '',
    timeLimit: '',
    jobDescription: '',
    salaryRange: '',
    jobLocation: '',
    jobType: 'Full-Time', // Default value
    qualifications: '',
    experienceLevel: '',
    contactInfo: '',
  };

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getJobs().subscribe((data: Job[]) => {
      this.jobs = data;
    });
  }

  addJob(): void {
    this.jobService.addJob(this.newJob).subscribe(
      () => {
        alert('Job added successfully!');
        this.resetNewJob();
        this.loadJobs(); // Refresh the job list
      },
      (error) => {
        console.error('Error adding job:', error);
      }
    );
  }

  deleteJob(jobId: number): void {
    this.jobService.deleteJob(jobId).subscribe(
      () => {
        alert('Job deleted successfully!');
        this.loadJobs(); // Refresh the job list
      },
      (error) => {
        console.error('Error deleting job:', error);
      }
    );
  }

  resetNewJob(): void {
    this.newJob = {
      jobTitle: '',
      companyName: '',
      timeLimit: '',
      jobDescription: '',
      salaryRange: '',
      jobLocation: '',
      jobType: 'Full-Time',
      qualifications: '',
      experienceLevel: '',
      contactInfo: '',
    };
  }
}
