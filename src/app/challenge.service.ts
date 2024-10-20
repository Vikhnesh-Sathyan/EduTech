import { Injectable } from '@angular/core';

interface Challenge {
  title: string;
  description: string;
  grade: number;
}

@Injectable({
  providedIn: 'root' // This ensures the service is available application-wide
})
export class ChallengeService {
  private challenges: Challenge[] = [];

  // Get all challenges
  getChallenges(): Challenge[] {
    return this.challenges;
  }

  // Add a new challenge
  addChallenge(challenge: Challenge): void {
    this.challenges.push(challenge);
  }

  // Delete a challenge
  deleteChallenge(challenge: Challenge): void {
    this.challenges = this.challenges.filter(c => c !== challenge);
  }
}
