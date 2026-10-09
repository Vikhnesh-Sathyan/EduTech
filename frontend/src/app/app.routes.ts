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
import { StudentLearningSection } from './features/study/student-learning-section/student-learning-section';
import { StudentStudyProgress } from './features/student-study-progress/student-study-progress';
import { StudentSubjectProgress } from './features/student-subject-progress/student-subject-progress';
import { BasicChallenge } from './features/student/basic-challenge/basic-challenge';

// Student Advanced Learning
import { StudentAdvanced } from './features/student/advanced/student-advanced/student-advanced';

// ======================================================
// STUDENT - MENTORS
// ======================================================

import { StudentMentors } from './features/student-mentors/student-mentors';
import { StudentMentorProfile } from './features/student-mentor-profile/student-mentor-profile';
import { StudentMyMentor } from './features/student-my-mentor/student-my-mentor';
import { StudentMentorRecommendations } from './features/student-mentor-recommendations/student-mentor-recommendations';
import { StudentPreviousMentors } from './features/student-previous-mentors/student-previous-mentors';

// ======================================================
// STUDENT - PROJECT UNDERSTANDING
// ======================================================

import {
  ProjectUnderstanding as StudentProjectUnderstanding
} from './features/project/project-understanding/project-understanding';

import {
  ProjectTopics as StudentProjectTopics
} from './features/project/project-topics/project-topics';

import {
  ProjectSections as StudentProjectSections
} from './features/project/project-sections/project-sections';

import {
  ProjectSectionContent as StudentProjectSectionContent
} from './features/project/project-section-content/project-section-content';

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
import { AdminAdvanced } from './features/admin/advanced/admin-advanced/admin-advanced';
import { QuestionBank } from './features/admin/basic-challenge/question-bank/question-bank';

// ======================================================
// ADMIN - PROJECT UNDERSTANDING
// ======================================================

import {
  ProjectUnderstanding
} from './features/admin/project-understanding/project-understanding';

import {
  ProjectTopics
} from './features/admin/project-topics/project-topics';

import {
  ProjectSections
} from './features/admin/project-sections/project-sections';

import {
  ProjectSectionContent
} from './features/admin/project-section-content/project-section-content';

// ======================================================
// MENTOR
// ======================================================

import { MentorLayout } from './dashboards/mentor/mentor-layout/mentor-layout';
import { MentorDashboard } from './dashboards/mentor/mentor-dashboard/mentor-dashboard';
import { MentorProfile } from './features/mentor/mentor-profile/mentor-profile';

import { MentorRequests } from './features/mentor/mentor-requests/mentor-requests';
import { MentorStudentProfile } from './features/mentor/mentor-student-profile/mentor-student-profile';

// ======================================================
// ROUTES
// ======================================================

export const routes: Routes = [

  // ====================================================
  // PUBLIC ROUTES
  // ====================================================

  {
    path: '',
    component: Home,
    pathMatch: 'full'
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

  {
    path: '',
    component: StudentLayout,
    canActivate: [authGuard],

    children: [

      {
        path: 'student-dashboard',
        component: StudentDashboard
      },

      // Project Understanding

      {
        path: 'project-understanding',
        component: StudentProjectUnderstanding
      },

      {
        path: 'project-understanding/:categoryId/topics',
        component: StudentProjectTopics
      },

      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections',
        component: StudentProjectSections
      },

      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections/:sectionId/content',
        component: StudentProjectSectionContent
      },

      // Profile

      {
        path: 'profile',
        component: Profile
      },

      // Study

      {
        path: 'study',
        component: Study
      },

      {
        path: 'study/:subjectId',
        component: Subject
      },

      {
        path: 'study/:subjectId/diagnostic',
        component: Diagnostic
      },

      {
        path: 'diagnostic-result/:subjectId',
        component: DiagnosticResult
      },

      {
        path: 'study/:subjectId/learning',
        component: StudentLearningSection
      },

      // Basic Challenge

      {
        path: 'basic-challenge/:subtopicId',
        component: BasicChallenge
      },

      // Student Advanced Learning
      // URL: /advanced-learning/:subtopicId

      {
        path: 'advanced-learning/:subtopicId',
        component: StudentAdvanced
      },

      // Study Progress

      {
        path: 'study-progress',
        component: StudentStudyProgress
      },

      {
        path: 'study-progress/subject/:subjectId',
        component: StudentSubjectProgress
      },

      // Student Mentors

      {
        path: 'mentors',
        component: StudentMentors
      },

      {
        path: 'mentors/:mentorId',
        component: StudentMentorProfile
      },

      {
        path: 'student-my-mentor',
        component: StudentMyMentor
      },

      {
        path: 'mentor-recommendations',
        component: StudentMentorRecommendations
      },

      {
        path: 'previous-mentors',
        component: StudentPreviousMentors
      }
    ]
  },

  // ====================================================
  // ADMIN DASHBOARD
  // ====================================================

  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard, adminRoleGuard]
  },

  // ====================================================
  // ADMIN ROUTES
  // ====================================================

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminRoleGuard],

    children: [

      // Education Management

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

      // Learning Management

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

      // Admin Advanced Learning Editor
      // URL: /admin/advanced/:subtopicId

      {
        path: 'advanced/:subtopicId',
        component: AdminAdvanced
      },

      // Admin Basic Challenge Question Bank

      {
        path: 'basic-challenge/:subtopicId',
        component: QuestionBank
      },

      // Admin Project Understanding

      {
        path: 'project-understanding',
        component: ProjectUnderstanding
      },

      {
        path: 'project-understanding/:categoryId/topics',
        component: ProjectTopics
      },

      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections',
        component: ProjectSections
      },

      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections/:sectionId/content',
        component: ProjectSectionContent
      },

      // Mentor Verification

      {
        path: 'mentor-verification',
        component: MentorVerification
      }
    ]
  },

  // ====================================================
  // MENTOR ROUTES
  // ====================================================

  {
    path: '',
    component: MentorLayout,
    canActivate: [authGuard, mentorRoleGuard],

    children: [

      {
        path: 'mentor-dashboard',
        component: MentorDashboard
      },

      {
        path: 'mentor-profile',
        component: MentorProfile
      },

      {
        path: 'mentor-requests',
        component: MentorRequests
      },

      {
        path: 'mentor-student-profile/:studentId',
        component: MentorStudentProfile
      }
    ]
  },

  // ====================================================
  // FALLBACK
  // ====================================================

  {
    path: '**',
    redirectTo: ''
  }
];
