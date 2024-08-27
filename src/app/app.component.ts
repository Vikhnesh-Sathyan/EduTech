import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FrontNavComponent } from './front-nav/front-nav.component';  // Import FrontNavComponent
import { StudentLoginComponent } from "./student-login/student-login.component";
import { TeacherLoginComponent } from './teacher-login/teacher-login.component';
import { ParentLoginComponent } from './parent-login/parent-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TDashboardComponent } from './t-dashboard/t-dashboard.component';
import { PDashboardComponent } from "./p-dashboard/p-dashboard.component";
import { HeroComponent } from "./hero/hero.component";
import { FeaturesComponent } from "./features/features.component";
import { AboutComponent } from "./about/about.component";
import { TestimonialsComponent } from "./testimonials/testimonials.component";
import { AdvertisementComponent } from "./advertisement/advertisement.component";
import { ServicesComponent } from "./services/services.component";
import { TeamComponent } from "./team/team.component";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { CtaComponent } from "./cta/cta.component";
import { FooterComponent } from "./footer/footer.component";
import { PersonalInfoComponent } from "./personal-info/personal-info.component";
import { CurriculumComponent } from "./curriculum/curriculum.component";
import { ClientsComponent } from './clients/clients.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FrontNavComponent, TeacherLoginComponent, ParentLoginComponent, StudentLoginComponent, DashboardComponent, TDashboardComponent, PDashboardComponent, HeroComponent, FeaturesComponent, AboutComponent, TestimonialsComponent, AdvertisementComponent, ServicesComponent, TeamComponent, ContactUsComponent, CtaComponent, FooterComponent, PersonalInfoComponent, CurriculumComponent, ClientsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'edutech';
  
}
