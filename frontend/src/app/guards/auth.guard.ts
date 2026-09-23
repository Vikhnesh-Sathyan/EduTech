//t allows us to decide whether a user can enter a route.
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  //This checks browser localStorage for the login token.
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }
//If there is no token, the guard returns a URL pointing to /login.
  return router.createUrlTree(['/login']);
};