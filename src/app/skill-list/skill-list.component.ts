// skill-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SkillSwapService } from '../skill-swap.service';
import { Router } from '@angular/router'; // Import Router
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skill-list',
  standalone: true,
  imports: [HttpClientModule,CommonModule,FormsModule],
   templateUrl: './skill-list.component.html',
  styleUrls: ['./skill-list.component.css'],
  providers: [SkillSwapService]
})
export class SkillListComponent implements OnInit {
  profileData: any[] = [];

  constructor(private skillSwapService: SkillSwapService, private router: Router) {} // Inject Router

  ngOnInit(): void {
    this.loadProfiles();
  }

  // Fetch profiles from the backend
  loadProfiles(): void {
    this.skillSwapService.getProfiles().subscribe(
      (data) => {
        this.profileData = data;
        console.log('Fetched profiles:', this.profileData);
      },
      (error) => {
        console.error('Error fetching profiles:', error);
      }
    );
  }

  // Navigate to video call
  navigateTovideoCall(): void {
    this.router.navigate(['video-call']); // Ensure this matches your routing configuration
  }
}
