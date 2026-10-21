
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSkillSwapService } from '../../../../services/admin/skillswap/admin-skill-swap.service';

interface Skill {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  created_by?: number;
}

@Component({
  selector: 'app-manage-skills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-skills.html',
  styleUrl: './manage-skills.css'
})
export class ManageSkills implements OnInit {

  // Skills received from the backend
  skills = signal<Skill[]>([]);

  // Loading and feedback
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Search
  searchTerm = signal('');

  // Add/Edit form
  isEditing = signal(false);
  editingSkillId = signal<number | null>(null);

  form = {
    name: '',
    category: '',
    description: ''
  };

  // Statistics
  totalSkills = computed(() => this.skills().length);

  activeSkills = computed(() =>
    this.skills().filter(skill => skill.status === 'active').length
  );

  inactiveSkills = computed(() =>
    this.skills().filter(skill => skill.status === 'inactive').length
  );

  // Search skills by name, category or description
  filteredSkills = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.skills();
    }

    return this.skills().filter(skill =>
      [
        skill.name,
        skill.category,
        skill.description,
        skill.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  });

  constructor(
    private adminSkillSwapService: AdminSkillSwapService
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  // Load all skills
  loadSkills(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.adminSkillSwapService.getAllSkills().subscribe({
      next: (response: any) => {
        this.skills.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to load skills.'
        );
      }
    });
  }

  // Submit the Add/Edit form
  saveSkill(): void {
    const name = this.form.name.trim();

    if (!name) {
      this.errorMessage.set('Please enter a skill name.');
      this.successMessage.set('');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      name,
      category: this.form.category.trim(),
      description: this.form.description.trim()
    };

    const skillId = this.editingSkillId();

    const request = this.isEditing() && skillId !== null
      ? this.adminSkillSwapService.updateSkill(skillId, payload)
      : this.adminSkillSwapService.addSkill(payload);

    request.subscribe({
      next: (response: any) => {
        this.saving.set(false);
        this.successMessage.set(
          response.message || 'Skill saved successfully.'
        );

        this.resetForm();
        this.loadSkills();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          error.error?.message || 'Failed to save skill.'
        );
      }
    });
  }

  // Prepare the form to edit a skill
  editSkill(skill: Skill): void {
    this.isEditing.set(true);
    this.editingSkillId.set(skill.id);

    this.form = {
      name: skill.name,
      category: skill.category ?? '',
      description: skill.description ?? ''
    };

    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // Cancel editing or clear the form
  resetForm(): void {
    this.form = {
      name: '',
      category: '',
      description: ''
    };

    this.isEditing.set(false);
    this.editingSkillId.set(null);
  }

  // Activate or deactivate a skill
  toggleSkillStatus(skill: Skill): void {
    const newStatus: 'active' | 'inactive' =
      skill.status === 'active' ? 'inactive' : 'active';

    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminSkillSwapService
      .updateSkillStatus(skill.id, newStatus)
      .subscribe({
        next: (response: any) => {
          this.successMessage.set(
            response.message || `Skill ${newStatus} successfully.`
          );

          this.loadSkills();
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message || 'Failed to update skill status.'
          );
        }
      });
  }
}
