import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { HttpClient } from '@angular/common/http';

interface Resource {
  title: string;
  link: string;
  description: string;
  category: string;
  classes: number[];
}

@Component({
  selector: 'app-resourcelink',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './resourcelink.component.html',
  styleUrls: ['./resourcelink.component.css']
})
export class ResourcelinkComponent {
  resources: Resource[] = [
    { title: 'Advanced JavaScript', link: 'https://www.codecademy.com/learn/introduction-to-javascript', description: 'Deep dive into JavaScript for advanced students.', category: 'tutorials', classes: [11, 12] },
    { title: 'Geometry Concepts', link: 'https://www.khanacademy.org/math/geometry', description: 'Fundamental concepts of geometry for all levels.', category: 'videos', classes: [8, 9, 10, 11, 12] },
    { title: 'Introduction to Chemistry', link: 'https://www.chemistry.com/tutorials', description: 'Basic chemistry concepts for high school students.', category: 'articles', classes: [10, 11, 12] },
    { title: 'Physics - Mechanics', link: 'https://www.example.com/physics', description: 'Basic concepts of mechanics in physics for class 12 students.', category: 'articles', classes: [12] },
    { title: 'Biology - Human Anatomy', link: 'https://www.example.com/biology', description: 'An overview of human anatomy for class 11 and 12 students.', category: 'videos', classes: [11, 12] },
    { title: 'History of World Wars', link: 'https://www.example.com/history', description: 'A detailed look at the events leading up to World War I and II.', category: 'articles', classes: [8, 9] },
    { title: 'Algebra - Polynomial Functions', link: 'https://www.example.com/algebra', description: 'In-depth analysis of polynomials and their applications.', category: 'tutorials', classes: [10, 11] },
    // Add more resources as needed
  ];

  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedClass: string = 'all';

  classOptions: number[] = [8, 9, 10, 11, 12];

  get filteredResources() {
    return this.resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || resource.category === this.selectedCategory;
      const matchesClass = this.selectedClass === 'all' || resource.classes.includes(+this.selectedClass);
      return matchesSearch && matchesCategory && matchesClass;
    });
  }
}
