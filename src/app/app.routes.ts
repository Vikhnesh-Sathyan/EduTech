import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeroComponent } from './hero/hero.component';
import { StudentLoginComponent } from './student-login/student-login.component';
import { TeacherLoginComponent } from './teacher-login/teacher-login.component';
import { ParentLoginComponent } from './parent-login/parent-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PDashboardComponent } from './p-dashboard/p-dashboard.component';
import { FeaturesComponent } from './features/features.component';

export const routes: Routes = [
  { path: '', redirectTo: '/student-login', pathMatch: 'full' },  // Default route to student login
  { path: 'student-login', component: StudentLoginComponent },
  { path: 'teacher-login', component: TeacherLoginComponent },
  { path: 'parent-login', component: ParentLoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'p-dashboard', component: PDashboardComponent },
  { path: 'features', component: FeaturesComponent },
  { path: '**', redirectTo: '' }  // Wildcard route to handle undefined paths
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
