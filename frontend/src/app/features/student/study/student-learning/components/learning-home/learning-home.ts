import { Component, input, output } from '@angular/core';

@Component({
selector: 'app-learning-home',
standalone: true,
imports: [],
templateUrl: './learning-home.html',
styleUrl: './learning-home.css'
})
export class LearningHome {

// Subject information
subjectName = input('Subject');

// Learning hierarchy from the parent
topics = input<any[]>([]);

// Selected subtopic and challenge information
selectedSubtopicId = input<number | null>(null);
challengeStatus = input<any | null>(null);
challengeStatusLoading = input(false);

// Actions handled by the parent
selectTopic = output<number>();
selectSubtopic = output<number>();
startBasicChallenge = output<void>();
openAdvancedLearning = output<void>();
}
