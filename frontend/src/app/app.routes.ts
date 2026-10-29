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

//Skillswap
import { SkillSwapHome } from './features/student/skillswap/skill-swap-home/skill-swap-home';
import { MySkills } from './features/student/skillswap/skills/my-skills/my-skills';
import { SuggestSkill } from './features/student/skillswap/suggest-skill/suggest-skill';
import { MySuggestions } from './features/student/skillswap/my-suggestions/my-suggestions';
import { DiscoverStudents } from './features/student/skillswap/discover-students/discover-students';
import { MyRequests } from './features/student/skillswap/my-requests/my-requests';
import { MySessions } from './features/student/skillswap/my-sessions/my-sessions';

// Student profile
import { Profile } from './features/student/profile/profile/profile';

// Student cheatsheet
import { StudentCheatsheetComponent } from './features/student/cheatsheet/student-cheatsheet/student-cheatsheet';
import { TechnologyDetailComponent } from './features/student/cheatsheet/technology-detail/technology-detail';
import { TopicListComponent } from './features/student/cheatsheet/topic-list/topic-list';
import { SubtopicDetailComponent } from './features/student/cheatsheet/subtopic-detail/subtopic-detail';

// Student study
import { Study } from './features/student/study/study/study';
import { Subject } from './features/student/study/subject-learning/subject-learning';

import { Diagnostic } from './features/student/study/diagnostic/diagnostic';
import { DiagnosticResult } from './features/student/study/diagnostic-result/diagnostic-result';
import { StudentLearningSection } from './features/student/study/student-learning/student-learning-section/student-learning-section';

// Student challenges and progress
import { BasicChallenge } from './features/student/challenges/basic-challenge/basic-challenge';
import { StudentStudyProgress } from './features/student/progress/student-study-progress/student-study-progress';
import { StudentSubjectProgress } from './features/student/progress/student-subject-progress/student-subject-progress';

// STUDENTS ADVANCED STUDY MATERIALS
import { AdvancedDashboard } from './features/student/advanced/advanced-dashboard/advanced-dashboard';
import { AdvancedLearningContent } from './features/student/advanced/advanced-learning-content/advanced-learning-content';

// STUDENT THEORY QUIZZES
import { QuizList as StudentTheoryQuizList } from './features/student/advanced/theory-quizzes/quiz-list/quiz-list';
import { QuizDetails } from './features/student/advanced/theory-quizzes/quiz-details/quiz-details';
import { QuizAttempt } from './features/student/advanced/theory-quizzes/quiz-attempt/quiz-attempt';
import { QuizResult } from './features/student/advanced/theory-quizzes/quiz-result/quiz-result';

//STUDENT CONCEPT COMPARISON
import { ConceptComparisonDetails } from './features/student/advanced/concept-comparison/concept-comparison-detail/concept-comparison-detail';
import { ConceptComparisonList } from './features/student/advanced/concept-comparison/concept-comparison-list/concept-comparison-list';

//STUDENT CODE SHUFFLE
import { StudentCodeShuffleList } from './features/student/advanced/code-shuffle/code-shuffle-list/code-shuffle-list';
import { StudentCodeShuffleTask } from './features/student/advanced/code-shuffle/code-shuffle-task/code-shuffle-task';
import { CodeShuffleProgress } from './features/student/advanced/code-shuffle/code-shuffle-progress/code-shuffle-progress';

// Student mentors
import { StudentMentors } from './features/student/mentors/student-mentors/student-mentors';
import { StudentMentorProfile } from './features/student/mentors/student-mentor-profile/student-mentor-profile';
import { StudentMyMentor } from './features/student/mentors/student-my-mentor/student-my-mentor';
import { StudentMentorRecommendations } from './features/student/mentors/student-mentor-recommendations/student-mentor-recommendations';
import { StudentPreviousMentors } from './features/student/mentors/student-previous-mentors/student-previous-mentors';

// Student mentors chat
import { StudentChatComponent } from './features/chat/student-chat/student-chat';

// Student recommendations and learning resources
import { ResourcesComponent } from './features/student/recommendation/resources/resources';
import { RecommendationComponent } from './features/student/recommendation/recommendation';
import { CodingComponent } from './features/student/recommendation/coding/coding';
import { CodingBookmarks } from './features/student/recommendation/coding/components/coding-bookmarks/coding-bookmarks';

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

//STUDENT CODE-LOGIC
import { StudentCodeToLogicTaskListComponent } from '././features/student/advanced/code-logic/task-list/task-list';
import { StudentCodeToLogicTaskDetailsComponent } from './features/student/advanced/code-logic/task-details/task-details';
import { StudentCodeToLogicSubmissionsComponent } from './features/student/advanced/code-logic/submissions/submissions';

// Admin dashboard
import { AdminDashboard } from './dashboards/admin/admin-dashboard/admin-dashboard';
import { AdminLayout } from './dashboards/admin/admin-layout/admin-layout';

