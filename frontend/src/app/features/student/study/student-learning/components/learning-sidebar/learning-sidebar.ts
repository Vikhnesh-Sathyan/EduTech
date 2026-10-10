import { Component, input, output } from '@angular/core';

@Component({
selector: 'app-learning-sidebar',
standalone: true,
imports: [],
templateUrl: './learning-sidebar.html',
styleUrl: './learning-sidebar.css'
})
export class LearningSidebar {

subjectName = input('Subject');
topics = input<any[]>([]);

expandedTopicId = input<number | null>(null);
selectedSubtopicId = input<number | null>(null);
selectedSectionId = input<number | null>(null);

toggleTopic = output<number>();
selectSubtopic = output<number>();
selectSection = output<number>();
}
