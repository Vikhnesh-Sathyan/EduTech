import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { PersonalComponent } from "./personal/personal.component";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PersonalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'edutech';
  
}
