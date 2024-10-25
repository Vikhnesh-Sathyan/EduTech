import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../question.service'; // Import your service here

@Component({
    selector: 'app-generate-question',
    standalone: true,
    imports: [HttpClientModule, FormsModule, CommonModule],
    templateUrl: './generate-question.component.html',
    styleUrls: ['./generate-question.component.css'],
    providers:[QuestionService]
})
export class GenerateQuestionComponent {
    questions: any[] = [{ question_text: '', answer: '', difficulty_level: '' }]; // Initialize with one question

    constructor(private questionService: QuestionService) {} // Ensure the service is injected

    // Method to add a new question input
    addQuestion() {
        this.questions.push({ question_text: '', answer: '', difficulty_level: '' });
    }

    // Method to submit all questions
    submitQuestions() {
        const validQuestions = this.questions.filter(q => q.question_text && q.answer && q.difficulty_level);
        if (validQuestions.length > 0) {
            this.questionService.submitQuestions(validQuestions).subscribe(
                response => {
                    console.log('Questions submitted successfully:', response);
                    this.questions = [{ question_text: '', answer: '', difficulty_level: '' }];
                },
                error => {
                    console.error('Error submitting questions:', error); // Log any error from the HTTP request
                    alert('There was an error submitting your questions. Please try again.');
                }
            );
        } else {
            alert('Please fill in all fields for each question before submitting.');
        }
    }
    
}
