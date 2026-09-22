import { Component } from '@angular/core';

import { Navbar } from '../components/navbar/navbar';
import { Hero } from '../components/hero/hero';
import { PlatformOverview } from '../components/platform-overview/platform-overview';
import { StudyPreview } from '../components/study-preview/study-preview';
import { CareerPreview } from '../components/career-preview/career-preview';
import { SkillGapPreview } from '../components/skill-gap-preview/skill-gap-preview';
import { MentorPreview } from '../components/mentor-preview/mentor-preview';
import { HowItWorks } from '../components/how-it-works/how-it-works';
import { FinalCta } from '../components/final-cta/final-cta';
import { Footer } from '../components/footer/footer';

@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, PlatformOverview, StudyPreview, CareerPreview, SkillGapPreview, MentorPreview, HowItWorks, FinalCta, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}