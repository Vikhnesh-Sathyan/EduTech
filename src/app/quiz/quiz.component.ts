import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuizService } from '../quiz.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,HttpClientModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
  providers:[QuizService]
})
export class QuizComponent {

  questionForm: FormGroup;

  constructor(private fb: FormBuilder, private quizService: QuizService) {
    this.questionForm = this.fb.group({
      questions: this.fb.array([this.createQuestionFormGroup()]),
    });
  }

  get questions() {
    return this.questionForm.get('questions') as FormArray;
  }

  createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: ['', Validators.required],
      optionD: ['', Validators.required],
      correctOption: ['', [Validators.required, Validators.pattern('^[A-D]$')]],
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionFormGroup());
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  submit(): void {
    if (this.questionForm.valid) {
      this.quizService.uploadQuestions(this.questionForm.value.questions).subscribe(
        (response) => {
          alert('Questions uploaded successfully!');
          this.questionForm.reset();
          this.questions.clear();
          this.questions.push(this.createQuestionFormGroup());
        },
        (error) => {
          console.error('Error uploading questions:', error);
          alert('Failed to upload questions.');
        }
      );
    } else {
      alert('Please fill all required fields.');
    }
  }
}
