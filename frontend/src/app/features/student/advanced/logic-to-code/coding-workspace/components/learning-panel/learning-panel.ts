import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  StudentLogicToCodeProblemDetails,
  StudentLogicToCodeStep,
  StudentLogicToCodeHint,
  StudentLogicToCodeMistake,
  StudentLogicToCodePublicTestCase,
  StudentLogicToCodeReferenceSolution
} from '../../../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-learning-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-panel.html',
  styleUrl: './learning-panel.css'
})
export class LearningPanel {

  @Input({ required: true })
  problem!: StudentLogicToCodeProblemDetails;

  @Input()
  steps: StudentLogicToCodeStep[] = [];

  @Input()
  hints: StudentLogicToCodeHint[] = [];

  @Input()
  mistakes: StudentLogicToCodeMistake[] = [];

  @Input()
  referenceSolution: StudentLogicToCodeReferenceSolution | null = null;

  @Input()
  publicTestCases: StudentLogicToCodePublicTestCase[] = [];

}