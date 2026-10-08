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

// ======================================================
// STUDENT - MENTOR Relationship
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

// ======================================================
// MENTOR - STUDENT Requests
// ======================================================

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
  // Project Understanding
  //
  // ====================================================

  {
    path: '',
    component: StudentLayout,

    canActivate: [
      authGuard
    ],

    children: [

      // --------------------------------------------------
      // Student Dashboard
      // --------------------------------------------------

      {
        path: 'student-dashboard',
        component: StudentDashboard
      },

      // ==================================================
      // STUDENT PROJECT UNDERSTANDING
      // ==================================================
      //
      // Student can:
      // - Explore categories
      // - Explore topics
      // - Explore sections
      // - Read learning content
      //
      // Base URL:
      // /project-understanding
      //
      // ==================================================

      {
        path: 'project-understanding',
        component: StudentProjectUnderstanding
      },

      // Student Project Topics
      // /project-understanding/:categoryId/topics

      {
        path: 'project-understanding/:categoryId/topics',
        component: StudentProjectTopics
      },

      // Student Project Sections
      // /project-understanding/:categoryId/topics/:topicId/sections

      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections',
        component: StudentProjectSections
      },

      // Student Project Section Content
      // /project-understanding/:categoryId/topics/:topicId/sections/:sectionId/content

      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections/:sectionId/content',
        component: StudentProjectSectionContent
      },

      // --------------------------------------------------
      // Student Profile
      // --------------------------------------------------

      {
        path: 'profile',
        component: Profile
      },

      // ==================================================
      // STUDY
      // ==================================================

      {
        path: 'study',
        component: Study
      },

      // --------------------------------------------------
      // Subject Learning
      // --------------------------------------------------

      {
        path: 'study/:subjectId',
        component: Subject
      },

      // --------------------------------------------------
      // Diagnostic
      // --------------------------------------------------

      {
        path: 'study/:subjectId/diagnostic',
        component: Diagnostic
      },

      // --------------------------------------------------
      // Diagnostic Result
      // --------------------------------------------------

      {
        path: 'diagnostic-result/:subjectId',
        component: DiagnosticResult
      },

      // --------------------------------------------------
      // Learning Section
      // --------------------------------------------------

      {
        path: 'study/:subjectId/learning',
        component: StudentLearningSection
      },
      

      // ==================================================
      // STUDENT MENTORS
      // ==================================================

      {
        path: 'mentors',
        component: StudentMentors
      },
      
      { 
        path: 'mentors/:mentorId',
        component: StudentMentorProfile 
      },

      { path: 'student-my-mentor', 
        component: StudentMyMentor
      },

      {
        path: 'mentor-recommendations',
        component: StudentMentorRecommendations
      },
      { 
        path: 'previous-mentors',
        component: StudentPreviousMentors
      },
      {
        path: 'study-progress',
        component: StudentStudyProgress,
        canActivate: [authGuard]
      },

      {
         path: 'study-progress/subject/:subjectId',
         component: StudentSubjectProgress,
        canActivate: [authGuard]
      },



    ]
  },

  // ====================================================
  // ADMIN DASHBOARD
  // ====================================================
  //
  // Main Admin Dashboard
  //
  // URL:
  // /admin-dashboard
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
  // ADMIN MANAGEMENT
  // ====================================================
  //
  // All Admin management pages use AdminLayout.
  //
  // Base URL:
  // /admin
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

      // ==================================================
      // EDUCATION MANAGEMENT
      // ==================================================

      // /admin/education-programs

      {
        path: 'education-programs',
        component: EducationPrograms
      },

      // /admin/departments

      {
        path: 'departments',
        component: Departments
      },

      // /admin/education-years

      {
        path: 'education-years',
        component: EducationYears
      },

      // /admin/subjects

      {
        path: 'subjects',
        component: Subjects
      },

      // ==================================================
      // LEARNING MANAGEMENT
      // ==================================================

      // /admin/topics

      {
        path: 'topics',
        component: Topics
      },

      // /admin/diagnostic-questions

      {
        path: 'diagnostic-questions',
        component: DiagnosticQuestions
      },

      // /admin/topic-learning/:topicId

      {
        path: 'topic-learning/:topicId',
        component: AdminTopicLearningPage
      },

      // /admin/topic-sections/:topicId

      {
        path: 'topic-sections/:topicId',
        component: AdminLearningSectionsPage
      },

      // /admin/section-learning/:sectionId

      {
        path: 'section-learning/:sectionId',
        component: AdminSectionLearningPage
      },

      // /admin/subtopics/:topicId

      {
        path: 'subtopics/:topicId',
        component: AdminSubtopicsPage
      },

      // /admin/subtopic-sections/:subtopicId

      {
        path: 'subtopic-sections/:subtopicId',
        component: AdminLearningSectionsPage
      },

      {
        path: 'advanced/:subtopicId',
        component: AdminAdvanced,
      },

      {
        path: 'basic-challenge/:subtopicId',
        component: QuestionBank
      },

      // ==================================================
      // ADMIN PROJECT UNDERSTANDING
      // ==================================================
      //
      // Admin can:
      // - Manage categories
      // - Manage topics
      // - Manage sections
      // - Manage section content
      //
      // Base URL:
      // /admin/project-understanding
      //
      // ==================================================

      // Admin Project Categories
      // /admin/project-understanding

      {
        path: 'project-understanding',
        component: ProjectUnderstanding
      },

      // Admin Project Topics
      // /admin/project-understanding/:categoryId/topics

      {
        path: 'project-understanding/:categoryId/topics',
        component: ProjectTopics
      },

      // Admin Project Sections
      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections',
        component: ProjectSections
      },

      // Admin Project Section Content
      {
        path: 'project-understanding/:categoryId/topics/:topicId/sections/:sectionId/content',
        component: ProjectSectionContent
      },

      // ==================================================
      // MENTOR MANAGEMENT
      // ==================================================

      // /admin/mentor-verification

      {
        path: 'mentor-verification',
        component: MentorVerification
      }

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

      // --------------------------------------------------
      // Mentor Dashboard
      // --------------------------------------------------

      {
        path: 'mentor-dashboard',
        component: MentorDashboard
      },

      // --------------------------------------------------
      // Mentor Profile
      // --------------------------------------------------

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
  }

];