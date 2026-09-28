// Provides the common layout for mentor pages

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../components/navbar/navbar';

@Component({
  selector: 'app-mentor-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar
  ],
  templateUrl: './mentor-layout.html',
  styleUrl: './mentor-layout.css'
})
export class MentorLayout {

}