import { Routes } from '@angular/router';

// ==================== PUBLIC ====================

import { Home } from './home/home/home';

// ==================== AUTH ====================

import { Register } from './auth/register/register';

import { Login } from './auth/login/login';

import { authGuard } from './guards/auth.guard';

// ==================== STUDENT ====================

import { StudentDashboard } from './dashboards/student/student-dashboard/student-dashboard';

import { Profile } from './features/profile/profile';

// ==================== STUDY ====================

import { Study } from './features/study/study';

import { Subject } from './features/study/subject/subject';


export const routes: Routes = [

  // ==================== PUBLIC ROUTES ====================

  // Public Home page
  {
    path: '',
    component: Home
  },


  // ==================== AUTH ROUTES ====================

  // Registration page
  {
    path: 'register',
    component: Register
  },

  // Login page
  {
    path: 'login',
    component: Login
  },


  // ==================== STUDENT ROUTES ====================

  // Student dashboard
  {
    path: 'student-dashboard',
  component: StudentDashboard,
  canActivate: [authGuard]
  },
  {
    path: 'profile',
  component: Profile,
  canActivate: [authGuard]
  },

  // ==================== STUDY ROUTES ====================

  // Study subjects page
  {
    path: 'study',
    component: Study
  },

  // Dynamic subject page
  {
    path: 'study/:subjectId',
    component: Subject
  }

];