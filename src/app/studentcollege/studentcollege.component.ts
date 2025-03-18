import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-studentcollege',
  standalone: true,
  imports: [],
  templateUrl: './studentcollege.component.html',
  styleUrl: './studentcollege.component.css'
})
export class StudentcollegeComponent {
  constructor(private router: Router) {}

  navigateToWizard(): void {
    this.router.navigate(['/resume-wizard']);
  }
  navigateTocoverletter(): void {
    this.router.navigate(['coverletter']);
}
navigateToTemplates(): void {
  this.router.navigate(['dynamic-templates']);
}
navigateToaptitude(): void {
  this.router.navigate(['aptitude-questions']);
}
navigateToView(): void {
  this.router.navigate(['view-insights']);
}
navigateTointerview(): void {
  this.router.navigate(['Interview']);
}
navigateTostudentjob(): void {
  this.router.navigate(['studentjob']);
}
navigateToalerts(): void {
  this.router.navigate(['alerts']);
}
navigateToengpractise(): void {
  this.router.navigate(['eng-practise']);
}
navigateTocompetition():void{
  this.router.navigate(['competition']);
}
navigateToshortlist():void{
  this.router.navigate(['short-list']);
}
navigateToquiz():void{
  this.router.navigate(['quiz-student']);
}
navigateTocode():void{
  this.router.navigate(['code-explaination']);
}
navigateTosummarize():void{
  this.router.navigate(['summarize']);
}
}
