
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';
import { forkJoin } from 'rxjs';

import { ToastService } from '../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal';

interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

interface StudentSkill {
  id?: number;
  skill_id: number;
  name: string;
  skill_type: 'teach' | 'learn';
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | null;
}

@Component({
  selector: 'app-my-learning-skills',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  ConfirmModalComponent
],
  templateUrl: './my-learning-skills.html',
  styleUrl: './my-learning-skills.css'
})
export class MyLearningSkills implements OnInit {
  availableSkills: Skill[] = [];
  learningSkills: StudentSkill[] = [];

  learnSkillId: number | null = null;

  loading = false;
  saving = false;


  showRemoveModal = false;
  selectedSkillToRemove: StudentSkill | null = null;

constructor(
  private skillSwapService: SkillSwapService,
  private toastService: ToastService
) {}

  ngOnInit(): void {
    this.loadData();
  }

  
loadData(): void {
  this.loading = true;

  forkJoin({
    available: this.skillSwapService.getAvailableSkills(),
    mine: this.skillSwapService.getMySkills()
  }).subscribe({
    next: (response: any) => {
      this.availableSkills = Array.isArray(response.available?.data)
        ? response.available.data
        : [];

      const allSkills: StudentSkill[] = Array.isArray(response.mine?.data)
        ? response.mine.data
        : [];

      this.learningSkills = allSkills.filter(
        skill => skill.skill_type === 'learn'
      );

      this.loading = false;
    },
  });
}

  loadLearningSkills(): void {
    this.skillSwapService.getMySkills().subscribe({
      next: (response: any) => {
        const allSkills: StudentSkill[] = Array.isArray(response.data)
          ? response.data
          : [];

        this.learningSkills = allSkills.filter(
          skill => skill.skill_type === 'learn'
        );

        this.loading = false;
      },
    });
  }

  addLearningSkill(): void {
  if (this.learnSkillId === null) {
    this.toastService.error('Please select a skill to learn.');
    return;
  }

  this.saving = true;

  this.skillSwapService.saveMySkills([{
    skill_id: this.learnSkillId,
    skill_type: 'learn',
    proficiency_level: null
  }]).subscribe({
    next: (response: any) => {
      this.saving = false;
      this.learnSkillId = null;

      this.toastService.success(
        response.message || 'Learning skill added successfully.'
      );

      this.loadLearningSkills();
    },
    error: (error) => {
      this.saving = false;

      this.toastService.error(
        error.error?.message || 'Unable to save learning skill.'
      );
    }
  });
}

  removeLearningSkill(skill: StudentSkill): void {
  this.selectedSkillToRemove = skill;
  this.showRemoveModal = true;
}

cancelRemoveSkill(): void {
  this.showRemoveModal = false;
  this.selectedSkillToRemove = null;
}

confirmRemoveSkill(): void {
  const skill = this.selectedSkillToRemove;

  if (!skill || this.saving) {
    return;
  }

  this.saving = true;
  this.showRemoveModal = false;

  this.skillSwapService.removeMySkill(skill.skill_id, 'learn')
    .subscribe({
      next: (response: any) => {
        this.saving = false;
        this.selectedSkillToRemove = null;

        this.toastService.success(
          response.message || 'Learning skill removed successfully.'
        );

        this.loadLearningSkills();
      },
      error: (error) => {
        this.saving = false;
        this.selectedSkillToRemove = null;

        this.toastService.error(
          error.error?.message || 'Unable to remove learning skill.'
        );
      }
    });
}
}
