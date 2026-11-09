import { Component, input, output } from '@angular/core';

import { SpeakingTopic } from '../../../models/topics/speaking-topic.model';

import { TopicCard } from '../topic-card/topic-card';

@Component({
  selector: 'app-topic-list',
  imports: [TopicCard],
  templateUrl: './topic-list.html',
  styleUrl: './topic-list.css'
})
export class TopicList {

  readonly topics = input<SpeakingTopic[]>([]);

  readonly startPractice = output<SpeakingTopic>();

  onStartPractice(topic: SpeakingTopic): void {
    this.startPractice.emit(topic);
  }

}