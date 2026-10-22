
import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkillSwapService } from '../../../../services/student/skillswap/skill-swap.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-schedule-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-session.html',
  styleUrl: './schedule-session.css'
})
export class ScheduleSession {

  @Input({ required: true }) requestId!: number;

  @Output() closed = new EventEmitter<void>();
  @Output() scheduled = new EventEmitter<void>();

  scheduling = signal(false);

  minScheduleDateTime = this.getMinDateTime();

  scheduleData = {
    scheduled_at: '',
    duration_minutes: 60,
    meeting_type: 'online' as 'online' | 'in_person',
    meeting_link: '',
    location: '',
    notes: ''
  };

  constructor(
    private skillSwapService: SkillSwapService,
    private toastService: ToastService
  ) {}

  private getMinDateTime(): string {
    const now = new Date();

    // datetime-local expects local time without a timezone suffix.
    const localTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );

    return localTime.toISOString().slice(0, 16);
  }

  onMeetingTypeChange(): void {
    this.scheduleData.meeting_link = '';
    this.scheduleData.location = '';
  }

  close(): void {
    if (!this.scheduling()) {
      this.closed.emit();
    }
  }

  scheduleSession(): void {
    if (this.scheduling()) {
      return;
    }

    if (!this.requestId || this.requestId <= 0) {
      this.toastService.error('Invalid swap request.');
      return;
    }

    const scheduledDate = new Date(this.scheduleData.scheduled_at);

    if (
      !this.scheduleData.scheduled_at ||
      Number.isNaN(scheduledDate.getTime()) ||
      scheduledDate.getTime() <= Date.now()
    ) {
      this.toastService.error(
        'Please choose a future date and time.'
      );
      return;
    }

    if (
      this.scheduleData.duration_minutes < 15 ||
      this.scheduleData.duration_minutes > 240
    ) {
      this.toastService.error(
        'Session duration must be between 15 and 240 minutes.'
      );
      return;
    }

    const meetingLink = this.scheduleData.meeting_link.trim();
    const location = this.scheduleData.location.trim();

    if (
      this.scheduleData.meeting_type === 'online' &&
      !meetingLink
    ) {
      this.toastService.error(
        'Please enter the online meeting link.'
      );
      return;
    }

    if (
      this.scheduleData.meeting_type === 'online' &&
      !this.isValidHttpUrl(meetingLink)
    ) {
      this.toastService.error(
        'Please enter a valid meeting URL starting with https:// or http://.'
      );
      return;
    }

    if (
      this.scheduleData.meeting_type === 'in_person' &&
      !location
    ) {
      this.toastService.error(
        'Please enter the meeting location.'
      );
      return;
    }

    const payload = {
      request_id: this.requestId,
      scheduled_at: this.scheduleData.scheduled_at,
      duration_minutes: Number(this.scheduleData.duration_minutes),
      meeting_type: this.scheduleData.meeting_type,
      meeting_link:
        this.scheduleData.meeting_type === 'online'
          ? meetingLink
          : null,
      location:
        this.scheduleData.meeting_type === 'in_person'
          ? location
          : null,
      notes: this.scheduleData.notes.trim() || null
    };

    this.scheduling.set(true);

    this.skillSwapService.scheduleSwapSession(payload).subscribe({
      next: (response: any) => {
        this.scheduling.set(false);

        this.toastService.success(
          response?.message || 'Session scheduled successfully!'
        );

        this.scheduled.emit();
        this.closed.emit();
      },

      error: (error) => {
        this.scheduling.set(false);

        this.toastService.error(
          error?.error?.message || 'Unable to schedule the session.'
        );
      }
    });
  }

  private isValidHttpUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
