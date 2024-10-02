import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coursedetail',
  standalone: true,
  imports: [],
  templateUrl: './coursedetail.component.html',
  styleUrl: './coursedetail.component.css'
})
export class CoursedetailComponent {

  // Use a string index signature to allow string keys for the 'topics' object
  topics: { [key: string]: boolean } = {
    topic1: false,
    topic2: false,
    topic3: false,
    topic4: false,
    topic5: false
  };

  constructor(private router: Router) {}

  // Toggle the display of the selected topic
  toggleTopic(topicKey: string) {
    this.topics[topicKey] = !this.topics[topicKey];
  }

  // Navigate to the exam page
  takeExam() {
    this.router.navigate(['courseexam']);  // Replace '/exam' with the actual route for your exam page
  }
}