//Admin SKILLSWAP
import { ManageSkills } from './features/admin/skillswap/manage-skills/manage-skills';
import { SkillSuggestions } from './features/admin/skillswap/skill-suggestions/skill-suggestions';

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

//Admin accepts student recommendations
import { AdminResourcesComponent } from './features/admin/recommendation/resources/resources';

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
// Admin Cheat Sheet
import { AdminCheatsheetComponent } from './features/admin/cheatsheet/admin-cheatsheet/admin-cheatsheet';

// Mentor dashboard
import { MentorLayout } from './dashboards/mentor/mentor-layout/mentor-layout';
import { MentorDashboard } from './dashboards/mentor/mentor-dashboard/mentor-dashboard';

// Mentor Cheatsheet
import { MentorCheatsheetComponent } from './features/mentor/cheatsheet/mentor-cheatsheet/mentor-cheatsheet';

// Mentor features
import { MentorProfile } from './features/mentor/profile/mentor-profile/mentor-profile';
import { MentorRequests } from './features/mentor/requests/mentor-requests/mentor-requests';
import { MentorStudentProfile } from './features/mentor/students/mentor-student-profile/mentor-student-profile';
import { MentorInboxComponent } from './features/chat/mentor-inbox/mentor-inbox';
import { MentorChatComponent } from './features/chat/mentor-chat/mentor-chat';

//ADVANCED QUIZ
import { CsvUpload } from './features/mentor/advanced/advanced-theory-quiz/csv-upload/csv-upload';
import { QuizList } from './features/mentor/advanced/quiz-list/quiz-list';
import { TheoryQuizView } from './features/mentor/advanced/theory-quiz-view/theory-quiz-view';
import { TheoryQuizEdit } from './features/mentor/advanced/theory-quiz-edit/theory-quiz-edit';

//MENTOR COMPARISON
import { ConceptComparisonManagement } from './features/mentor/advanced/concept-comparison/concept-comparison-management/concept-comparison-management';
import { MyComparisons } from './features/mentor/advanced/concept-comparison/my-comparisons/my-comparisons'
import {ComparisonDetailsComponent} from './features/mentor/advanced/concept-comparison/comparison-details/comparison-details'

//SHUFFLE CODE
import { CodeShuffleCreate } from './features/mentor/advanced/code-shuffle/code-shuffle-create/code-shuffle-create';
import { CodeShuffleTopics } from './features/mentor/advanced/code-shuffle/code-shuffle-topics/code-shuffle-topics';
import { CodeShuffleList } from './features/mentor/advanced/code-shuffle/code-shuffle-list/code-shuffle-list';
import { CodeShuffleEdit } from './features/mentor/advanced/code-shuffle/code-shuffle-list/code-shuffle-edit/code-shuffle-edit';
import { CodeShuffleDetails } from './features/mentor/advanced/code-shuffle/code-shuffle-list/code-shuffle-details/code-shuffle-details';

