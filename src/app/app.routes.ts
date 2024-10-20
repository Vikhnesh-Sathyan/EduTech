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
import { CurriculumComponent } from './curriculum/curriculum.component';
import { ResourcesComponent } from './resources/resources.component';
import { ProfileComponent } from './profile/profile.component';
import { MusicComponent } from './music/music.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { MusiccourseComponent } from './musiccourse/musiccourse.component';
import { StudentlistComponent } from './studentlist/studentlist.component';
import { CoursedetailComponent } from './coursedetail/coursedetail.component';
import { CourseexamComponent } from './courseexam/courseexam.component';
import { CertificateComponent } from './certificate/certificate.component';
import { Task2Component } from './task2/task2.component';
import { Task3Component } from './task3/task3.component';
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
  {path:'studentgenerated',component:StudentgeneratedComponent},
  { path: 'student-login/curriculum', component: CurriculumComponent },
  {path:  'student-login/music',component:MusicComponent},
  {path:'notifications',component:NotificationsComponent},
  {path:'tips',component:TipsComponent},
  {path:'musiccourse',component:MusiccourseComponent},
  {path:'coursedetail',component:CoursedetailComponent},
  {path:'courseexam',component:CourseexamComponent},
  {path:'task2',component:Task2Component},
  {path:'task3',component:Task3Component},
  {path:'certificate',component:CertificateComponent},
  {path:'forgot-password',component:ForgotPasswordComponent},
  {path:'reset-password',component:ResetPasswordComponent},
  { path: 'teacher-login', component: TeacherLoginComponent },
  { path: 'teacher-login/t-dashboard', component: TDashboardComponent },
  {path:'studentlist',component:StudentlistComponent},
  {path:'study-tips',component:StudyTipsComponent},
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
