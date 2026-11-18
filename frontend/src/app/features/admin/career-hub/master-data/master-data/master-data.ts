
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminCareerMasterData } from '../../../../../services/admin/career-hub/admin-career-master-data';

type MasterTab = 'companies' | 'roles' | 'countries';

@Component({
  selector: 'app-master-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './master-data.html',
  styleUrl: './master-data.css'
})
export class MasterData implements OnInit {

  private fb = inject(FormBuilder);
  private masterDataService = inject(AdminCareerMasterData);

  activeTab = signal<MasterTab>('companies');

  companies = signal<any[]>([]);
  roles = signal<any[]>([]);
  countries = signal<any[]>([]);

  loading = signal(false);
  submitting = signal(false);

  editingId = signal<number | null>(null);
  message = signal('');
  errorMessage = signal('');

  masterForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    country_code: ['']
  });

  ngOnInit(): void {
    this.loadMasterData();
  }

  // LOAD ALL MASTER DATA
  loadMasterData(): void {
    this.loading.set(true);

    this.masterDataService.getMasterData().subscribe({
      next: (response) => {
        this.companies.set(response.data?.companies || []);
        this.roles.set(response.data?.roles || []);
        this.countries.set(response.data?.countries || []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load master data.');
        this.loading.set(false);
      }
    });
  }

  // CHANGE TAB
  changeTab(tab: MasterTab): void {
    this.activeTab.set(tab);
    this.resetForm();
    this.clearMessages();
  }

  // SUBMIT FORM
  submitForm(): void {
    if (this.masterForm.invalid || this.submitting()) {
      this.masterForm.markAllAsTouched();
      return;
    }

    const name = this.masterForm.value.name?.trim() || '';
    const countryCode = this.masterForm.value.country_code?.trim().toUpperCase() || '';

    if (this.activeTab() === 'countries' && !/^[A-Z]{2}$/.test(countryCode)) {
      this.errorMessage.set('Enter a valid two-letter country code.');
      return;
    }

    this.submitting.set(true);
    this.clearMessages();

    const id = this.editingId();
    const tab = this.activeTab();

    let request;

    if (tab === 'companies') {
      const data = { company_name: name };

      request = id
        ? this.masterDataService.updateCompany(id, data)
        : this.masterDataService.createCompany(data);

    } else if (tab === 'roles') {
      const data = { role_name: name };

      request = id
        ? this.masterDataService.updateJobRole(id, data)
        : this.masterDataService.createJobRole(data);

    } else {
      const data = {
        country_name: name,
        country_code: countryCode
      };

      request = id
        ? this.masterDataService.updateCountry(id, data)
        : this.masterDataService.createCountry(data);
    }

    request.subscribe({
      next: (response) => {
        this.message.set(response.message || 'Record saved successfully.');
        this.submitting.set(false);
        this.resetForm();
        this.loadMasterData();
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Unable to save record.'
        );
        this.submitting.set(false);
      }
    });
  }

  // EDIT RECORD
  editRecord(record: any): void {
    this.editingId.set(record.id);

    const name =
      record.company_name ||
      record.role_name ||
      record.country_name ||
      '';

    this.masterForm.patchValue({
      name,
      country_code: record.country_code || ''
    });

    this.clearMessages();
  }

  // ACTIVATE / DEACTIVATE
  toggleStatus(record: any): void {
    const newStatus = Number(record.is_active) === 1 ? 0 : 1;

    let request;

    if (this.activeTab() === 'companies') {
      request = this.masterDataService.toggleCompanyStatus(record.id, newStatus);
    } else if (this.activeTab() === 'roles') {
      request = this.masterDataService.toggleJobRoleStatus(record.id, newStatus);
    } else {
      request = this.masterDataService.toggleCountryStatus(record.id, newStatus);
    }

    request.subscribe({
      next: (response) => {
        this.message.set(response.message || 'Status updated successfully.');
        this.loadMasterData();
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Unable to update status.'
        );
      }
    });
  }

  // RESET FORM
  resetForm(): void {
    this.masterForm.reset({
      name: '',
      country_code: ''
    });

    this.editingId.set(null);
  }

  clearMessages(): void {
    this.message.set('');
    this.errorMessage.set('');
  }

  isActive(status: number | string): boolean {
  return Number(status) === 1;
}
}
