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

export const routes: Routes = [
  {path:'',component:HomePageComponent},
  {path:'student-login',component:StudentLoginComponent},
  {path:'student-login/dashboard',component:DashboardComponent},
  {path:'student-login/extracurriculm',component:CurriculumComponent},
  {path:'teacher-login',component:TeacherLoginComponent},
  {path:'teacher-login/t-dashboard',component:TDashboardComponent},
  {path:'parent-login',component:ParentLoginComponent},
  {path:'parent-login/p-dashboard',component:PDashboardComponent} ,
  { path: 'personal', component: PersonalComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
