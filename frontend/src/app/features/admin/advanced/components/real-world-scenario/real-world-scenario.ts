import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-real-world-scenario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './real-world-scenario.html',
  styleUrl: './real-world-scenario.css'
})
export class RealWorldScenario {

  @Input() content: any = {};

  @Input() saving = false;

  @Output() contentChange =
    new EventEmitter<any>();

  @Output() save =
    new EventEmitter<any>();


  constructor(
    private toastService: ToastService
  ) {}


  updateField(
    field: string,
    value: string
  ): void {

    this.contentChange.emit({
      ...this.content,
      [field]: value
    });

  }


  saveContent(): void {

    const title =
      this.content.title?.trim();

    const scenario =
      this.content.scenario?.trim();

    const problem =
      this.content.problem?.trim();

    const howConceptSolvesIt =
      this.content.howConceptSolvesIt?.trim();


    // Validate title
    if (!title) {

      this.toastService.error(
        'Please enter a title.'
      );

      return;
    }


    // Validate scenario
    if (!scenario) {

      this.toastService.error(
        'Please describe the scenario.'
      );

      return;
    }


    // Validate problem
    if (!problem) {

      this.toastService.error(
        'Please describe the problem.'
      );

      return;
    }


    // Validate solution
    if (!howConceptSolvesIt) {

      this.toastService.error(
        'Please explain how the concept solves the problem.'
      );

      return;
    }


    // Save only after validation passes
    this.save.emit({

      ...this.content,

      title,

      scenario,

      problem,

      howConceptSolvesIt

    });

  }

}