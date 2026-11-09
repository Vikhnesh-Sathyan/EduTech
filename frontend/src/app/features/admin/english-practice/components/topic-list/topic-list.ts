import { Component, input } from '@angular/core';

import { AdminSpeakingTopic } from '../../models/speaking-topic.model';

import { TopicCard } from '../topic-card/topic-card';

@Component({
  selector: 'app-topic-list',
  imports: [TopicCard],
  templateUrl: './topic-list.html',
  styleUrl: './topic-list.css'
})
export class TopicList {

  topics = input<AdminSpeakingTopic[]>([]);

}