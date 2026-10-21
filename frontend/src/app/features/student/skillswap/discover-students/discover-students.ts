
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';

interface AvailableSkill {
  id: number;
  name: string;
  category?: string | null;
  description?: string | null;
}

interface DiscoveredStudent {
  student_id: number;
  skill_id: number;
  skill_name: string;
  proficiency_level?: string | null;
  is_reciprocal_match: boolean | number;
  teaching_skills: string | null;
  learning_skills: string | null;
}

@Component({
  selector: 'app-discover-students',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './discover-students.html',
  styleUrl: './discover-students.css'
})
export class DiscoverStudents implements OnInit {

  // Available skills students can learn
  skills = signal<AvailableSkill[]>([]);

  // Selected skill and matching students
  selectedSkillId = signal<number | null>(null);
  students = signal<DiscoveredStudent[]>([]);

  // Loading and error states
  loadingSkills = signal(false);
  loadingStudents = signal(false);
  errorMessage = signal('');

  // Search students by their teaching or learning skills
  searchTerm = signal('');

  // Filter students based on the search term
  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.students();
    }

    return this.students().filter(student => {
      const searchableText = [
        student.skill_name,
        student.proficiency_level,
        student.teaching_skills,
        student.learning_skills
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(term);
    });
  });

  // Count reciprocal matches
  reciprocalMatchCount = computed(() =>
    this.students().filter(student =>
      Boolean(student.is_reciprocal_match)
    ).length
  );

  constructor(private skillSwapService: SkillSwapService) {}

  ngOnInit(): void {
    this.loadAvailableSkills();
  }

  // Step 1: Load active skills from the backend
  loadAvailableSkills(): void {
    this.loadingSkills.set(true);
    this.errorMessage.set('');

    this.skillSwapService.getAvailableSkills().subscribe({
      next: (response: any) => {
        const skills: AvailableSkill[] = Array.isArray(response.data)
          ? response.data
          : [];

        this.skills.set(skills);
        this.loadingSkills.set(false);

        // Automatically select the first skill if available
        if (skills.length > 0) {
          this.onSkillChange(skills[0].id);
        }
      },
      error: (error) => {
        this.loadingSkills.set(false);
        this.errorMessage.set(
          error.error?.message || 'Unable to load available skills.'
        );
      }
    });
  }

  // Step 2: Find students who teach the selected skill
  onSkillChange(skillId: number): void {
    this.selectedSkillId.set(skillId);
    this.students.set([]);
    this.errorMessage.set('');
    this.searchTerm.set('');
    this.loadingStudents.set(true);

    this.skillSwapService.discoverStudents(skillId).subscribe({
      next: (response: any) => {
        this.students.set(response.data?.students ?? []);
        this.loadingStudents.set(false);
      },
      error: (error) => {
        this.loadingStudents.set(false);
        this.errorMessage.set(
          error.error?.message || 'Unable to discover students.'
        );
      }
    });
  }

  // Handle the skill dropdown
  handleSkillSelection(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const skillId = Number(target.value);

    if (skillId > 0) {
      this.onSkillChange(skillId);
    }
  }

  // Handle the search input
  handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  // Convert skill lists into readable arrays
  parseSkills(skills: string | null): string[] {
    if (!skills) {
      return [];
    }

    return skills.split(',').map(skill => skill.trim()).filter(Boolean);
  }

  // Display proficiency with a readable label
  formatProficiency(level: string | null | undefined): string {
    if (!level) {
      return 'Not specified';
    }

    return level.charAt(0).toUpperCase() + level.slice(1);
  }
}
