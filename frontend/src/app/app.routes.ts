import { Routes } from '@angular/router';

// ==================== PUBLIC ====================

import { Home } from './home/home/home';

// ==================== AUTH ====================

import { Register } from './auth/register/register';
import { Login } from './auth/login/login';

// ==================== GUARDS ====================

import { authGuard } from './guards/auth.guard';
import { adminRoleGuard } from './guards/admin-role.guard';
import { mentorRoleGuard } from './guards/mentor-role.guard';

// ==================== STUDENT ====================

import { StudentDashboard } from './dashboards/student/student-dashboard/student-dashboard';
import { Profile } from './features/profile/profile';
// Common layout used by all student pages
import { StudentLayout } from './dashboards/student/student-layout/student-layout';

// ==================== STUDY ====================

import { Study } from './features/study/study';
import { Subject } from './features/study/subject-learning/subject-learning';
import { Diagnostic } from './features/study/diagnostic/diagnostic';
import { DiagnosticQuestions } from './features/admin/diagnostic-questions/diagnostic-questions';

// ==================== ADMIN ====================

import { AdminDashboard } from './dashboards/admin/admin-dashboard/admin-dashboard';

// Shared layout used by all admin pages
import { AdminLayout } from './dashboards/admin/admin-layout/admin-layout';

// Admin education program management page
import { EducationPrograms } from './features/admin/education-programs/education-programs';

// Admin department management page
import { Departments } from './features/admin/departments/departments';

// Admin education year management page
import { EducationYears } from './features/admin/education-years/education-years';

// Admin subject management page
import { Subjects } from './features/admin/subjects/subjects';

import { MentorVerification } from './features/admin/mentor-verification/mentor-verification';


// ==================== MENTOR ====================

import { MentorDashboard } from './dashboards/mentor/mentor-dashboard/mentor-dashboard';

import { MentorProfile } from './features/mentor/mentor-profile/mentor-profile';

import { MentorLayout } from './dashboards/mentor/mentor-layout/mentor-layout';

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

// Common layout used by all student pages
{
  path: '',
  component: StudentLayout,
  canActivate: [authGuard],
  children: [

    // Student dashboard
    {
      path: 'student-dashboard',
      component: StudentDashboard
    },

    // Student profile
    {
      path: 'profile',
      component: Profile
    },

    // Study subjects page
    {
      path: 'study',
      component: Study
    },

    // Dynamic subject learning page
    {
      path: 'study/:subjectId',
      component: Subject
    },

    {
      path: 'study/:subjectId/diagnostic',
      component: Diagnostic
    },

    {
      path: 'admin/diagnostic-questions',
      component: DiagnosticQuestions
    }

  ]
},

  // ==================== ADMIN ROUTES ====================

  // Admin dashboard keeps its own sidebar + topbar layout
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [
      authGuard,
      adminRoleGuard
    ]
  },

  // Admin management pages use the navbar-only layout
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [
      authGuard,
      adminRoleGuard
    ],
    children: [

      {
        path: 'education-programs',
        component: EducationPrograms
      },

      {
        path: 'departments',
        component: Departments
      },

      {
        path: 'education-years',
        component: EducationYears
      },

      {
        path: 'subjects',
        component: Subjects
      },

      {
        path: 'mentor-verification',
        component: MentorVerification,
      }

    ]
  },

// ==================== MENTOR ROUTES ====================

// Common layout used by all mentor pages
{
  path: '',
  component: MentorLayout,
  canActivate: [
    authGuard,
    mentorRoleGuard
  ],
  children: [

    {
      path: 'mentor-dashboard',
      component: MentorDashboard
    },

    {
      path: 'mentor-profile',
      component: MentorProfile
    }

  ]
}

];