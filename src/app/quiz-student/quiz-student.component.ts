import { Component, OnInit } from '@angular/core';
import { QuizService } from '../quiz.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-student',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './quiz-student.component.html',
  styleUrls: ['./quiz-student.component.css'],
  providers: [QuizService]
})
export class QuizStudentComponent implements OnInit {
  questions: any[] = [];
  currentQuestionIndex: number = 0;
  timeLeft: number = 60;
  interval: any;
  selectedOption: string | null = null;
  showFeedback: boolean = false;
  isQuizFinished: boolean = false;
  correctAnswer: string = ''; 

  constructor(private quizService: QuizService) {}


  ngOnInit(): void {
    this.quizService.fetchQuestions().subscribe(
      (response) => {
        console.log('API Response:', response); // Debugging API response
  
        if (response?.questions?.length > 0) {
          this.questions = response.questions.map((q: any) => ({
            id: q.id,
            question: q.question || 'No question provided',
            options: {
              A: q.optionA || 'Not Provided',
              B: q.optionB || 'Not Provided',
              C: q.optionC || 'Not Provided',
              D: q.optionD || 'Not Provided'
            },
            correctOption: q.correct_option?.trim()?.toUpperCase() || 'A'
          }));
          this.startTimer();
        } else {
          console.warn("No questions received from API");
        }
      },
      (error) => {
        console.error('Error fetching questions:', error);
      }
    );
  }
  
  

  

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.nextQuestion();
      }
    }, 1000);
  }

  selectOption(option: string) {
    if (!this.showFeedback) {
      this.selectedOption = option;
      this.correctAnswer = this.questions[this.currentQuestionIndex]?.correctOption || 'Not Provided';
      this.showFeedback = true;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.timeLeft = 60;
      this.selectedOption = null;
      this.showFeedback = false;
      this.correctAnswer = ''; 
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    clearInterval(this.interval);
    this.isQuizFinished = true;
  }
  
}
