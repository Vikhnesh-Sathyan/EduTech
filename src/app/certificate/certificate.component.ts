import { Component } from '@angular/core';
import html2canvas from 'html2canvas'; // Import the necessary library
import jsPDF from 'jspdf'; // Import the necessary library
@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.css'
})
export class CertificateComponent {
  certificateData: { name: string; courseTitle: string; completionDate: string; grade: string } | null = null;

  constructor() {
    // Replace with actual user name or fetch dynamically
    this.certificateData = {
      name: 'John Doe',
      courseTitle: 'Fundamentals of Music Theory',
      completionDate: new Date().toLocaleDateString(),
      grade: 'Passed',
    };
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
