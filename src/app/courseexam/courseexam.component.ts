import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courseexam',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './courseexam.component.html',
  styleUrls: ['./courseexam.component.css'],
})
export class CourseexamComponent {
  examQuestions = [
    { questionText: 'What is a scale in music?', options: ['A type of notation', 'A sequence of notes', 'A time signature', 'A chord'] },
    { questionText: 'What is a chord?', options: ['A single note', 'A combination of notes', 'A time signature', 'A rest'] },
    { questionText: 'What does the treble clef indicate?', options: ['High pitches', 'Low pitches', 'Rhythm', 'Tempo'] },
    { questionText: 'What is a time signature?', options: ['A sequence of notes', 'A musical genre', 'The number of beats in a measure', 'A tempo marking'] },
    { questionText: 'What is an interval?', options: ['A note', 'A distance between two pitches', 'A scale', 'A chord'] },
  ];

  userAnswers: string[] = [];
  passingScore = 70; // Example passing score of 70%

  constructor(private router: Router) {}

  submitExam() {
    const score = this.calculateScore();
    if (score >= this.passingScore) {
      // Redirect to Task 2 if passed
      this.router.navigate(['task2']); // Change this path as necessary
    } else {
      alert('You did not pass. Please retake the exam.');
    }
  }

  calculateScore(): number {
    let correctAnswers = 0;
    const correctOptions = [
      'A sequence of notes', // Correct answer for question 1
      'A combination of notes', // Correct answer for question 2
      'High pitches', // Correct answer for question 3
      'The number of beats in a measure', // Correct answer for question 4
      'A distance between two pitches' // Correct answer for question 5
    ];

    this.userAnswers.forEach((answer, index) => {
      if (answer === correctOptions[index]) {
        correctAnswers++;
      }
    });

    return (correctAnswers / this.examQuestions.length) * 100;
  }
}
