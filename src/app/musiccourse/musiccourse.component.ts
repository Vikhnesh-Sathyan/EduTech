import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-musiccourse',
  standalone: true,
  imports: [],
  templateUrl: './musiccourse.component.html',
  styleUrl: './musiccourse.component.css'
})
export class MusiccourseComponent {
  constructor(private router: Router) {}

  // Function to navigate to the course details page
  goToCourseDetail() {
    this.router.navigate(['coursedetail']);
  }
}
