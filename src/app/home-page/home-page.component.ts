import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { FrontNavComponent } from './front-nav/front-nav.component';
import { FeaturesComponent } from './features/features.component';
import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { AdvertisementComponent } from './advertisement/advertisement.component';
import { ServicesComponent } from './services/services.component';
import { TeamComponent } from './team/team.component';
import { CtaComponent } from './cta/cta.component';
import { CurriculumComponent } from '../curriculum/curriculum.component';
import { ClientsComponent } from './clients/clients.component';
import { FooterComponent } from './footer/footer.component';
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FrontNavComponent,HeroComponent,FeaturesComponent,AboutComponent,ContactUsComponent,TestimonialsComponent,AdvertisementComponent,ServicesComponent
    ,TeamComponent,CtaComponent,CurriculumComponent,ClientsComponent,FooterComponent],
  
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
