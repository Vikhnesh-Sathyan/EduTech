
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheatsheetImportService } from '../../../../services/admin/cheatsheet/cheatsheet-import';

import { TechnologyManagementComponent } from '../technology-management/technology-management';
import { CategoryManagementComponent } from '../category-management/category-management';

@Component({
  selector: 'app-admin-cheatsheet',
  standalone: true,
  imports: [
    CommonModule,
    TechnologyManagementComponent,
    CategoryManagementComponent
  ],
  templateUrl: './admin-cheatsheet.html',
  styleUrl: './admin-cheatsheet.css'
})
export class AdminCheatsheetComponent {
  private cheatsheetImportService = inject(CheatsheetImportService);

  activeTab = signal<'technologies' | 'categories'>('technologies');

  importing = signal(false);
  message = signal('');
  error = signal('');

  setActiveTab(tab: 'technologies' | 'categories'): void {
    this.activeTab.set(tab);
  }

  importTechnologies(): void {
    this.importing.set(true);
    this.message.set('');
    this.error.set('');

    this.cheatsheetImportService.importTechnologies().subscribe({
      next: (response) => {
        this.message.set(
          `${response.message} Total: ${response.total}, Added: ${response.added}, Skipped: ${response.skipped}.`
        );

        this.importing.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.message || 'Failed to import technologies.'
        );

        this.importing.set(false);
      }
    });
  }
}
