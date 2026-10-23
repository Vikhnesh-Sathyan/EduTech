
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentAdvancedModule } from '../../../../services/student/advanced/student-advanced.service';

@Component({
  selector: 'app-advanced-module-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advanced-module-renderer.html',
  styleUrl: './advanced-module-renderer.css'
})
export class AdvancedModuleRenderer {
  @Input({ required: true }) module!: StudentAdvancedModule;

  get content(): Record<string, any> {
    return this.module?.content ?? {};
  }

  get hasContent(): boolean {
    return Object.keys(this.content).length > 0;
  }

  get insights(): string[] {
    const value = this.content['keyInsights'];

    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split('\n').filter(line => line.trim());
    }

    return [];
  }

  get comparisonRows(): { label: string; a: string; b: string }[] {
    const c = this.content;

    return [
      {
        label: 'Definition',
        a: c['conceptA'] ?? '',
        b: c['conceptB'] ?? ''
      },
      {
        label: 'When to use',
        a: c['whenToUseA'] ?? '',
        b: c['whenToUseB'] ?? ''
      }
    ].filter(row => row.a || row.b);
  }

  get codeLines(): string[] {
    return [];
  }
}
