import { Injectable } from '@angular/core';

export interface Student {
  student_name: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  guardian_name: string;
  grade: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentserviceService {
  private students: Student[] = []; // Initialize an array to hold student data

  constructor() {}

  setStudentData(student: Student): void {
    this.students.push(student); // Add student data to the array
  }

  getStudentData(): Student[] {
    return this.students; // Return the list of students
  }
}
