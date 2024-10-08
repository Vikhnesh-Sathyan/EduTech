import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [],
  templateUrl: './curriculum.component.html',
  styleUrl: './curriculum.component.css'
})
export class CurriculumComponent {
  constructor(private router: Router) {}

  applynow() {
    this.router.navigate(['student-login/music']);
  }

  closePopup() {
    const popup = document.getElementById('adPopup');
    if (popup) {
      popup.style.display = 'none';
    }
  }

}
