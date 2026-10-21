
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';

interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

interface StudentSkill {
  skill_id: number;
  name: string;
  skill_type: 'teach' | 'learn';
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | null;
}

@Component({
  selector: 'app-my-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-skills.html',
  styleUrl: './my-skills.css'
})
export class MySkills implements OnInit {
  availableSkills: Skill[] = [];
  mySkills: StudentSkill[] = [];

  teachSkillId: number | null = null;
  teachLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  learnSkillId: number | null = null;

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private skillSwapService: SkillSwapService) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.loading = true;
    this.errorMessage = '';

    this.skillSwapService.getAvailableSkills().subscribe({
      next: (response: any) => {
        this.availableSkills = Array.isArray(response.data)
          ? response.data
          : [];

        this.loadMySkills();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load available skills.';
      }
    });
  }

  loadMySkills(): void {
    this.skillSwapService.getMySkills().subscribe({
      next: (response: any) => {
        this.mySkills = Array.isArray(response.data)
          ? response.data
          : [];

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load your saved skills.';
      }
    });
  }

  get teachingSkills(): StudentSkill[] {
    return this.mySkills.filter(skill => skill.skill_type === 'teach');
  }

  get learningSkills(): StudentSkill[] {
    return this.mySkills.filter(skill => skill.skill_type === 'learn');
  }

  addTeachingSkill(): void {
    if (!this.teachSkillId) {
      this.errorMessage = 'Please select a skill to teach.';
      return;
    }

    this.saveSkills([{
      skill_id: this.teachSkillId,
      skill_type: 'teach',
      proficiency_level: this.teachLevel
    }]);
  }

  addLearningSkill(): void {
    if (!this.learnSkillId) {
      this.errorMessage = 'Please select a skill to learn.';
      return;
    }

    this.saveSkills([{
      skill_id: this.learnSkillId,
      skill_type: 'learn',
      proficiency_level: null
    }]);
  }

  private saveSkills(
    skills: {
      skill_id: number;
      skill_type: 'teach' | 'learn';
      proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | null;
    }[]
  ): void {
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.skillSwapService.saveMySkills(skills).subscribe({
      next: (response: any) => {
        this.saving = false;
        this.successMessage =
          response.message || 'Your skills have been saved.';

        this.teachSkillId = null;
        this.learnSkillId = null;

        this.loadMySkills();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage =
          error.error?.message || 'Unable to save your skills.';
      }
    });
  }

  removeSkill(skill: StudentSkill): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.skillSwapService
      .removeMySkill(skill.skill_id, skill.skill_type)
      .subscribe({
        next: (response: any) => {
          this.successMessage =
            response.message || 'Skill removed successfully.';

          this.loadMySkills();
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Unable to remove this skill.';
        }
      });
  }

  getSkillName(skillId: number): string {
    return this.availableSkills.find(skill => skill.id === skillId)?.name
      || 'Unknown skill';
  }
}
