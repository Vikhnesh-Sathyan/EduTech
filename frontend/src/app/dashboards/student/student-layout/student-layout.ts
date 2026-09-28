// Provides the common layout for student pages

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../components/navbar/navbar';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar
  ],
  templateUrl: './student-layout.html',
  styleUrl: './student-layout.css'
})
export class StudentLayout {

}