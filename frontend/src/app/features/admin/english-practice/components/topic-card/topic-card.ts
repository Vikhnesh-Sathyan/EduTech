import { Component, input } from '@angular/core';

import { DatePipe, TitleCasePipe } from '@angular/common';

import { AdminSpeakingTopic } from '../../models/speaking-topic.model';

@Component({
  selector: 'app-topic-card',
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './topic-card.html',
  styleUrl: './topic-card.css'
})
export class TopicCard {

  topic = input.required<AdminSpeakingTopic>();

}