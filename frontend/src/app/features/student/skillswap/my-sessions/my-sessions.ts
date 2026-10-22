
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';
import { ToastService } from '../../../../services/toast.service';

type SessionStatus = 'scheduled' | 'cancelled' | 'completed';
type SessionTab = 'upcoming' | 'past';

interface SwapSession {
  session_id: number;
  request_id: number;
  scheduled_at: string;
  duration_minutes: number;
  meeting_type: 'online' | 'in_person';
  meeting_link: string | null;
  location: string | null;
  notes: string | null;
  status: SessionStatus;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  receiver_name: string;
  teach_skill_name: string | null;
  learn_skill_name: string;
}

@Component({
  selector: 'app-my-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-sessions.html',
  styleUrl: './my-sessions.css'
})
export class MySessions implements OnInit, OnDestroy {

  sessions = signal<SwapSession[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  activeTab = signal<SessionTab>('upcoming');
  processingSessionId = signal<number | null>(null);

  private refreshInterval:
    ReturnType<typeof setInterval> | undefined;

  upcomingSessions = computed(() =>
    this.sessions().filter(session =>
      session.status === 'scheduled' &&
      new Date(session.scheduled_at).getTime() >= Date.now()
    )
  );

  pastSessions = computed(() =>
    this.sessions().filter(session =>
      session.status !== 'scheduled' ||
      new Date(session.scheduled_at).getTime() < Date.now()
    )
  );

  visibleSessions = computed(() =>
    this.activeTab() === 'upcoming'
      ? this.upcomingSessions()
      : this.pastSessions()
  );

  constructor(
    private skillSwapService: SkillSwapService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSessions();

    // Recheck session times every 15 seconds.
    this.refreshInterval = setInterval(() => {
      this.sessions.update(sessions => [...sessions]);
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval !== undefined) {
      clearInterval(this.refreshInterval);
    }
  }

  loadSessions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.skillSwapService.getMySwapSessions().subscribe({
      next: (response: any) => {
        const data = response?.data;

        this.sessions.set(
          Array.isArray(data) ? data : []
        );

        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load your sessions.'
        );

        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: SessionTab): void {
    this.activeTab.set(tab);
  }

  getOtherStudent(session: SwapSession): string {
    return session.sender_name ||
      session.receiver_name ||
      'Student';
  }

  getInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  getStatusLabel(status: SessionStatus): string {
    const labels: Record<SessionStatus, string> = {
      scheduled: 'Scheduled',
      cancelled: 'Cancelled',
      completed: 'Completed'
    };

    return labels[status] || status;
  }

  formatMeetingType(
    type: 'online' | 'in_person'
  ): string {
    return type === 'online'
      ? 'Online Meeting'
      : 'In-Person Meeting';
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  canMarkAsCompleted(session: SwapSession): boolean {
    if (session.status !== 'scheduled') {
      return false;
    }

    const startTime = new Date(
      session.scheduled_at
    ).getTime();

    const endTime =
      startTime + session.duration_minutes * 60 * 1000;

    return (
      Number.isFinite(startTime) &&
      Number.isFinite(session.duration_minutes) &&
      session.duration_minutes > 0 &&
      Date.now() >= endTime
    );
  }

  cancelSession(sessionId: number): void {
    if (this.processingSessionId() !== null) {
      return;
    }

    this.processingSessionId.set(sessionId);

    this.skillSwapService.cancelSwapSession(sessionId)
      .subscribe({
        next: (response: any) => {
          this.processingSessionId.set(null);

          this.toastService.success(
            response?.message ||
            'Session cancelled successfully.'
          );

          this.loadSessions();
        },
        error: (error) => {
          this.processingSessionId.set(null);

          this.toastService.error(
            error?.error?.message ||
            'Unable to cancel the session.'
          );
        }
      });
  }

  completeSession(sessionId: number): void {
    if (this.processingSessionId() !== null) {
      return;
    }

    const session = this.sessions().find(
      item => item.session_id === sessionId
    );

    // Frontend guard; the backend enforces this rule too.
    if (!session || !this.canMarkAsCompleted(session)) {
      this.toastService.info(
        'You can complete this session after its scheduled duration ends.'
      );
      return;
    }

    this.processingSessionId.set(sessionId);

    this.skillSwapService.completeSwapSession(sessionId)
      .subscribe({
        next: (response: any) => {
          this.processingSessionId.set(null);

          this.toastService.success(
            response?.message ||
            'Session marked as completed.'
          );

          this.loadSessions();
        },
        error: (error) => {
          this.processingSessionId.set(null);

          this.toastService.error(
            error?.error?.message ||
            'Unable to complete the session.'
          );
        }
      });
  }
}
