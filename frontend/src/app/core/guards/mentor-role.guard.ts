// Is the logged-in user's role "mentor"?

import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';

export const mentorRoleGuard: CanActivateFn = () => {

  const router = inject(Router);

  // Get the logged-in user's information
  const user = localStorage.getItem('user');

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  try {

    const userData = JSON.parse(user);

    // Allow only mentor users
    if (userData.role === 'mentor') {
      return true;
    }

  } catch (error) {

    // Invalid stored user data
    localStorage.removeItem('user');

  }

  // Logged-in but not a mentor
  return router.createUrlTree(['/login']);
};