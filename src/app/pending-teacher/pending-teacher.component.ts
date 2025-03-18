import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pending-teacher',
  standalone: true,
  imports: [],
  templateUrl: './pending-teacher.component.html',
  styleUrl: './pending-teacher.component.css'
})
export class PendingTeacherComponent implements OnInit {
  ngOnInit(): void {
    // Optionally, check teacher status from backend
  }
}
