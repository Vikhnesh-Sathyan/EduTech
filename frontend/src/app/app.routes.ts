import { Routes } from '@angular/router';

// Public pages
import { Home } from './home/home/home';

// Authentication
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';

// Route guards
import { authGuard } from './core/guards/auth.guard';
import { adminRoleGuard } from './core/guards/admin-role.guard';
import { mentorRoleGuard } from './core/guards/mentor-role.guard';

// Student dashboard
import { StudentLayout } from './dashboards/student/student-layout/student-layout';
import { StudentDashboard } from './dashboards/student/student-dashboard/student-dashboard';

// Student profile
import { Profile } from './features/student/profile/profile/profile';

// Student study
import { Study } from './features/student/study/study/study';
import { Subject } from './features/student/study/subject-learning/subject-learning';


import { Diagnostic } from './features/student/study/diagnostic/diagnostic';
import { DiagnosticResult } from './features/student/study/diagnostic-result/diagnostic-result';
import { StudentLearningSection } from './features/student/study/student-learning/student-learning-section/student-learning-section';

// Student challenges and progress
import { BasicChallenge } from './features/student/challenges/basic-challenge/basic-challenge';
import { StudentAdvanced } from './features/student/advanced-learning/student-advanced/student-advanced';
import { StudentStudyProgress } from './features/student/progress/student-study-progress/student-study-progress';
import { StudentSubjectProgress } from './features/student/progress/student-subject-progress/student-subject-progress';

// Student mentors
import { StudentMentors } from './features/student/mentors/student-mentors/student-mentors';
import { StudentMentorProfile } from './features/student/mentors/student-mentor-profile/student-mentor-profile';
import { StudentMyMentor } from './features/student/mentors/student-my-mentor/student-my-mentor';
import { StudentMentorRecommendations } from './features/student/mentors/student-mentor-recommendations/student-mentor-recommendations';
import { StudentPreviousMentors } from './features/student/mentors/student-previous-mentors/student-previous-mentors';

// Student project learning
import {
  ProjectUnderstanding as StudentProjectUnderstanding
} from './features/student/projects/project-understanding/project-understanding';

import {
  ProjectTopics as StudentProjectTopics
} from './features/student/projects/project-topics/project-topics';

import {
  ProjectSections as StudentProjectSections
} from './features/student/projects/project-sections/project-sections';

import {
  ProjectSectionContent as StudentProjectSectionContent
} from './features/student/projects/project-section-content/project-section-content';

// Admin dashboard
import { AdminDashboard } from './dashboards/admin/admin-dashboard/admin-dashboard';
import { AdminLayout } from './dashboards/admin/admin-layout/admin-layout';

// Admin education management
import { EducationPrograms } from './features/admin/education/education-programs/education-programs';
import { Departments } from './features/admin/education/departments/departments';
import { EducationYears } from './features/admin/education/education-years/education-years';
import { Subjects } from './features/admin/education/subjects/subjects';
import { Topics } from './features/admin/education/topics/topics';

// Admin learning content
import { DiagnosticQuestions } from './features/admin/challenges/diagnostic-questions/diagnostic-questions';
import { AdminTopicLearningPage } from './features/admin/learning-content/admin-topic-learning/admin-topic-learning';
import { AdminLearningSectionsPage } from './features/admin/learning-content/admin-learning-sections/admin-learning-sections';
import { AdminSectionLearningPage } from './features/admin/learning-content/admin-section-learning/admin-section-learning';
import { AdminSubtopicsPage } from './features/admin/learning-content/admin-subtopics/admin-subtopics';

// Admin advanced learning and question bank
import { AdminAdvanced } from './features/admin/advanced/admin-advanced/admin-advanced';
import { QuestionBank } from './features/admin/challenges/question-bank/question-bank';

// Admin project learning
import { ProjectUnderstanding } from './features/admin/projects/project-understanding/project-understanding';
import { ProjectTopics } from './features/admin/projects/project-topics/project-topics';
import { ProjectSections } from './features/admin/projects/project-sections/project-sections';
import { ProjectSectionContent } from './features/admin/projects/project-section-content/project-section-content';

// Admin mentor verification
import { MentorVerification } from './features/admin/mentors/mentor-verification/mentor-verification';

// Mentor dashboard
import { MentorLayout } from './dashboards/mentor/mentor-layout/mentor-layout';
import { MentorDashboard } from './dashboards/mentor/mentor-dashboard/mentor-dashboard';

// Mentor features
import { MentorProfile } from './features/mentor/profile/mentor-profile/mentor-profile';
import { MentorRequests } from './features/mentor/requests/mentor-requests/mentor-requests';
import { MentorStudentProfile } from './features/mentor/students/mentor-student-profile/mentor-student-profile';


export const routes: Routes = [

  // Public routes
  {
    path: '',
    component: Home,
    pathMatch: 'full'
  },

  // Authentication routes
  {
    path: 'register',
    component: Register
  },
  {
    path: 'login',
    component: Login
  },

  // Student routes
  {
    path: '',
    component: StudentLayout,
    canActivate: [authGuard],
    children: [

      {
        path: 'student-dashboard',
        component: StudentDashboard
      },

      // Student profile
      {
        path: 'profile',
        component: Profile
      },

      // Study and diagnostics
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

      // Challenges and advanced learning
      {
        path: 'basic-challenge/:subtopicId',
        component: BasicChallenge
      },
      {
        path: 'advanced-learning/:subtopicId',
        component: StudentAdvanced
      },

      // Study progress
      {
        path: 'study-progress',
        component: StudentStudyProgress
      },
      {
        path: 'study-progress/subject/:subjectId',
        component: StudentSubjectProgress
      },

      // Student project learning
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

      // Student mentors
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

  // Admin dashboard
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard, adminRoleGuard]
  },

  // Admin routes
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminRoleGuard],
    children: [

      // Education management
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
        path: 'topics',
        component: Topics
      },

      // Diagnostic questions and learning content
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

      // Advanced learning and question bank
      {
        path: 'advanced/:subtopicId',
        component: AdminAdvanced
      },
      {
        path: 'basic-challenge/:subtopicId',
        component: QuestionBank
      },

      // Admin project learning
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

      // Mentor verification
      {
        path: 'mentor-verification',
        component: MentorVerification
      }
    ]
  },

  // Mentor routes
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

  // Fallback route
  {
    path: '**',
    redirectTo: ''
  }
];