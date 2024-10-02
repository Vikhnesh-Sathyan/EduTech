import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent {
  selectedClass: string = ''; // Add this variable
  selectedFiles: File[] = [];
  uploadedFiles: { name: string; url: string; type: string }[] = [];
  siteLink: string = '';
  videoLink: string = '';
  fileError: string = ''; // For file validation errors
  successMessage: string = ''; // To show success messages
  errorMessage: string = ''; // To show error messages

  onFileChange(event: any) {
    const files: FileList = event.target.files;
    this.uploadedFiles = []; // Reset the uploaded files on new selection

    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileURL = URL.createObjectURL(file); // Create a URL for the file
        this.uploadedFiles.push({ name: file.name, url: fileURL, type: file.type });
      }
      this.selectedFiles = Array.from(files); // Store selected files for future use
    } else {
      this.fileError = 'Please select at least one file'; // Handle empty file selection
    }
  }

  onSubmit() {
    if (!this.selectedClass) {
      this.errorMessage = 'Please select a class.';
      return;
    }
    // Handle file submission (e.g., upload to server if needed)
    console.log('Uploaded files:', this.selectedFiles);
    this.successMessage = 'Files uploaded successfully!';
  }

  addSiteLink() {
    if (this.siteLink) {
      this.uploadedFiles.push({
        name: this.siteLink,
        url: this.siteLink,
        type: 'website'
      });
      this.siteLink = ''; // Clear the input after adding
    }
  }

  addVideoLink() {
    if (this.videoLink) {
      this.uploadedFiles.push({
        name: this.videoLink,
        url: this.videoLink,
        type: 'video_link'
      });
      this.videoLink = ''; // Clear the input after adding
    }
  }

  deleteFile(index: number) {
    this.uploadedFiles.splice(index, 1); // Remove the file or link at the specified index
  }
}
