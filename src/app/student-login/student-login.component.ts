import { Component } from '@angular/core';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [],
  templateUrl: './student-login.html',
  styleUrl: './student-login.component.css'
})
export class StudentLoginComponent {
  togglePanel(panel: string): void {
    const mainContainer = document.getElementById('main');
    if (panel === 'signUp') {
      mainContainer?.classList.add('right-panel-active');
    } else if (panel === 'signIn') {
      mainContainer?.classList.remove('right-panel-active');
    }
  }
}
