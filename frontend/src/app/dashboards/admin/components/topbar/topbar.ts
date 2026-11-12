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
  isDailyQuizOpen = false;


  toggleSkillSwap(): void {
    this.isSkillSwapOpen = !this.isSkillSwapOpen;
  }

  closeSkillSwap(): void {
    this.isSkillSwapOpen = false;
  }

  toggleDailyQuiz(): void {
  this.isDailyQuizOpen = !this.isDailyQuizOpen;
}

closeDailyQuiz(): void {
  this.isDailyQuizOpen = false;
}

}