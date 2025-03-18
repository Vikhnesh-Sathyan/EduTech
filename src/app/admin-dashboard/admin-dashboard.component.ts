import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router) {}

  addTeacher() {
    this.router.navigate(['teacher-add']);
  }
  addstpla() {
    this.router.navigate(['addstpla']);
  }
  addadminjob() {
    this.router.navigate(['adminjob']);
  }
  ngOnInit(): void {
    // Any initialization logic goes here
  }
}
