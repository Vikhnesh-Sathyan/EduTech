
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MyTeachingSkills } from '../my-teaching-skills/my-teaching-skills';
import { MyLearningSkills } from '../../my-learning-skills/my-learning-skills';

@Component({
  selector: 'app-my-skills',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MyTeachingSkills,
    MyLearningSkills
  ],
  templateUrl: './my-skills.html',
  styleUrl: './my-skills.css'
})
export class MySkills {}
