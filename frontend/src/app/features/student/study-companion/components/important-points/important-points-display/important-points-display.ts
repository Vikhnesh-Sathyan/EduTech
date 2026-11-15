
import { Component, Input } from '@angular/core';

import {
  StudyImportantPoint
} from '../../../models/important-points/study-important-points.model';

@Component({
  selector: 'app-important-points-display',
  standalone: true,
  imports: [],
  templateUrl: './important-points-display.html',
  styleUrl: './important-points-display.css',
})
export class ImportantPointsDisplay {

  @Input() importantPoints: StudyImportantPoint[] = [];

  // Display a readable point title
  getPointTitle(point: StudyImportantPoint, index: number): string {
    return point.pointTitle || `Important Point ${index + 1}`;
  }

}
