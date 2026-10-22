
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';
import { ToastService } from '../../../../services/toast.service';

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './discover-students.html',
  styleUrl: './discover-students.css'
})
export class DiscoverStudents implements OnInit {

  skills = signal<AvailableSkill[]>([]);
  selectedSkillId = signal<number | null>(null);
  students = signal<DiscoveredStudent[]>([]);

  loadingSkills = signal(false);
  loadingStudents = signal(false);
  errorMessage = signal('');
  searchTerm = signal('');

  // Swap request modal state
  showRequestModal = signal(false);
  submittingRequest = signal(false);
  selectedStudent = signal<DiscoveredStudent | null>(null);

  requestType: 'learning' | 'mutual_exchange' = 'learning';
  teachSkillId: number | null = null;
  requestMessage = '';

  // Skills this student has saved as skills they can teach
  myTeachingSkills = signal<AvailableSkill[]>([]);

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

  constructor(
    private skillSwapService: SkillSwapService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMyLearningSkills();
    this.loadMyTeachingSkills();
  }

  loadMyLearningSkills(): void {
    this.loadingSkills.set(true);
    this.errorMessage.set('');
    this.skills.set([]);
    this.students.set([]);
    this.selectedSkillId.set(null);

    this.skillSwapService.getMySkills().subscribe({
      next: (response: any) => {
        const data = response?.data;
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
            id: Number(skill.skill_id ?? skill.id),
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

  loadMyTeachingSkills(): void {
    this.skillSwapService.getMySkills().subscribe({
      next: (response: any) => {
        const data = response?.data;
        let teachingSkills: any[] = [];

        if (Array.isArray(data)) {
          teachingSkills = data.filter(
            (skill: any) => skill.skill_type === 'teach'
          );
        } else if (Array.isArray(data?.teaching_skills)) {
          teachingSkills = data.teaching_skills;
        } else if (Array.isArray(data?.skills)) {
          teachingSkills = data.skills.filter(
            (skill: any) => skill.skill_type === 'teach'
          );
        } else if (Array.isArray(data?.my_skills)) {
          teachingSkills = data.my_skills.filter(
            (skill: any) => skill.skill_type === 'teach'
          );
        }

        this.myTeachingSkills.set(
          teachingSkills
            .map((skill: any) => ({
              id: Number(skill.skill_id ?? skill.id),
              name: skill.skill_name ?? skill.name
            }))
            .filter((skill: AvailableSkill) =>
              Number.isInteger(skill.id) &&
              skill.id > 0 &&
              Boolean(skill.name)
            )
        );
      },
      error: () => {
        this.toastService.error('Unable to load your teaching skills.');
      }
    });
  }

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
    const skillId = Number((event.target as HTMLSelectElement).value);

    if (skillId > 0) {
      this.onSkillChange(skillId);
    }
  }

  handleSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  parseSkills(skills: string | null): string[] {
    if (!skills) {
      return [];
    }

    return skills.split(',').map(skill => skill.trim()).filter(Boolean);
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

    return name.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  openRequestModal(student: DiscoveredStudent): void {
    this.selectedStudent.set(student);
    this.requestType = 'learning';
    this.teachSkillId = null;
    this.requestMessage = '';
    this.showRequestModal.set(true);
  }

  closeRequestModal(): void {
    if (this.submittingRequest()) {
      return;
    }

    this.showRequestModal.set(false);
    this.selectedStudent.set(null);
  }

  submitSwapRequest(): void {
    const student = this.selectedStudent();
    const learnSkillId = this.selectedSkillId();

    if (!student || !learnSkillId) {
      this.toastService.error('Please select a student and learning skill.');
      return;
    }

    if (this.requestType === 'mutual_exchange') {
      if (
        !this.teachSkillId ||
        !this.myTeachingSkills().some(
          skill => skill.id === this.teachSkillId
        )
      ) {
        this.toastService.error(
          'Please select a skill you can teach in return.'
        );
        return;
      }

      if (this.teachSkillId === learnSkillId) {
        this.toastService.error(
          'Choose different teaching and learning skills.'
        );
        return;
      }
    }

    const message = this.requestMessage.trim();

    if (message.length > 500) {
      this.toastService.error('Message cannot exceed 500 characters.');
      return;
    }

    this.submittingRequest.set(true);

    this.skillSwapService.sendSwapRequest({
      receiver_id: student.student_id,
      request_type: this.requestType,
      learn_skill_id: learnSkillId,
      ...(this.requestType === 'mutual_exchange'
        ? { teach_skill_id: this.teachSkillId }
        : {}),
      message: message || null
    }).subscribe({
      next: (response: any) => {
        this.submittingRequest.set(false);
        this.showRequestModal.set(false);
        this.selectedStudent.set(null);
        this.toastService.success(
          response?.message || 'Skill Swap request sent successfully!'
        );
      },
      error: (error) => {
        this.submittingRequest.set(false);
        this.toastService.error(
          error.error?.message || 'Unable to send the Skill Swap request.'
        );
      }
    });
  }
}
