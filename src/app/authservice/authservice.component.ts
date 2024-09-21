declare var google:any;

import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'  // Ensure the service is available application-wide
})
export class Authservice {
  router = inject(Router);
  constructor() {}

  signOut() {
    google.accounts.id.disableAutoSelect();
    this.router.navigate(['student-login']);
  }
}
