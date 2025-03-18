import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { StudentLoginComponent } from './student-login/student-login.component';
import { PersonalComponent } from './personal/personal.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeacherLoginComponent } from './teacher-login/teacher-login.component';
import { TDashboardComponent } from './t-dashboard/t-dashboard.component';
import { ParentLoginComponent } from './parent-login/parent-login.component';
import { PDashboardComponent } from './p-dashboard/p-dashboard.component';
import { ResourcesComponent } from './resources/resources.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { StudentlistComponent } from './studentlist/studentlist.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { StudentgeneratedComponent } from './studentgenerated/studentgenerated.component';
import { StudytoolsComponent } from './studytools/studytools.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { FlashcardListComponent } from './flashcard-list/flashcard-list.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { Grade9DashboardComponent } from './grade-9-dashboard/grade-9-dashboard.component';
import { Grade10DashboardComponent } from './grade-10-dashboard/grade-10-dashboard.component';
import { Grade11DashboardComponent } from './grade-11-dashboard/grade-11-dashboard.component';
import { Grade12DashboardComponent } from './grade-12-dashboard/grade-12-dashboard.component';
import { StudyTipsComponent } from './study-tips/study-tips.component';
import { TipsComponent } from './tips/tips.component';
import { MessagesComponent } from './messages/messages.component';
import { StudentMessagesComponent } from './student-messages/student-messages.component';
import { GenerateQuestionComponent } from './generate-question/generate-question.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { CodingComponent } from './coding/coding.component';
import { StudentSubmissionComponent } from './student-submission/student-submission.component';
import { TeacherReviewComponent } from './teacher-review/teacher-review.component';
import { AdminComponent } from './admin/admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { TeacherRegisterComponent } from './teacher-register/teacher-register.component';
import { TeacherAddComponent } from './teacher-add/teacher-add.component';
import { PendingTeacherComponent } from './pending-teacher/pending-teacher.component';
import { CollegeComponent } from './college/college.component';
import { LoginComponent } from './login/login.component';
import { AddstplaComponent } from './addstpla/addstpla.component';
import { StudentcollegeComponent } from './studentcollege/studentcollege.component';
import { PlacementComponent } from './placement/placement.component';
import { ResumeWizardComponent } from './resume-wizard/resume-wizard.component';
import { CoverLetterComponent } from './cover-letter/cover-letter.component';
import { ShareTemplatesComponent } from './share-templates/share-templates.component';
import { CompanyTestComponent } from './company-test/company-test.component';
import { AptitudeQuestionsComponent } from './aptitude-questions/aptitude-questions.component';
import { UploadInsightsComponent } from './upload-insights/upload-insights.component';
import { ViewInsightsComponent } from './view-insights/view-insights.component';
import { MockInterviewComponent } from './mock-interview/mock-interview.component';
import { IntervalTimeline } from 'tone';
import { InterviewComponent } from './interview/interview.component';
import { ProblemComponent } from './problem/problem.component';
import { AdminjobComponent } from './adminjob/adminjob.component';
import { StudentjobComponent } from './studentjob/studentjob.component';
import { PlacementalertComponent } from './placementalert/placementalert.component';
import { AlertsComponent } from './alerts/alerts.component';
import { CompetitionComponent } from './competition/competition.component';
import { PlacementTeamComponent } from './placement-team/placement-team.component';
import { PlacementteamDashboardComponent } from './placementteam-dashboard/placementteam-dashboard.component';
import { EngPractiseComponent } from './eng-practise/eng-practise.component';
import { ShortListComponent } from './short-list/short-list.component';
import { ShortlistedOfficerComponent } from './shortlisted-officer/shortlisted-officer.component';
import { QuizComponent } from './quiz/quiz.component';
import { QuizStudentComponent } from './quiz-student/quiz-student.component';
import { SummarizeComponent } from './summarize/summarize.component';
import { PdfSummarizeComponent } from './pdf-summarize/pdf-summarize.component';
import { YoutubeSummarizeComponent } from './youtube-summarize/youtube-summarize.component';
import { CodeExplainationComponent } from './code-explaination/code-explaination.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  {path:'college',component:CollegeComponent},
  {path:'login',component:LoginComponent},
  {path:'admin',component:AdminComponent},
  {path:'admin-dashboard',component:AdminDashboardComponent},
  {path:'placement-team',component:PlacementTeamComponent},
  {path:'placementteam-dashboard',component:PlacementteamDashboardComponent},
  {path:'adminjob',component:AdminjobComponent},
  {path:'teacher-add',component:TeacherAddComponent},
  {path:'pending-teacher',component:PendingTeacherComponent},
  {path:'addstpla',component:AddstplaComponent},
  {path:'studentcollege',component:StudentcollegeComponent},
  {path:'placement',component:PlacementComponent},
  {path:'coverletter',component:CoverLetterComponent},
  {path:'resume-wizard',component:ResumeWizardComponent},
  {path:'share-templates',component:ShareTemplatesComponent},
  {path:'company-test',component:CompanyTestComponent},
  {path:'aptitude-questions',component:AptitudeQuestionsComponent},
  {path:'upload-insights',component:UploadInsightsComponent},
  {path:'view-insights',component:ViewInsightsComponent},
  {path:'mockInterview',component:MockInterviewComponent},
  {path:'Interview',component:InterviewComponent},
  {path:'problems',component:ProblemComponent},
  {path:'placementalert',component:PlacementalertComponent},
  {path:'studentjob',component:StudentjobComponent},
  {path:'alerts',component:AlertsComponent},
  {path:'competition',component:CompetitionComponent},
  {path:'eng-practise',component:EngPractiseComponent},
  {path:'short-list',component:ShortListComponent},
  {path:'shortlisted-officer',component:ShortlistedOfficerComponent},
  {path:'quiz',component:QuizComponent},
  {path:'quiz-student',component:QuizStudentComponent},
  {path:'summarize',component:SummarizeComponent},
  { path: 'pdf-summarize', component: PdfSummarizeComponent },
  { path: 'youtube-summarize', component: YoutubeSummarizeComponent }, // New route for YouTube summarizer
  {path:'code-explaination',component:CodeExplainationComponent},
    { path: 'student-login', component: StudentLoginComponent },
  { path: 'student-login/dashboard', component: DashboardComponent },
  { path: 'student-login/dashboard/grade-10', component: Grade10DashboardComponent },
  { path: 'student-login/dashboard/grade-11', component: Grade11DashboardComponent },
  { path: 'student-login/dashboard/grade-12', component: Grade12DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'personal', component: PersonalComponent },
  {path:'student-messages',component:StudentMessagesComponent},
  {path:'flashcard',component:FlashcardComponent},
  {path:'flashcard-list',component:FlashcardListComponent},
  {path:'todo-list',component:TodoListComponent},
  {path:'studentgenerated',component:StudentgeneratedComponent},
  {path:'code-editor',component:CodeEditorComponent},
  {path:'notifications',component:NotificationsComponent},
  {path:'tips',component:TipsComponent},
  {path:'forgot-password',component:ForgotPasswordComponent},
  {path:'reset-password',component:ResetPasswordComponent},
  { path: 'teacher-login', component: TeacherLoginComponent },
  {path:'teacher-register',component:TeacherRegisterComponent},
  {path:'pending-teacher',component:PendingTeacherComponent},
  { path: 'teacher-login/t-dashboard', component: TDashboardComponent },
  {path:'studentlist',component:StudentlistComponent},
  {path:'study-tips',component:StudyTipsComponent},
  { path: 'generate-question', component: GenerateQuestionComponent },
  {path:'Coding',component:CodingComponent},
  {path:'student-submission',component:StudentSubmissionComponent},
  {path:'teacher-review',component:TeacherReviewComponent},
  {path:'messages',component:MessagesComponent},
  { path: 'resources', component: ResourcesComponent }, // Ensure ResourcesComponent handles child routes if needed
  { path: 'parent-login', component: ParentLoginComponent },
  { path: 'parent-login/p-dashboard', component: PDashboardComponent },
  {path:'studytools',component:StudytoolsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
