import { Component, input, output } from '@angular/core';

@Component({
selector: 'app-section-content',
standalone: true,
imports: [],
templateUrl: './section-content.html',
styleUrl: './section-content.css'
})
export class SectionContent {

sectionContent = input<any | null>(null);
sectionProgress = input<any | null>(null);

completeSection = output<void>();
}
