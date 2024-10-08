import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-task3',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './task3.component.html',
  styleUrls: ['./task3.component.css'] 
})
export class Task3Component {
  userAnswers: string[] = ['', '', ''];
  correctAnswers: string[] = ['Major Third', 'Perfect Fifth', 'Minor Sixth'];
  feedback: string[] = ['', '', ''];
  isCorrect: boolean[] = [false, false, false];
  score: number = 0;
  questions: number = 3;
  showScore: boolean = false;
  passingScore: number = 2; // Pass the quiz with 2 correct answers

  constructor(private router: Router) {} // Inject the Router service

  checkAnswers() {
    this.score = 0;
    for (let i = 0; i < this.questions; i++) {
      if (this.userAnswers[i].trim().toLowerCase() === this.correctAnswers[i].toLowerCase()) {
        this.feedback[i] = 'Correct!';
        this.isCorrect[i] = true;
        this.score++;
      } else {
        this.feedback[i] = `Incorrect, the correct answer is: ${this.correctAnswers[i]}`;
        this.isCorrect[i] = false;
      }
    }
    this.showScore = true;

    // Check if the user has passed the quiz
    if (this.score >= this.passingScore) {
      this.showCertificatePopup();
    }
  }

  certificate() {
    if (this.score >= this.passingScore) {
      // Navigate to the certificate page if the user passes
      this.router.navigate(['certificate']);
    } else {
      alert('You need to pass the quiz to proceed to the certificate.');
    }
  }

  showCertificatePopup() {
    alert('Congratulations! You passed the quiz. You can now proceed to claim your certificate.');
  }
  
}
