import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { AdminSubtopic } from '../../../../services/admin/admin-subtopic';
import { ToastService } from '../../../../services/toast.service';

import { DeepDive } from '../components/deep-dive/deep-dive';
import { BehindTheScenes } from '../components/behind-the-scenes/behind-the-scenes';
import { ConceptComparison } from '../components/concept-comparison/concept-comparison';
import { Debugging } from '../components/debugging/debugging';
import { RealWorldScenario } from '../components/real-world-scenario/real-world-scenario';
import { CodeChallenge } from '../components/code-challenge/code-challenge';
import { MiniHandsOnCoding } from '../components/mini-hands-on-coding/mini-hands-on-coding';
import { AdvancedPractice } from '../components/advanced-practice/advanced-practice';
import { ArchitectureDesign } from '../components/architecture-design/architecture-design';
import { InterviewChallenge } from '../components/interview-challenge/interview-challenge';


@Component({
  selector: 'app-admin-advanced',
  standalone: true,

  imports: [
    FormsModule,

    DeepDive,
    BehindTheScenes,
    ConceptComparison,
    Debugging,
    RealWorldScenario,
    CodeChallenge,
    MiniHandsOnCoding,
    AdvancedPractice,
    ArchitectureDesign,
    InterviewChallenge
  ],

  templateUrl: './admin-advanced.html',
  styleUrl: './admin-advanced.css'
})
export class AdminAdvanced implements OnInit {

  subtopicId = signal<number | null>(null);

  advancedExists = signal(false);

  advancedModules = signal<any[]>([]);

  selectedModules = signal<string[]>([]);

  selectedModuleForEditing =
    signal<string | null>(null);

  moduleContent = signal<any>({});


  loading = signal(false);

  saving = signal(false);

  contentLoading = signal(false);

  contentSaving = signal(false);


