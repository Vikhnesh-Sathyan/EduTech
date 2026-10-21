
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  isSkillSwapOpen = false;

  toggleSkillSwap(): void {
    this.isSkillSwapOpen = !this.isSkillSwapOpen;
  }

  closeSkillSwap(): void {
    this.isSkillSwapOpen = false;
  }
}
