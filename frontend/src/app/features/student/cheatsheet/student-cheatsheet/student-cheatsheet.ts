
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentCheatsheetService, StudentCheatsheetTechnology } from '../../../../services/student/cheatsheet/student-cheatsheet.service';
@Component({
  selector: 'app-student-cheatsheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-cheatsheet.html',
  styleUrl: './student-cheatsheet.css'
})
export class StudentCheatsheetComponent implements OnInit {
  private cheatsheetService = inject(StudentCheatsheetService);
  private router = inject(Router);
  technologies = signal<StudentCheatsheetTechnology[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  ngOnInit(): void {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.cheatsheetService.getTechnologies().subscribe({
      next: (response) => {
        this.technologies.set(response.technologies);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load cheatsheet technologies:', error);
        this.errorMessage.set('Unable to load technologies. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getTechnologiesByLetter(letter: string): StudentCheatsheetTechnology[] {
    return this.technologies().filter(
      technology => technology.name.toUpperCase().startsWith(letter)
    );
  }

 selectTechnology(technology: StudentCheatsheetTechnology): void {
  this.router.navigate(
    ['/cheatsheet/technology', technology.id],
    {
      queryParams: { name: technology.name }
    }
  );
}

  scrollToLetter(letter: string): void {
    document.getElementById('letter-' + letter)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}
