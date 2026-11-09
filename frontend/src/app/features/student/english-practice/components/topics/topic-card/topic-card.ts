import { Component, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { SpeakingTopic } from '../../../models/topics/speaking-topic.model';

@Component({
  selector: 'app-topic-card',
  imports: [TitleCasePipe],
  templateUrl: './topic-card.html',
  styleUrl: './topic-card.css'
})
export class TopicCard {

  readonly topic = input.required<SpeakingTopic>();

  readonly startPractice = output<SpeakingTopic>();

  onStartPractice(): void {
    this.startPractice.emit(this.topic());
  }

}