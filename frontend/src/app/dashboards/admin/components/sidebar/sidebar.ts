import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { signal } from '@angular/core';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  challengeArenaOpen = signal(false);

  careerHubOpen = signal(false);


toggleChallengeArena(): void {
  this.challengeArenaOpen.update(value => !value);
}

toggleCareerHub() {
  this.careerHubOpen.update(value => !value);
}


}