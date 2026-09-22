import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-study',
  imports: [RouterLink],
  templateUrl: './study.html',
  styleUrl: './study.css'
})
export class Study {

  // Temporary subject data for UI testing
  subjects = [
    {
      id: 1,
      name: 'JavaScript'
    },
    {
      id: 2,
      name: 'Python'
    },
    {
      id: 3,
      name: 'Java'
    }
  ];

}