  moduleTypes = [
    {
      type: 'deep_dive',
      label: 'Deep Dive',
      description:
        'Go deeper into the concept with detailed technical understanding.'
    },

    {
      type: 'behind_the_scenes',
      label: 'Behind the Scenes',
      description:
        'Explain what happens internally when the concept is used.'
    },

    {
      type: 'concept_comparison',
      label: 'Concept Comparison',
      description:
        'Compare related concepts and explain when to use each one.'
    },

    {
      type: 'debugging',
      label: 'Debugging',
      description:
        'Teach students how to identify and fix realistic bugs.'
    },

    {
      type: 'real_world_scenario',
      label: 'Real-world Scenario',
      description:
        'Connect the concept to a realistic development situation.'
    },

    {
      type: 'code_challenge',
      label: 'Code Challenge',
      description:
        'Give students an advanced coding problem to solve.'
    },

    {
      type: 'mini_hands_on_coding',
      label: 'Mini Hands-on Coding',
      description:
        'Give students a focused implementation task.'
    },

    {
      type: 'advanced_practice',
      label: 'Advanced Practice',
      description:
        'Create an application-based advanced practice question.'
    },

    {
      type: 'architecture_design',
      label: 'Architecture / Design Thinking',
      description:
        'Teach system design and engineering decision-making.'
    },

    {
      type: 'interview_challenge',
      label: 'Interview Challenge',
      description:
        'Prepare students to explain the concept in technical interviews.'
    }
  ];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminSubtopic: AdminSubtopic,
    private toastService: ToastService
  ) {}


  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get(
          'subtopicId'
        )
      );

    if (!id) {
      return;
    }

    this.subtopicId.set(id);

    this.loadAdvanced();

  }


  loadAdvanced(): void {

    const id = this.subtopicId();

    if (!id) {
      return;
    }

    this.loading.set(true);

    this.adminSubtopic
      .getAdvancedSetup(id)
      .subscribe({

        next: (response: any) => {

          this.advancedExists.set(
            response.exists
          );

          const modules =
            response.modules || [];

          this.advancedModules.set(
            modules
          );

          this.selectedModules.set(
            modules.map(
              (module: any) =>
                module.module_type
            )
          );

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load Advanced setup:',
            error
          );

          this.loading.set(false);

          this.toastService.error(
            error?.error?.message ||
            'Failed to load Advanced setup.'
          );

        }

      });

  }


  isSelected(
    moduleType: string
  ): boolean {

    return this.selectedModules()
      .includes(moduleType);

  }


  toggleModule(
    moduleType: string
  ): void {

    const current =
      [...this.selectedModules()];

    const index =
      current.indexOf(moduleType);

    if (index >= 0) {

      current.splice(index, 1);

    } else {

      current.push(moduleType);

    }

    this.selectedModules.set(current);

  }


  saveAdvanced(): void {

    const id = this.subtopicId();

    if (!id) {
      return;
    }

    const modules =
      this.selectedModules();

    if (modules.length === 0) {

      this.toastService.error(
        'Select at least one Advanced module.'
      );

      return;

    }

    this.saving.set(true);


    const request$ =
      this.advancedExists()

        ? this.adminSubtopic
            .updateAdvancedSetup(
              id,
              modules
            )

        : this.adminSubtopic
            .createAdvancedSetup(
              id,
              modules
            );


    request$.subscribe({

      next: () => {

        this.advancedExists.set(true);

        this.saving.set(false);

        this.toastService.success(
          'Advanced setup saved successfully.'
        );

        // Refresh module IDs after create/update.
        this.loadAdvanced();

      },

      error: (error) => {

        console.error(
          'Failed to save Advanced setup:',
          error
        );

        this.saving.set(false);

        this.toastService.error(
          error?.error?.message ||
          'Failed to save Advanced setup.'
        );

      }

    });

  }


  openModuleContent(
    moduleType: string
  ): void {

    const module =
      this.advancedModules().find(
        (item: any) =>
          item.module_type === moduleType
      );

    if (!module) {

      this.toastService.error(
        'Save the Advanced setup first.'
      );

      return;

    }

    this.selectedModuleForEditing.set(
      moduleType
    );

    this.loadModuleContent(
      module.id
    );

  }


  getAdvancedModuleId(
    moduleType: string
  ): number | null {

    const module =
      this.advancedModules().find(
        (item: any) =>
          item.module_type === moduleType
      );

    return module
      ? module.id
      : null;

  }


  loadModuleContent(
    moduleId: number
  ): void {

    this.contentLoading.set(true);

    this.moduleContent.set({});


    this.adminSubtopic
      .getAdvancedModuleContent(
        moduleId
      )
      .subscribe({

        next: (response: any) => {

          this.moduleContent.set(
            response.content?.content_data || {}
          );

          this.contentLoading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load module content:',
            error
          );

          this.contentLoading.set(false);

          this.toastService.error(
            error?.error?.message ||
            'Failed to load module content.'
          );

        }

      });

  }


  saveModuleContent(
    contentData: any
  ): void {

    const moduleType =
      this.selectedModuleForEditing();

    if (!moduleType) {
      return;
    }

    const moduleId =
      this.getAdvancedModuleId(
        moduleType
      );

    if (!moduleId) {

      this.toastService.error(
        'Advanced module was not found.'
      );

      return;

    }

    this.contentSaving.set(true);


    this.adminSubtopic
      .saveAdvancedModuleContent(
        moduleId,
        contentData
      )
      .subscribe({

        next: () => {

          this.moduleContent.set(
            contentData
          );

          this.contentSaving.set(false);

          this.toastService.success(
            'Advanced module content saved successfully.'
          );

        },

        error: (error) => {

          console.error(
            'Failed to save module content:',
            error
          );

          this.contentSaving.set(false);

          this.toastService.error(
            error?.error?.message ||
            'Failed to save module content.'
          );

        }

      });

  }


  closeModuleContent(): void {

    this.selectedModuleForEditing.set(
      null
    );

    this.moduleContent.set({});

  }


  updateModuleContent(
    content: any
  ): void {

    this.moduleContent.set(
      content
    );

  }


  getModuleLabel(
    moduleType: string
  ): string {

    const module =
      this.moduleTypes.find(
        item =>
          item.type === moduleType
      );

    return module?.label || moduleType;

  }


 goBack(): void {
  this.router.navigate(['/admin/topics']);
}

}