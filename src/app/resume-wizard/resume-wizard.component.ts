import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResumeService } from '../resume.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-resume-wizard',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './resume-wizard.component.html',
  styleUrls: ['./resume-wizard.component.css'],
  providers: [ResumeService],
  host: {
    '[class]': '"resume-wizard"'
  }
})
export class ResumeWizardComponent {
  resume = {
    jobPosition: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: '',
    profilePictureFile: null as File | null,
    headline: '',
    linkedin: '',
    github: '',
    website: '',
    education: [{ degree: '', institution: '', year: '' }],
    experience: [{ jobTitle: '', company: '', duration: '', description: '' }],
    skills: [''],
    projects: [{ title: '', description: '', technologies: '' }]
  };

  validationErrors: { [key: string]: string } = {};
  isFormValid = false;

  // Email validation constants
  private readonly disposableDomains = [
    'tempmail.com', 'throwawaymail.com', 'tempmailaddress.com',
    'tempmail.net', 'disposablemail.com', 'tempmail.org',
    'tempmail.plus', 'tempmail.ninja', 'tempmail.website'
  ];

  private readonly validTLDs = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'biz', 'info',
    'name', 'mobi', 'app', 'io', 'co', 'ai', 'dev', 'tech'
  ];

  private validationRules = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]+$/,
    phone: /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/,
    simplePhone: /^\d{10}$/,
    required: (value: any) => value && value.trim().length > 0
  };

  // Additional email validation rules
  private isValidEmail(email: string): boolean {
    // Basic format check
    if (!this.validationRules.email.test(email)) {
      return false;
    }

    // Split email into local and domain parts
    const [localPart, domain] = email.split('@');

    // Check local part length (max 64 characters)
    if (localPart.length > 64) {
      return false;
    }

    // Check domain length (max 255 characters)
    if (domain.length > 255) {
      return false;
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    // Check for common disposable email domains
    if (this.disposableDomains.includes(domain.toLowerCase())) {
      return false;
    }

    // Check for short domain names (less than 3 characters)
    const domainParts = domain.split('.');
    if (domainParts.some((part: string) => part.length < 3)) {
      return false;
    }

    return true;
  }

  // Additional phone validation rules
  private isValidPhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits
    if (cleanPhone.length !== 10) {
      return false;
    }

    // Check for repeated digits (like 0000000000, 1111111111, etc.)
    if (/^(\d)\1{9}$/.test(cleanPhone)) {
      return false;
    }

    // Check for sequential numbers (like 1234567890)
    if (/^0123456789$/.test(cleanPhone) || /^9876543210$/.test(cleanPhone)) {
      return false;
    }

    // Check for area code validity (first digit cannot be 0 or 1)
    const areaCode = cleanPhone.substring(0, 3);
    if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
      return false;
    }

    // Check for valid exchange code (second group cannot be 0 or 1)
    const exchangeCode = cleanPhone.substring(3, 6);
    if (exchangeCode.startsWith('0') || exchangeCode.startsWith('1')) {
      return false;
    }

    return true;
  }

  // Live validation methods
  validateField(field: string, value: any) {
    switch (field) {
      case 'firstName':
        if (!this.validationRules.required(value)) {
          this.validationErrors['firstName'] = 'First name is required';
        } else {
          delete this.validationErrors['firstName'];
        }
        break;
      case 'lastName':
        if (!this.validationRules.required(value)) {
          this.validationErrors['lastName'] = 'Last name is required';
        } else {
          delete this.validationErrors['lastName'];
        }
        break;
      case 'email':
        if (!this.validationRules.required(value)) {
          this.validationErrors['email'] = 'Email is required';
        } else if (!value.includes('@')) {
          this.validationErrors['email'] = 'Email must contain @ symbol';
        } else if (!this.isValidEmail(value)) {
          const [localPart, domain] = value.split('@');
          
          if (localPart.length > 64) {
            this.validationErrors['email'] = 'Local part of email cannot exceed 64 characters';
          } else if (domain.length > 255) {
            this.validationErrors['email'] = 'Domain part of email cannot exceed 255 characters';
          } else if (value.includes('..')) {
            this.validationErrors['email'] = 'Email cannot contain consecutive dots';
          } else if (this.disposableDomains.includes(domain.toLowerCase())) {
            this.validationErrors['email'] = 'Disposable email addresses are not allowed';
          } else {
            const domainParts = domain.split('.');
            if (domainParts.some((part: string) => part.length < 3)) {
              this.validationErrors['email'] = 'This type of email domain is not supported. Please use a valid email domain (e.g., gmail.com, yahoo.com)';
            } else {
              this.validationErrors['email'] = 'Please enter a valid email address';
            }
          }
        } else {
          delete this.validationErrors['email'];
        }
        break;
      case 'phone':
        if (!this.validationRules.required(value)) {
          this.validationErrors['phone'] = 'Phone number is required';
        } else {
          const cleanPhone = value.replace(/\D/g, '');
          
          if (!this.isValidPhoneNumber(value)) {
            if (cleanPhone.length !== 10) {
              this.validationErrors['phone'] = 'Phone number must be exactly 10 digits';
            } else if (/^(\d)\1{9}$/.test(cleanPhone)) {
              this.validationErrors['phone'] = 'Phone number cannot be all the same digits';
            } else if (/^0123456789$/.test(cleanPhone) || /^9876543210$/.test(cleanPhone)) {
              this.validationErrors['phone'] = 'Phone number cannot be sequential numbers';
            } else if (cleanPhone.substring(0, 3).startsWith('0') || cleanPhone.substring(0, 3).startsWith('1')) {
              this.validationErrors['phone'] = 'Area code cannot start with 0 or 1';
            } else if (cleanPhone.substring(3, 6).startsWith('0') || cleanPhone.substring(3, 6).startsWith('1')) {
              this.validationErrors['phone'] = 'Exchange code cannot start with 0 or 1';
            } else {
              this.validationErrors['phone'] = 'Please enter a valid 10-digit phone number';
            }
          } else {
            delete this.validationErrors['phone'];
          }
        }
        break;
    }
    this.isFormValid = Object.keys(this.validationErrors).length === 0;
  }

  validateEducation(index: number, field: string, value: any) {
    const key = `education-${index}-${field}`;
    if (!this.validationRules.required(value)) {
      this.validationErrors[key] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else {
      delete this.validationErrors[key];
    }
    this.isFormValid = Object.keys(this.validationErrors).length === 0;
  }

  validateExperience(index: number, field: string, value: any) {
    const key = `experience-${index}-${field}`;
    if (!this.validationRules.required(value)) {
      this.validationErrors[key] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else {
      delete this.validationErrors[key];
    }
    this.isFormValid = Object.keys(this.validationErrors).length === 0;
  }

  validateSkills() {
    if (this.resume.skills.length === 0 || this.resume.skills.some(skill => !this.validationRules.required(skill))) {
      this.validationErrors['skills'] = 'At least one skill is required';
    } else {
      delete this.validationErrors['skills'];
    }
    this.isFormValid = Object.keys(this.validationErrors).length === 0;
  }

  // Validate form for PDF preview
  validateForm() {
    this.validationErrors = {};
    
    // Validate basic info
    this.validateField('firstName', this.resume.firstName);
    this.validateField('lastName', this.resume.lastName);
    this.validateField('email', this.resume.email);
    this.validateField('phone', this.resume.phone);

    // Validate education
    this.resume.education.forEach((edu, index) => {
      this.validateEducation(index, 'degree', edu.degree);
      this.validateEducation(index, 'institution', edu.institution);
      this.validateEducation(index, 'year', edu.year);
    });

    // Validate experience
    this.resume.experience.forEach((exp, index) => {
      this.validateExperience(index, 'jobTitle', exp.jobTitle);
      this.validateExperience(index, 'company', exp.company);
      this.validateExperience(index, 'duration', exp.duration);
    });

    // Validate skills
    this.validateSkills();

    return this.isFormValid;
  }

  addEducation() {
    this.resume.education.push({ degree: '', institution: '', year: '' });
    this.validateForm();
  }

  addExperience() {
    this.resume.experience.push({ jobTitle: '', company: '', duration: '', description: '' });
    this.validateForm();
  }

  addSkill() {
    this.resume.skills.push('');
    this.validateForm();
  }

  addProject() {
    this.resume.projects.push({ title: '', description: '', technologies: '' });
    this.validateForm();
  }

  // **Download Resume as PDF**
  openPDFPreview() {
    if (!this.validateForm()) {
      alert('Please fill in all required fields correctly before previewing the PDF.');
      return;
    }
    
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) return;
  
    // Configure html2canvas options
    const options = {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: resumeElement.scrollWidth,
      windowHeight: resumeElement.scrollHeight
    };
  
    html2canvas(resumeElement, options).then(canvas => {
      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
  
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm
  
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
  
      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  
      // If content is longer than one page, add new pages
      let heightLeft = imgHeight;
      let position = 0;
  
      while (heightLeft >= pageHeight) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      // Open PDF in new tab
      window.open(pdf.output('bloburl'), '_blank');
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    });
  }

  // Handle file upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.validationErrors['profilePicture'] = 'Please upload an image file (JPG, PNG, etc.)';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.validationErrors['profilePicture'] = 'Image size should be less than 5MB';
        return;
      }

      // Create object URL for preview
      this.resume.profilePicture = URL.createObjectURL(file);
      this.resume.profilePictureFile = file;
      delete this.validationErrors['profilePicture'];
    }
  }

  // Clean up object URL when component is destroyed
  ngOnDestroy() {
    if (this.resume.profilePicture) {
      URL.revokeObjectURL(this.resume.profilePicture);
    }
  }
}
