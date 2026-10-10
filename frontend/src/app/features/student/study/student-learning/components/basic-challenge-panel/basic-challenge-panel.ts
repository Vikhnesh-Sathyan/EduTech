import { Component, input, output } from '@angular/core';

@Component({
selector: 'app-basic-challenge-panel',
standalone: true,
imports: [],
templateUrl: './basic-challenge-panel.html',
styleUrl: './basic-challenge-panel.css'
})
export class BasicChallengePanel {
selectedSubtopicId = input<number | null>(null);
challengeStatus = input<any | null>(null);
challengeStatusLoading = input(false);

startBasicChallenge = output<void>();
openAdvancedLearning = output<void>();
}
