// src/app/skill-list/skill-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Student {
  name: string;
  skills: string;
  skillsToLearn?: string;
  availability: string;
  location?: string;
  interests?: string;
}

@Component({
  selector: 'app-skill-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-list.component.html',
  styleUrls: ['./skill-list.component.css']
})
export class SkillListComponent implements OnInit {
  skills: Student[] = [];
  searchQuery: string = '';
  matches: Student[] = [];

  constructor(public router: Router) {}

  ngOnInit() {
    this.skills = this.getStudents(); // Load students on init
  }

  // Retrieve students from localStorage
  getStudents() {
    const studentProfiles = JSON.parse(localStorage.getItem('students') || '[]');
    return studentProfiles;
  }

  // Filter students based on search query
  filterSkills() {
    if (!this.searchQuery) {
      return this.skills;
    }
    return this.skills.filter(student =>
      student.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      student.skills.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Find matches based on skills to learn and availability
  findMatches(currentUser: { skillsToLearn: string; availability: string; location?: string }) {
    if (!currentUser.skillsToLearn || !currentUser.availability) {
      console.error('Current user information is incomplete:', currentUser);
      return [];
    }

    return this.skills.map(student => {
      let score = 0;

      if (student.skills.toLowerCase().includes(currentUser.skillsToLearn.toLowerCase())) {
        score += 10;
      }

      if (student.availability === currentUser.availability) {
        score += 5;
      }

      if (currentUser.location && student.location === currentUser.location) {
        score += 2;
      }

      return { student, score };
    })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.student);
  }

  // Display matches based on the selected student's skills to learn
  displayMatches(student: { skillsToLearn?: string; availability: string; interests?: string }) {
    const currentUser = {
      skillsToLearn: student.skillsToLearn || student.interests || '',
      availability: student.availability || ''
    };
    this.matches = this.findMatches(currentUser);
  }

  // Method to clear matches when needed
  clearMatches() {
    this.matches = [];
  }

  // Request functionality to send a request to a matched student
  sendRequest(student: Student) {
    const message = `Request to connect with ${student.name}`;
    alert(message); // Placeholder for actual request logic
  }

  // Edit student functionality
  editStudent(student: Student) {
    const newSkills = prompt('Edit skills for ' + student.name, student.skills);
    if (newSkills !== null) {
      student.skills = newSkills;
      this.saveStudents();
    }
  }

  // Delete student functionality
  deleteStudent(student: Student) {
    const confirmDelete = confirm(`Are you sure you want to delete ${student.name}?`);
    if (confirmDelete) {
      this.skills = this.skills.filter(s => s !== student); // Remove the student from the array
      this.saveStudents(); // Update the localStorage with the new list
    }
  }

  // View detailed information about a student
  viewDetails(student: Student) {
    const details = `
      Name: ${student.name}
      Skills: ${student.skills}
      Skills to Learn: ${student.skillsToLearn || 'N/A'}
      Availability: ${student.availability}
      Location: ${student.location || 'N/A'}
      Interests: ${student.interests || 'N/A'}
    `;
    alert(details); // Placeholder for a modal or more sophisticated view
  }

  // Save updated students back to localStorage
  saveStudents() {
    localStorage.setItem('students', JSON.stringify(this.skills));
  }
}
