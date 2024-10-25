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
import { MusicComponent } from './music/music.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { StudentlistComponent } from './studentlist/studentlist.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { StudentgeneratedComponent } from './studentgenerated/studentgenerated.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SkillListComponent } from './skill-list/skill-list.component';
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
import { VideoCallComponent } from './video-call/video-call.component';
import { GenerateQuestionComponent } from './generate-question/generate-question.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { CodingComponent } from './coding/coding.component';
import { StudentSubmissionComponent } from './student-submission/student-submission.component';
import { TeacherReviewComponent } from './teacher-review/teacher-review.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'student-login', component: StudentLoginComponent },
  { path: 'personal', component: PersonalComponent },
  { path: 'student-login/dashboard', component: DashboardComponent },
  { path: 'student-login/dashboard/grade-9', component: Grade9DashboardComponent },
  { path: 'student-login/dashboard/grade-10', component: Grade10DashboardComponent },
  { path: 'student-login/dashboard/grade-11', component: Grade11DashboardComponent },
  { path: 'student-login/dashboard/grade-12', component: Grade12DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  {path:'student-messages',component:StudentMessagesComponent},
  {path:'flashcard',component:FlashcardComponent},
  {path:'flashcard-list',component:FlashcardListComponent},
  {path:'todo-list',component:TodoListComponent},
  {path:'user-profile',component:UserProfileComponent},
  {path:'skill-list',component:SkillListComponent},
  {path:'video-call',component:VideoCallComponent},
  {path:'studentgenerated',component:StudentgeneratedComponent},
  // { path: 'student-login/curriculum', component: CurriculumComponent },
  {path:'code-editor',component:CodeEditorComponent},
  {path:  'student-login/music',component:MusicComponent},
  {path:'notifications',component:NotificationsComponent},
  {path:'tips',component:TipsComponent},
  {path:'forgot-password',component:ForgotPasswordComponent},
  {path:'reset-password',component:ResetPasswordComponent},
  { path: 'teacher-login', component: TeacherLoginComponent },
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
