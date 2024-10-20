import { Component } from '@angular/core';
import html2canvas from 'html2canvas'; // Import the necessary library
import jsPDF from 'jspdf'; // Import the necessary library

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent {
  // Assume these scores come from the user's performance in tasks
  taskScores: number[] = [85, 90, 75]; // Example scores for Task 1, Task 2, Task 3
  totalScore: number = 0; // Initialize total score
  certificateData: { name: string; courseTitle: string; completionDate: string; score: string } | null = null;

  constructor() {
    // Calculate total score as the average of the task scores
    this.totalScore = this.calculateTotalScore();
    // Replace with actual user name or fetch dynamically
    this.certificateData = {
      name: 'Vikhnesh sathyan',
      courseTitle: 'Fundamentals of Music Theory',
      completionDate: new Date().toLocaleDateString(),
      score: `${this.totalScore}%`, // Set the calculated score
    };
  }

  calculateTotalScore(): number {
    const total = this.taskScores.reduce((acc, score) => acc + score, 0);
    return Math.round(total / this.taskScores.length); // Return the average score
  }
  downloadCertificate() {
    const certificateElement = document.querySelector('.certificate') as HTMLElement | null;
  
    // Check if certificateElement is not null
    if (certificateElement) {
      html2canvas(certificateElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        
        // Adjust the parameters as necessary
        pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save('certificate.pdf');
      });
    } else {
      alert('Certificate element not found.');
    }
  }
  

}
