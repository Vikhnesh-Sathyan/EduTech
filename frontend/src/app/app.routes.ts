import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { StudentDashboard } from './dashboards/student/student-dashboard/student-dashboard';

export const routes: Routes = [
  {
    path: 'register',
    component: Register
  },

  {
    path: 'login',
    component: Login
  },
  {
    path: 'student-dashboard',
    component: StudentDashboard
  },

  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full'
  }
];