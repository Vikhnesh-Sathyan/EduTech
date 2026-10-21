
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillSwapService } from '../../../../../services/student/skillswap/skill-swap.service';

import { ToastService } from '../../../../../services/toast.service';
import { ConfirmModalComponent } from '../../../../../shared/confirm-modal/confirm-modal';
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
  selector: 'app-my-teaching-skills',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  ConfirmModalComponent

],
  templateUrl: './my-teaching-skills.html',
  styleUrl: './my-teaching-skills.css'
})
export class MyTeachingSkills implements OnInit {
  availableSkills: Skill[] = [];
  teachingSkills: StudentSkill[] = [];

  teachSkillId: number | null = null;
  teachLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

  showRemoveModal = false;
  selectedSkillToRemove: StudentSkill | null = null;

  loading = false;
  saving = false; 

constructor(
  private skillSwapService: SkillSwapService,
  private toastService: ToastService
) {}
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.skillSwapService.getAvailableSkills().subscribe({
      next: (response: any) => {
        this.availableSkills = Array.isArray(response.data)
          ? response.data
          : [];

        this.loadTeachingSkills();
      },
    });
  }

  loadTeachingSkills(): void {
    this.skillSwapService.getMySkills().subscribe({
      next: (response: any) => {
        const allSkills: StudentSkill[] = Array.isArray(response.data)
          ? response.data
          : [];

        this.teachingSkills = allSkills.filter(
          skill => skill.skill_type === 'teach'
        );

        this.loading = false;
      },
    });
  }

  addTeachingSkill(): void {
  if (this.teachSkillId === null) {
    this.toastService.error('Please select a skill to teach.');
    return;
  }

  this.saving = true;

  this.skillSwapService.saveMySkills([{
    skill_id: this.teachSkillId,
    skill_type: 'teach',
    proficiency_level: this.teachLevel
  }]).subscribe({
    next: (response: any) => {
      this.saving = false;
      this.teachSkillId = null;
      this.teachLevel = 'beginner';

      this.toastService.success(
        response.message || 'Teaching skill added successfully.'
      );

      this.loadTeachingSkills();
    },
    error: (error) => {
      this.saving = false;

      this.toastService.error(
        error.error?.message || 'Unable to save teaching skill.'
      );
    }
  });
}

  removeTeachingSkill(skill: StudentSkill): void {
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

  this.skillSwapService.removeMySkill(skill.skill_id, 'teach')
    .subscribe({
      next: (response: any) => {
        this.saving = false;
        this.selectedSkillToRemove = null;

        this.toastService.success(
          response.message || 'Teaching skill removed successfully.'
        );

        this.loadTeachingSkills();
      },
      error: (error) => {
        this.saving = false;
        this.selectedSkillToRemove = null;

        this.toastService.error(
          error.error?.message || 'Unable to remove teaching skill.'
        );
      }
    });
}
}
