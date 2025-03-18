import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-front-nav',
  standalone: true,
  imports: [],
  templateUrl: './front-nav.component.html',
  styleUrls: ['./front-nav.component.css'] // Corrected to 'styleUrls'
})
export class FrontNavComponent {

  clickCount = 0;
  clickTimeout: any;

  constructor(private router: Router) {}

  goToStudentLogin() {
    this.router.navigate(['student-login']);
  }

  goToTeacherLogin() {
    this.router.navigate(['teacher-login']);
  }
  goToCollege() {
    this.router.navigate(['college']);
  }

  goToParentLogin() {
    window.open('parent-login', '_blank');
  }

  onLogoClick(event: Event): void {
    event.preventDefault();
    this.clickCount++;

    if (this.clickCount === 3) {
      // Redirect to admin login page after three clicks
      this.router.navigate(['/admin']);
      this.resetClickCount();
    } else {
      // Reset click count after 2 seconds if not clicked three times
      clearTimeout(this.clickTimeout);
      this.clickTimeout = setTimeout(() => this.resetClickCount(), 2000);
    }
  }

  resetClickCount(): void {
    this.clickCount = 0;
  }
}
