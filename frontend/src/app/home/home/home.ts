import { Component } from '@angular/core';

import { Navbar } from '../components/navbar/navbar';
import { Hero } from '../components/hero/hero';
import { PlatformOverview } from '../components/platform-overview/platform-overview';
import { StudyPreview } from '../components/study-preview/study-preview';


@Component({
  selector: 'app-home',
  imports: [Navbar, Hero, PlatformOverview, StudyPreview
],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}