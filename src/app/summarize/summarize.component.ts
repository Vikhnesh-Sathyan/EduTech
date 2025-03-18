import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-summarize',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './summarize.component.html',
  styleUrls: ['./summarize.component.css']
})
export class SummarizeComponent {
  text: string = '';
  summary: string = '';
  keywords: { word: string, definition: string }[] = [];
  sentiment: string = '';
  complexity: any = {};
  isLoading: boolean = false;
  readingTime: string = '';
  audioUrl: string | null = null;
  selectedLanguage: string = 'en';
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ml', name: 'Malayalam' }
  ];
  videoUrl: string = '';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  calculateReadingTime(text: string): string {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  summarizeText() {
    if (!this.text.trim()) {
      alert("Please enter text to summarize.");
      return;
    }

    // Check if input text is long enough for meaningful summarization
    if (this.text.trim().split(/\s+/).length < 50) {
      alert("Please enter a longer text (at least 50 words) for better summarization results.");
      return;
    }

    this.isLoading = true;
    this.readingTime = this.calculateReadingTime(this.text);
    
    console.log('Sending request to backend with text length:', this.text.length);
    
    this.http.post<any>('http://127.0.0.1:5000/summarize', { 
      text: this.text,
      target_language: this.selectedLanguage,
      min_length: 300,  // Significantly increased minimum length
      max_length: 800,  // Significantly increased maximum length
      num_sentences: 15  // Increased number of sentences
    }).subscribe({
      next: (response) => {
        console.log('Received response:', response);
        if (response.error) {
          alert(`Server error: ${response.error}`);
          this.isLoading = false;
          return;
        }
        this.summary = response.summary;
        
        // Check summary length and provide feedback
        const summaryWords = this.summary.trim().split(/\s+/).length;
        if (summaryWords < 30) {
          console.warn('Summary seems too short:', summaryWords, 'words');
          alert('The generated summary seems quite short. You might want to try again or check if the input text has enough content to summarize.');
        }
        
        this.keywords = response.keywords;
        this.sentiment = response.sentiment;
        this.complexity = response.complexity;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error details:", error);
        let errorMessage = "An error occurred while summarizing.";
        if (error.status === 0) {
          errorMessage = "Cannot connect to the server. Please make sure the backend server is running.";
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  downloadPDF() {
    if (!this.summary) {
      alert("Please generate a summary first before downloading PDF.");
      return;
    }

    this.isLoading = true;
    console.log('Starting PDF download with data:', {
      text: this.summary,
      keywords: this.keywords,
      complexity: this.complexity
    });
    
    const payload = {
      text: this.summary,
      keywords: this.keywords,
      complexity: this.complexity,
      sentiment: this.sentiment,
      readability: this.complexity
    };

    this.http.post('http://127.0.0.1:5000/download_pdf', 
      payload, 
      { 
        responseType: 'blob',
        observe: 'response',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        }
      }
    ).subscribe({
      next: (response) => {
        console.log('PDF Response status:', response.status);
        console.log('PDF Response headers:', response.headers);
        console.log('PDF Response type:', response.headers.get('Content-Type'));
        
        if (!response.body) {
          console.error('Response body is null');
          alert("No data received from server");
          this.isLoading = false;
          return;
        }

        const contentType = response.headers.get('Content-Type');
        
        // If we received JSON instead of PDF, it might be an error message
        if (contentType && contentType.includes('application/json')) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorJson = JSON.parse(reader.result as string);
              console.error('Server error response:', errorJson);
              alert(errorJson.error || "Error generating PDF");
            } catch (e) {
              console.error("Error parsing JSON response:", e);
              alert("Error generating PDF");
            }
            this.isLoading = false;
          };
          reader.readAsText(response.body);
          return;
        }

        try {
          console.log('Creating PDF blob of size:', response.body.size);
          const blob = new Blob([response.body], { type: 'application/pdf' });
          
          // Verify the blob is valid
          if (blob.size === 0) {
            throw new Error('Generated PDF is empty');
          }
          
          const url = window.URL.createObjectURL(blob);
          if (!url || url === 'about:blank') {
            throw new Error('Invalid blob URL created');
          }

          const link = document.createElement('a');
          link.href = url;
          link.download = `text_summary_${new Date().toISOString().slice(0,10)}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log('PDF download completed successfully');
          this.isLoading = false;
        } catch (error) {
          console.error("Error creating PDF blob:", error);
          alert("Error downloading PDF. Please try again.");
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error("Error downloading PDF:", error);
        console.error("Error details:", {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        let errorMessage = "An error occurred while downloading the PDF.";
        
        if (error.status === 0) {
          errorMessage = "Cannot connect to the server. Please make sure the backend server is running.";
        } else if (error.status === 404) {
          errorMessage = "PDF generation endpoint not found. Please check the server configuration.";
        } else if (error.status === 413) {
          errorMessage = "The text is too large to process. Please try with a smaller text.";
        } else if (error.status === 500) {
          errorMessage = "Server error while generating PDF. Please check if all required Python packages are installed on the server.";
          if (error.error && typeof error.error === 'object') {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorJson = JSON.parse(reader.result as string);
                console.error('Server error details:', errorJson);
                if (errorJson.error || errorJson.message) {
                  alert(errorJson.error || errorJson.message);
                  return;
                }
              } catch (e) {
                console.error("Error parsing error response:", e);
              }
              alert(errorMessage);
            };
            reader.readAsText(error.error);
            return;
          }
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  generateAudio() {
    this.http.post('http://127.0.0.1:5000/text_to_speech', 
      { text: this.summary },
      { responseType: 'blob' }
    ).subscribe(
      response => {
        const blob = new Blob([response], { type: 'audio/mp3' });
        this.audioUrl = URL.createObjectURL(blob);
      },
      error => {
        console.error("Error generating audio:", error);
        alert("An error occurred while generating audio.");
      }
    );
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  summarizeVideo() {
    if (!this.videoUrl.trim()) {
      alert("Please enter a YouTube video link.");
      return;
    }

    this.isLoading = true;

    this.http.post<any>('http://127.0.0.1:5000/summarize_video', { 
      video_url: this.videoUrl 
    }).subscribe({
      next: (response) => {
        // Handle the response for video summarization
        if (response.error) {
          alert(`Server error: ${response.error}`);
          this.isLoading = false;
          return;
        }
        this.summary = response.summary; // Assuming the response contains a summary
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error summarizing video:", error);
        alert("An error occurred while summarizing the video.");
        this.isLoading = false;
      }
    });
  }
}
