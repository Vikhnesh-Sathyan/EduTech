import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-subject',
  imports: [],
  templateUrl: './subject.html',
  styleUrl: './subject.css'
})
export class Subject {

  subjectId = '';

  constructor(private route: ActivatedRoute) {

    this.subjectId =
      this.route.snapshot.paramMap.get('subjectId') || '';

  }

}