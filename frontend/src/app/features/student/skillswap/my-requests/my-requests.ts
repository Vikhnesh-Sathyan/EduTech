
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';
import { ToastService } from '../../../../services/toast.service';
import { ScheduleSession } from '../schedule-session/schedule-session';

type RequestDirection = 'incoming' | 'sent';
type RequestTab = 'incoming' | 'sent';
type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

interface SwapRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  receiver_name: string;
  request_type: 'learning' | 'mutual_exchange';
  teach_skill_id: number | null;
  teach_skill_name: string | null;
  learn_skill_id: number;
  learn_skill_name: string;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  direction: RequestDirection;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ScheduleSession
  ],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css'
})
export class MyRequests implements OnInit {
  requests = signal<SwapRequest[]>([]);
  activeTab = signal<RequestTab>('incoming');
  loading = signal(false);
  errorMessage = signal('');
  processingRequestId = signal<number | null>(null);

  // Schedule Session modal state
  showScheduleForm = signal(false);
  selectedRequestId = signal<number | null>(null);

  incomingRequests = computed(() =>
    this.requests().filter(request => request.direction === 'incoming')
  );

  sentRequests = computed(() =>
    this.requests().filter(request => request.direction === 'sent')
  );

  visibleRequests = computed(() =>
    this.activeTab() === 'incoming'
      ? this.incomingRequests()
      : this.sentRequests()
  );

  pendingIncomingCount = computed(() =>
    this.incomingRequests().filter(request => request.status === 'pending').length
  );

  pendingSentCount = computed(() =>
    this.sentRequests().filter(request => request.status === 'pending').length
  );

  constructor(
    private skillSwapService: SkillSwapService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  // Open scheduling modal for an accepted request
  openScheduleForm(request: SwapRequest): void {
    if (!request.id || request.status !== 'accepted') {
      return;
    }

    this.selectedRequestId.set(request.id);
    this.showScheduleForm.set(true);
  }

  // Close scheduling modal
  closeScheduleForm(): void {
    this.showScheduleForm.set(false);
    this.selectedRequestId.set(null);
  }

  // Called when the session is successfully scheduled
  onSessionScheduled(): void {
    this.toastService.success('Your session has been scheduled.');
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.skillSwapService.getMySwapRequests().subscribe({
      next: (response: any) => {
        const data = response?.data;

        const requestList: any[] = Array.isArray(data)
          ? data
          : data?.requests ?? [];

        const currentUserId = Number(response?.current_user_id);

        if (!currentUserId) {
          this.requests.set([]);
          this.errorMessage.set(
            'Unable to identify the current student. Please check the backend response.'
          );
          this.loading.set(false);
          return;
        }

        const formattedRequests: SwapRequest[] = requestList.map(
          (request: any) => ({
            id: Number(request.id),
            sender_id: Number(request.sender_id),
            receiver_id: Number(request.receiver_id),
            sender_name: request.sender_name ?? 'Student',
            receiver_name: request.receiver_name ?? 'Student',
            request_type: request.request_type,
            teach_skill_id: request.teach_skill_id == null
              ? null
              : Number(request.teach_skill_id),
            teach_skill_name: request.teach_skill_name ?? null,
            learn_skill_id: Number(request.learn_skill_id),
            learn_skill_name: request.learn_skill_name ?? 'Unknown skill',
            message: request.message ?? null,
            status: request.status,
            created_at: request.created_at,
            direction: Number(request.sender_id) === currentUserId
              ? 'sent'
              : 'incoming'
          })
        );

        this.requests.set(formattedRequests);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Unable to load swap requests.'
        );
      }
    });
  }

  setActiveTab(tab: RequestTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set('');
  }

  respondToRequest(
    request: SwapRequest,
    status: 'accepted' | 'rejected'
  ): void {
    if (
      !request.id ||
      request.status !== 'pending' ||
      request.direction !== 'incoming'
    ) {
      return;
    }

    this.processingRequestId.set(request.id);

    this.skillSwapService
      .respondToSwapRequest(request.id, status)
      .subscribe({
        next: (response: any) => {
          this.toastService.success(
            response?.message ||
            (status === 'accepted'
              ? 'Swap request accepted successfully.'
              : 'Swap request rejected successfully.')
          );

          this.processingRequestId.set(null);
          this.loadRequests();
        },
        error: (error) => {
          this.processingRequestId.set(null);
          this.toastService.error(
            error.error?.message || 'Unable to update this request.'
          );
        }
      });
  }

  cancelRequest(request: SwapRequest): void {
    if (
      !request.id ||
      request.status !== 'pending' ||
      request.direction !== 'sent'
    ) {
      return;
    }

    this.processingRequestId.set(request.id);

    this.skillSwapService.cancelSwapRequest(request.id).subscribe({
      next: (response: any) => {
        this.toastService.success(
          response?.message || 'Swap request cancelled successfully.'
        );

        this.processingRequestId.set(null);
        this.loadRequests();
      },
      error: (error) => {
        this.processingRequestId.set(null);
        this.toastService.error(
          error.error?.message || 'Unable to cancel this request.'
        );
      }
    });
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getInitials(name: string | null | undefined): string {
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

  trackByRequestId(_index: number, request: SwapRequest): number {
    return request.id;
  }
}
