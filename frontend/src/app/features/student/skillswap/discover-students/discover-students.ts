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
  student_name: string;
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

  // Only the logged-in student's saved learning skills
  skills = signal<AvailableSkill[]>([]);
  selectedSkillId = signal<number | null>(null);
  students = signal<DiscoveredStudent[]>([]);

  loadingSkills = signal(false);
  loadingStudents = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');

  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.students();
    }

    return this.students().filter(student => {
      const searchableText = [
        student.student_name,
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

  reciprocalMatchCount = computed(() =>
    this.students().filter(student =>
      Boolean(student.is_reciprocal_match)
    ).length
  );

  constructor(private skillSwapService: SkillSwapService) {}

  ngOnInit(): void {
    this.loadMyLearningSkills();
  }

  // Load only the skills this student actually wants to learn
  loadMyLearningSkills(): void {
    this.loadingSkills.set(true);
    this.errorMessage.set('');
    this.skills.set([]);
    this.students.set([]);
    this.selectedSkillId.set(null);

    this.skillSwapService.getMySkills().subscribe({
      next: (response: any) => {
        const data = response?.data;

        // Support either an array response or grouped skill arrays.
        let learningSkills: any[] = [];

        if (Array.isArray(data)) {
          learningSkills = data.filter(
            (skill: any) => skill.skill_type === 'learn'
          );
        } else if (Array.isArray(data?.learning_skills)) {
          learningSkills = data.learning_skills;
        } else if (Array.isArray(data?.skills)) {
          learningSkills = data.skills.filter(
            (skill: any) => skill.skill_type === 'learn'
          );
        } else if (Array.isArray(data?.my_skills)) {
          learningSkills = data.my_skills.filter(
            (skill: any) => skill.skill_type === 'learn'
          );
        }

        const mappedSkills: AvailableSkill[] = learningSkills
  .map((skill: any) => ({
    id: Number(skill.skill_id),
    name: skill.skill_name ?? skill.name
  }))
  .filter((skill: AvailableSkill) =>
    Number.isInteger(skill.id) &&
    skill.id > 0 &&
    Boolean(skill.name)
  );

        this.skills.set(mappedSkills);
        this.loadingSkills.set(false);

        if (mappedSkills.length > 0) {
          // Select the first skill from YOUR saved learning skills.
          this.onSkillChange(mappedSkills[0].id);
        }
      },
      error: (error) => {
        this.loadingSkills.set(false);
        this.errorMessage.set(
          error.error?.message || 'Unable to load your learning skills.'
        );
      }
    });
  }

  // Find students who can teach the selected learning skill
  onSkillChange(skillId: number): void {
    if (!this.skills().some(skill => skill.id === skillId)) {
      return;
    }

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

  handleSkillSelection(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const skillId = Number(target.value);

    if (skillId > 0) {
      this.onSkillChange(skillId);
    }
  }

  handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  parseSkills(skills: string | null): string[] {
    if (!skills) {
      return [];
    }

    return skills
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);
  }

  formatProficiency(level: string | null | undefined): string {
    if (!level) {
      return 'Not specified';
    }

    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  getStudentInitials(name: string | null | undefined): string {
    if (!name?.trim()) {
      return 'S';
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }
}
