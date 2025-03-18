import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addstpla',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './addstpla.component.html',
  styleUrls: ['./addstpla.component.css'],
  providers: [AdminService],
})
export class AddstplaComponent implements OnInit {
  pendingUsers: any[] = [];
  loading: boolean = true;
  message: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchPendingUsers();
  }

  fetchPendingUsers(): void {
    this.adminService.getPendingApprovals().subscribe({
      next: (data) => {
        this.pendingUsers = data.map((user) => ({ ...user, showDetails: false }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.message = 'Error fetching pending approvals.';
        this.loading = false;
      },
    });
  }

  handleApproval(userId: number, isApproved: boolean): void {
    this.adminService.approveUser(userId, isApproved).subscribe({
      next: (res) => {
        this.message = res.message;
        this.pendingUsers = this.pendingUsers.filter((user) => user.id !== userId);
      },
      error: (err) => {
        console.error(err);
        this.message = 'Error processing approval/rejection.';
      },
    });
  }

  toggleDetails(user: any): void {
    user.showDetails = !user.showDetails;
  }
}
