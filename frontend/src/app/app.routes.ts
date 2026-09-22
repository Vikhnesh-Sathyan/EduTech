import { Routes } from '@angular/router';

// ==================== AUTH ====================

import { Register } from './auth/register/register';
import { Login } from './auth/login/login';

// ==================== STUDENT ====================

import { StudentDashboard } from './dashboards/student/student-dashboard/student-dashboard';

// ==================== STUDY ====================

import { Study } from './features/study/study';
import { Subject } from './features/study/subject/subject';

export const routes: Routes = [

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
    component: StudentDashboard
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
  },


  // ==================== DEFAULT ROUTE ====================

  // Open registration page by default
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full'
  }

];