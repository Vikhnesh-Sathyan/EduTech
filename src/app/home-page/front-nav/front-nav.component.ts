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
  window.open('student-login');

  }

  goToTeacherLogin() {
    window.open('teacher-login');

  }

  goToParentLogin() {
    window.open('parent-login', '_blank');

  }
}



