
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-suggest-skill',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './suggest-skill.html',
  styleUrl: './suggest-skill.css'
})
export class SuggestSkill {
  name = '';
  category = '';
  description = '';

  loading = false;
  errorMessage = '';
  successMessage = '';
  submittedSkill = '';

  constructor(
  private skillSwapService: SkillSwapService,
  private toastService: ToastService
) {}

  submitSuggestion(): void {
  this.errorMessage = '';
  this.successMessage = '';

  const cleanName = this.name.trim();

  if (!cleanName) {
    this.toastService.error('Please enter a skill name.');
    return;
  }

  if (cleanName.length > 100) {
    this.toastService.error(
      'Skill name cannot exceed 100 characters.'
    );
    return;
  }

  this.loading = true;

  this.skillSwapService.suggestSkill({
    name: cleanName,
    category: this.category.trim(),
    description: this.description.trim()
  }).subscribe({
    next: (response: any) => {
      this.loading = false;
      this.submittedSkill = cleanName;

      this.toastService.success(
        'Skill suggestion submitted successfully! Awaiting admin review.'
      );

      this.successMessage =
        response.message ||
        'Your skill has been submitted for admin review.';

      this.name = '';
      this.category = '';
      this.description = '';
    },

    error: (error: any) => {
      this.loading = false;

      const message =
        error.error?.message ||
        'Unable to submit your suggestion. Please try again.';

      this.toastService.error(message);
      this.errorMessage = message;
    }
  });
}
}
