//Is the logged-in user's role "admin"?

import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';

export const adminRoleGuard: CanActivateFn = () => {

  const router = inject(Router);

  // Get the logged-in user's information
  const user = localStorage.getItem('user');

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  try {

    const userData = JSON.parse(user);

    // Allow only admin users
    if (userData.role === 'admin') {
      return true;
    }

  } catch (error) {

    // Invalid stored user data
    localStorage.removeItem('user');

  }

  // Logged-in but not an admin
  return router.createUrlTree(['/student-dashboard']);
};