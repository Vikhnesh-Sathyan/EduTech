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
export class StudentService {
  private studentData: Student | null = null; // Initialize to null

  constructor() {  this.studentData = {
    student_name: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    guardian_name: '',
    grade: ''
  };}

  getStudentData(): Student | null { // Return the student data
    return this.studentData;
  }

  setStudentData(data: Student): void {
    this.studentData = data;
    console.log('Student data set:', this.studentData); // Debug log
  }
  
}
