import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ExecuteStudentSubmissionResponse
} from '../../../../../../../services/student/advanced/logic-to-code/logic-to-code.service';

@Component({
  selector: 'app-execution-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './execution-results.html',
  styleUrl: './execution-results.css'
})
export class ExecutionResults {

  @Input()
  executionError = '';

  @Input()
  executionResult: ExecuteStudentSubmissionResponse['data'] | null = null;

}