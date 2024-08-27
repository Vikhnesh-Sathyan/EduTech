import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-front-nav',
  standalone: true,
  imports: [],
  templateUrl: './front-nav.component.html',
  styleUrl: './front-nav.component.css'
})
export class FrontNavComponent {

  constructor(private router: Router) { }

  goToStudentLogin() {
    this.router.navigate(['/student-login','student-login']);
  }

  goToTeacherLogin() {
    this.router.navigate(['/teacher-login']);
  }

  goToParentLogin() {
    this.router.navigate(['/parent-login']);
  }
}



