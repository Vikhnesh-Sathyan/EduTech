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
import { ResourcelinkComponent } from './resourcelink/resourcelink.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { StudentgeneratedComponent } from './studentgenerated/studentgenerated.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'student-login', component: StudentLoginComponent },
  { path: 'personal', component: PersonalComponent },
  { path: 'student-login/dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  {path:'resourcelink',component:ResourcelinkComponent},
  {path:'user-profile',component:UserProfileComponent},
  {path:'studentgenerated',component:StudentgeneratedComponent},
  { path: 'student-login/curriculum', component: CurriculumComponent },
  {path:  'student-login/music',component:MusicComponent},
  {path:'notifications',component:NotificationsComponent},
  {path:'musiccourse',component:MusiccourseComponent},
  {path:'coursedetail',component:CoursedetailComponent},
  {path:'courseexam',component:CourseexamComponent},
  {path:'task2',component:Task2Component},
  {path:'task3',component:Task3Component},
  {path:'certificate',component:CertificateComponent},
  { path: 'teacher-login', component: TeacherLoginComponent },
  {path:'forgot-password',component:ForgotPasswordComponent},
  { path: 'teacher-login/t-dashboard', component: TDashboardComponent },
  { path: 'resources', component: ResourcesComponent }, // Ensure ResourcesComponent handles child routes if needed
  {path:'studentlist',component:StudentlistComponent},
  { path: 'parent-login', component: ParentLoginComponent },
  { path: 'parent-login/p-dashboard', component: PDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
