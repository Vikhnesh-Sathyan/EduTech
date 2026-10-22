
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advanced-module-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advanced-module-actions.html',
  styleUrl: './advanced-module-actions.css'
})
export class AdvancedModuleActions {
  moduleId = input.required<number>();
  moduleName = input.required<string>();
  completed = input(false);
  completing = input(false);

  completeModule = output<number>();
  askMentor = output<string>();

  onComplete(): void {
    if (this.completed() || this.completing()) {
      return;
    }

    this.completeModule.emit(this.moduleId());
  }

  onAskMentor(): void {
    this.askMentor.emit(this.moduleName());
  }
}