// MENTOR CODE TO LOGIC
import { TaskListComponent } from './features/mentor/advanced/code-to-logic/task-list/task-list';
import { CreateTaskComponent } from './features/mentor/advanced/code-to-logic/create-task/create-task';
import { TaskSubmissionsComponent } from './features/mentor/advanced/code-to-logic/task-submissions/task-submissions';
import { TaskDetailsComponent } from './features/mentor/advanced/code-to-logic/task-details/task-details';
import { TaskEditComponent } from './features/mentor/advanced/code-to-logic/task-edit/task-edit';

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

            //SKILLSWAP
      {
         path: 'skill-swap',
        component: SkillSwapHome
      },
      {
         path: 'my-skills',
         component: MySkills
      },

      {
         path: 'suggest-skill',
         component: SuggestSkill
      },

      {
        path: 'my-suggestions',
        component: MySuggestions
      },

      {
        path: 'discover-students',
        component: DiscoverStudents
      },

      {
         path: 'my-requests',
        component: MyRequests
      },

      {
        path: 'swap-sessions',
        component: MySessions
      },

     // Student recommendations and learning resources
      {
        path: 'student-recommendation',
        component: RecommendationComponent
      },
      {
        path: 'student/recommendation/coding',
        component: CodingComponent
      },
      {
        path: 'student/recommendation/coding-bookmarks',
        component: CodingBookmarks
      },
      {
        path: 'learning-resources',
        component: ResourcesComponent
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
      
      // ADVANCED learning dashboard
      {
        path: 'advanced-learning',
        component: AdvancedDashboard
      },

      //CONCEPT COMPARISON 

      {
        path: 'advanced-learning/concept-comparisons/:id',
        component: ConceptComparisonDetails,
      },
      {
        path: 'advanced-learning/concept-comparisons',
        component: ConceptComparisonList,
      },
      // Other advanced learning sections

      {
        path: 'advanced-learning/:sectionId',
        component: AdvancedLearningContent
      },

      // STUDENT THEORY QUIZZES
      {
        path: 'theory-quizzes',
        component: StudentTheoryQuizList
      },
      {
        path: 'theory-quizzes/:id/attempt',
        component: QuizAttempt
      },
      {
        path: 'theory-quizzes/:id/result',
        component: QuizResult
      },
      {
        path: 'theory-quizzes/:id',
        component: QuizDetails
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
      },
      
      {
        path: 'student-chat',
        component: StudentChatComponent
      },
        //STUDENT CHEATSHEET
      {
        path: 'student-cheatsheet',
        component: StudentCheatsheetComponent
      },

      {
        path: 'cheatsheet/technology/:id',
        component: TechnologyDetailComponent
      },

      {
        path: 'cheatsheet/technology/:technologyId/category/:categoryId',
        component: TopicListComponent
      },

      {
        path: 'cheatsheet/technology/:technologyId/category/:categoryId/topic/:topicId',
        component: SubtopicDetailComponent
      },

      // STUDENT CODE SHUFFLE
      {
        path: 'code-shuffle',
        component: StudentCodeShuffleList
      },

      {
        path: 'code-shuffle/tasks/:id',
        component: StudentCodeShuffleTask
      },
      {
        path: 'code-shuffle/progress',
        component: CodeShuffleProgress
      },
      {
        path: 'code-shuffle/progress/:id',
        component: CodeShuffleProgress,
      },

      //STUDENT CODE-LOGIC
      {
        path: 'student/advanced/code-to-logic/tasks',
        component: StudentCodeToLogicTaskListComponent  
      },
      {
        path: 'student/advanced/code-to-logic/tasks/:taskId',
        component: StudentCodeToLogicTaskDetailsComponent
      },
      {
        path: 'student/advanced/code-to-logic/submissions',
        component: StudentCodeToLogicSubmissionsComponent
      }
     

    ]
  },

      // Admin dashboard
      {
        path: 'admin-dashboard',
        component: AdminDashboard,
        canActivate: [authGuard, adminRoleGuard]
      },

      //Admin routes
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
        path: 'advanced/:sectionId',
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
      },
      // Admin resource management
      {
        path: 'resources',
        component: AdminResourcesComponent
      },
      // Admin Cheat Sheet management
      {
        path: 'cheatsheet',
      component: AdminCheatsheetComponent
      },

      
      // Admin Skill Swap
      {
        path: 'skillswap/manage-skills',
        component: ManageSkills
      },
     
      {
        path: 'skillswap/skill-suggestions',
        component: SkillSuggestions 
      },


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
        path: 'mentor-cheatsheet',
        component: MentorCheatsheetComponent
      },
      {
        path: 'mentor-requests',
        component: MentorRequests
      },
      {
        path: 'mentor-student-profile/:studentId',
        component: MentorStudentProfile
      },
      
      {
        path: 'mentor-chat',
        component: MentorInboxComponent
      },

      {
        path: 'mentor/chat/:conversationId',
        component: MentorChatComponent
      },
            
      // ADVANCED QUIZ
      {
        path: 'mentor/advanced/theory-quizzes/csv-upload',
        component: CsvUpload
      },
      {
        path: 'mentor/advanced/theory-quizzes',
        component: QuizList
      },
      {
        path: 'mentor/advanced/theory-quizzes/:quizId/view',
        component: TheoryQuizView
      },
      {
        path: 'mentor/advanced/theory-quizzes/:quizId/edit',
        component: TheoryQuizEdit
      },
      {
        path: 'mentor/advanced/concept-comparison',
        component: ConceptComparisonManagement
      },
      {
       path: 'mentor/advanced/my-comparisons',
        component: MyComparisons
      },
      {
        path: 'mentor/advanced/my-comparisons/:id',
        component: ComparisonDetailsComponent
      },
      {
        path: 'mentor/advanced/code-shuffle/create',
        component: CodeShuffleCreate,
      },
      {
        path: 'mentor/advanced/code-shuffle/topics',
        component: CodeShuffleTopics,
      },
      {
        path: 'mentor/advanced/code-shuffle/my-tasks',
        component: CodeShuffleList
      },
      {
        path: 'mentor/advanced/code-shuffle/tasks/:id/edit',
        component: CodeShuffleEdit,
      },
      {
        path: 'mentor/advanced/code-shuffle/tasks/:id',
        component: CodeShuffleDetails,
      },
        // MENTOR CODE TO LOGIC
      {
        path: 'mentor/advanced/code-to-logic',
        redirectTo: 'mentor/advanced/code-to-logic/tasks',
        pathMatch: 'full'
      },
      {
        path: 'mentor/advanced/code-to-logic/tasks',
        component: TaskListComponent
      },
      {
        path: 'mentor/advanced/code-to-logic/create',
        component: CreateTaskComponent
      },
      {
        path: 'mentor/advanced/code-to-logic/tasks/:taskId/view',
        component: TaskDetailsComponent
      },
      {
        path: 'mentor/advanced/code-to-logic/tasks/:taskId/edit',
        component: TaskEditComponent
      },
      {
        path: 'mentor/advanced/code-to-logic/tasks/:taskId/submissions',
        component: TaskSubmissionsComponent
      }

    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: ''
  }
];