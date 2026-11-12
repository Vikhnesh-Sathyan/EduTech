
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminDailyQuiz
} from '../../../../services/admin/daily-quiz/admin-daily-quiz.service';

// ==========================================
// AUTOMATION SETTINGS INTERFACE
// ==========================================

interface AutomationSetting {
  subject_id: number;
  subject_name: string;

  program_id: number;
  program_name: string;

  department_id: number;
  department_name: string;

  education_year_id: number;
  education_year_name: string;

  publish_time: string;
  time_zone: string;

  low_stock_threshold: number;

  automation_status: 'active' | 'paused' | 'not_configured';
}

@Component({
  selector: 'app-automation-settings',
  imports: [FormsModule],
  templateUrl: './automation-settings.html',
  styleUrl: './automation-settings.css',
})
export class AutomationSettings implements OnInit {

  // ==========================================
  // SETTINGS
  // ==========================================

  settings = signal<AutomationSetting[]>([]);

  loadingSettings = signal(false);

  // ==========================================
  // EDITING
  // ==========================================

  editingSubjectId = signal<number | null>(null);

  publishTime = signal('08:00');

  lowStockThreshold = signal(9);

  savingSettings = signal(false);

  // ==========================================
  // STATUS UPDATE
  // ==========================================

  updatingSubjectId = signal<number | null>(null);

  // ==========================================
  // MESSAGES
  // ==========================================

  successMessage = signal('');

  errorMessage = signal('');

  // ==========================================
  // SUMMARY
  // ==========================================

  totalSubjects = computed(() =>
    this.settings().length
  );

  activeCount = computed(() =>
    this.settings().filter(
      setting => setting.automation_status === 'active'
    ).length
  );

  pausedCount = computed(() =>
    this.settings().filter(
      setting => setting.automation_status === 'paused'
    ).length
  );

  notConfiguredCount = computed(() =>
    this.settings().filter(
      setting => setting.automation_status === 'not_configured'
    ).length
  );

  constructor(
    private dailyQuizService: AdminDailyQuiz
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  // ==========================================
  // LOAD AUTOMATION SETTINGS
  // ==========================================

  loadSettings(): void {

    this.loadingSettings.set(true);

    this.errorMessage.set('');

    this.dailyQuizService.getAutomationSettings().subscribe({

      next: (response: any) => {

        this.settings.set(response.settings || []);

        this.loadingSettings.set(false);

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Failed to load automation settings'
        );

        this.loadingSettings.set(false);

      }

    });

  }

  // ==========================================
  // OPEN SETTINGS EDITOR
  // ==========================================

  editSettings(setting: AutomationSetting): void {

    this.editingSubjectId.set(setting.subject_id);

    this.publishTime.set(
      setting.publish_time.substring(0, 5)
    );

    this.lowStockThreshold.set(
      setting.low_stock_threshold
    );

    this.clearMessages();

  }

  // ==========================================
  // CANCEL EDITING
  // ==========================================

  cancelEditing(): void {

    this.editingSubjectId.set(null);

    this.clearMessages();

  }

  // ==========================================
  // SAVE AUTOMATION SETTINGS
  // ==========================================

  saveSettings(setting: AutomationSetting): void {

    const publishTime = this.publishTime();

    const threshold = Number(this.lowStockThreshold());

    if (!publishTime) {

      this.errorMessage.set(
        'Please select a publication time'
      );

      return;

    }

    if (
      !Number.isInteger(threshold) ||
      threshold < 3 ||
      threshold > 1000
    ) {

      this.errorMessage.set(
        'Low-stock threshold must be between 3 and 1000'
      );

      return;

    }

    this.savingSettings.set(true);

    this.clearMessages();

    this.dailyQuizService.saveAutomationSettings({

      subject_id: setting.subject_id,

      publish_time: publishTime,

      low_stock_threshold: threshold

    }).subscribe({

      next: (response: any) => {

        this.successMessage.set(
          response.message ||
          'Automation settings saved successfully'
        );

        this.savingSettings.set(false);

        this.editingSubjectId.set(null);

        this.loadSettings();

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Failed to save automation settings'
        );

        this.savingSettings.set(false);

      }

    });

  }

  // ==========================================
  // PAUSE AUTOMATION
  // ==========================================

  pauseAutomation(setting: AutomationSetting): void {

    if (setting.automation_status !== 'active') {
      return;
    }

    this.updateAutomationStatus(
      setting.subject_id,
      'paused'
    );

  }

  // ==========================================
  // RESUME AUTOMATION
  // ==========================================

  resumeAutomation(setting: AutomationSetting): void {

    if (setting.automation_status !== 'paused') {
      return;
    }

    this.updateAutomationStatus(
      setting.subject_id,
      'active'
    );

  }

  // ==========================================
  // UPDATE AUTOMATION STATUS
  // ==========================================

  private updateAutomationStatus(
    subjectId: number,
    status: 'active' | 'paused'
  ): void {

    this.updatingSubjectId.set(subjectId);

    this.clearMessages();

    this.dailyQuizService.updateAutomationStatus(
      subjectId,
      status
    ).subscribe({

      next: (response: any) => {

        this.successMessage.set(
          response.message ||
          'Automation status updated successfully'
        );

        this.updatingSubjectId.set(null);

        this.loadSettings();

      },

      error: (error) => {

        this.errorMessage.set(
          error.error?.message ||
          'Failed to update automation status'
        );

        this.updatingSubjectId.set(null);

      }

    });

  }

  // ==========================================
  // MESSAGE RESET
  // ==========================================

  private clearMessages(): void {

    this.successMessage.set('');

    this.errorMessage.set('');

  }

}
