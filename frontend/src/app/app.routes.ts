import { Routes } from '@angular/router';

// ======================================================
// PUBLIC
// ======================================================

import { Home } from './home/home/home';

// ======================================================
// AUTH
// ======================================================

import { Register } from './auth/register/register';
import { Login } from './auth/login/login';

// ======================================================
// GUARDS
// ======================================================

import { authGuard } from './guards/auth.guard';
import { adminRoleGuard } from './guards/admin-role.guard';
import { mentorRoleGuard } from './guards/mentor-role.guard';

// ======================================================
// STUDENT
// ======================================================

import { StudentLayout } from './dashboards/student/student-layout/student-layout';
import { StudentDashboard } from './dashboards/student/student-dashboard/student-dashboard';
import { Profile } from './features/profile/profile';

import { Study } from './features/study/study';
import { Subject } from './features/study/subject-learning/subject-learning';
import { Diagnostic } from './features/study/diagnostic/diagnostic';
import { DiagnosticResult } from './features/study/diagnostic-result/diagnostic-result';

// ======================================================
// ADMIN
// ======================================================

import { AdminDashboard } from './dashboards/admin/admin-dashboard/admin-dashboard';
import { AdminLayout } from './dashboards/admin/admin-layout/admin-layout';

import { EducationPrograms } from './features/admin/education-programs/education-programs';
import { Departments } from './features/admin/departments/departments';
import { EducationYears } from './features/admin/education-years/education-years';
import { Subjects } from './features/admin/subjects/subjects';
import { MentorVerification } from './features/admin/mentor-verification/mentor-verification';

import { DiagnosticQuestions } from './features/admin/diagnostic-questions/diagnostic-questions';
import { Topics } from './features/admin/topics/topics';

import { AdminTopicLearningPage } from './features/admin/admin-topic-learning/admin-topic-learning';
import { AdminLearningSectionsPage } from './features/admin/admin-learning-sections/admin-learning-sections';
import { AdminSectionLearningPage } from './features/admin/admin-section-learning/admin-section-learning';
import { AdminSubtopicsPage } from './features/admin/admin-subtopics/admin-subtopics';

// ======================================================
// MENTOR
// ======================================================

import { MentorLayout } from './dashboards/mentor/mentor-layout/mentor-layout';
import { MentorDashboard } from './dashboards/mentor/mentor-dashboard/mentor-dashboard';
import { MentorProfile } from './features/mentor/mentor-profile/mentor-profile';


// ======================================================
// ROUTES
// ======================================================

export const routes: Routes = [

  // ====================================================
  // PUBLIC ROUTES
  // ====================================================

  {
    path: '',
    component: Home
  },


  // ====================================================
  // AUTH ROUTES
  // ====================================================

  {
    path: 'register',
    component: Register
  },

  {
    path: 'login',
    component: Login
  },


  // ====================================================
  // STUDENT ROUTES
  // ====================================================
  //
  // All student pages use StudentLayout.
  //
  // Student pages:
  // Dashboard
  // Profile
  // Study
  // Subject
  // Diagnostic
  //
  // ====================================================

  {
    path: '',
    component: StudentLayout,
    canActivate: [
      authGuard
    ],

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

      // Study subjects
      {
        path: 'study',
        component: Study
      },

      // Subject learning page
      {
        path: 'study/:subjectId',
        component: Subject
      },

      // Diagnostic page
      {
        path: 'study/:subjectId/diagnostic',
        component: Diagnostic
      },

        // Diagnostic Result  
      {
        path: 'diagnostic-result/:subjectId',
        component: DiagnosticResult
      }

    ]
  },


  // ====================================================
  // ADMIN DASHBOARD
  // ====================================================
  //
  // The main Admin Dashboard has its own layout.
  //
  // ====================================================

  {
    path: 'admin-dashboard',
    component: AdminDashboard,

    canActivate: [
      authGuard,
      adminRoleGuard
    ]
  },


  // ====================================================
  // ADMIN MANAGEMENT ROUTES
  // ====================================================
  //
  // All admin management pages use AdminLayout.
  //
  // /admin/education-programs
  // /admin/departments
  // /admin/education-years
  // /admin/subjects
  // /admin/mentor-verification
  // /admin/topics
  // /admin/diagnostic-questions
  //
  // ====================================================

  {
    path: 'admin',
    component: AdminLayout,

    canActivate: [
      authGuard,
      adminRoleGuard
    ],

    children: [

      // --------------------------------------------------
      // Education
      // --------------------------------------------------

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


      // --------------------------------------------------
      // Mentor Management
      // --------------------------------------------------

      {
        path: 'mentor-verification',
        component: MentorVerification
      },


      // --------------------------------------------------
      // Learning Management
      // --------------------------------------------------

      {
        path: 'topics',
        component: Topics
      },

      {
        path: 'diagnostic-questions',
        component: DiagnosticQuestions
      },

      {
       path: 'topic-learning/:topicId',
       component: AdminTopicLearningPage
      },

      {
        path: 'topic-sections/:topicId',
        component: AdminLearningSectionsPage
      },

      {
        path: 'section-learning/:sectionId',
        component: AdminSectionLearningPage
      }, 

      {
        path: 'subtopics/:topicId',
        component: AdminSubtopicsPage
      },

      {
        path: 'subtopic-sections/:subtopicId',
        component: AdminLearningSectionsPage
      },
    ]
  },


  // ====================================================
  // MENTOR ROUTES
  // ====================================================
  //
  // All mentor pages use MentorLayout.
  //
  // ====================================================

  {
    path: '',
    component: MentorLayout,

    canActivate: [
      authGuard,
      mentorRoleGuard
    ],

    children: [

      // Mentor dashboard
      {
        path: 'mentor-dashboard',
        component: MentorDashboard
      },

      // Mentor profile
      {
        path: 'mentor-profile',
        component: MentorProfile
      }

    ]
  }

];