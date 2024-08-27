import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './teacher-login.component.html',
  styleUrl: './teacher-login.component.css'
})
export class TeacherLoginComponent {
  username: string = '';
  password: string = '';

  login() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }

}
