import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coursedetail',
  standalone: true,
  templateUrl: './coursedetail.component.html',
  styleUrls: ['./coursedetail.component.css']
})
export class CoursedetailComponent {

  // Track the state of the topics and whether the video has been watched
  topics: { [key: string]: boolean } = {
    topic1: false,
    topic2: false,
    topic3: false,
    topic4: false,
    topic5: false
  };

  // Initially, the exam button is disabled
  videoWatched = false;

  constructor(private router: Router) {}

  // Toggle the display of the selected topic
  toggleTopic(topicKey: string) {
    this.topics[topicKey] = !this.topics[topicKey];
  }

  // Called when the video ends
  onVideoEnd() {
    this.videoWatched = true;  // Enable the button when the video ends
  }

  // Navigate to the exam page
  takeExam() {
    if (this.videoWatched) {
      this.router.navigate(['courseexam']);  // Replace 'courseexam' with your exam route
    } else {
      alert('Please watch the video before proceeding to the exam.');
    }
  }
}
