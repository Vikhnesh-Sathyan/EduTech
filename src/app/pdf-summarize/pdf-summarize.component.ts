import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pdf-summarize',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './pdf-summarize.component.html',
  styleUrls: ['./pdf-summarize.component.css']
})
export class PdfSummarizeComponent {
  selectedFile: File | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  isLoading: boolean = false;
  summary: string = 'Professional Experience: Skilled in Java, Python, and SQL. Key Skills: education, projects, certification, achievements.';
  skills: string[] = [];
  keywords: { word: string, definition: string }[] = [];
  sentiment: string = '';
  complexity: any = {};
  readability: any = {};
  structure: any = {};
  metrics: any = {};
  readingTime: string = '';
  audioUrl: string | null = null;
  showFullSummary: boolean = false;
  activeTab: 'summary' | 'structure' | 'analysis' = 'summary';
  documentType: 'resume' | 'educational' | 'general' = 'general';
  skillMentions: number = 0;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.detectDocumentType(file);
    } else {
      alert('Please select a valid PDF file.');
      this.clearFile();
    }
  }

  async detectDocumentType(file: File) {
    try {
      const reader = new FileReader();
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the PDF file. Please try again.');
        this.clearFile();
      };
      
      reader.onload = (e: any) => {
        try {
          const text = e.target.result;
          
          if (!text || typeof text !== 'string') {
            throw new Error('Could not extract text from PDF');
          }
          
          const resumeKeywords = ['experience', 'education', 'skills', 'work history', 'resume', 'cv', 'career'];
          const educationalKeywords = ['chapter', 'course', 'lesson', 'study', 'learning', 'textbook', 'exercise'];
          
          const lowerText = text.toLowerCase();
          
          let resumeScore = resumeKeywords.filter(keyword => lowerText.includes(keyword)).length;
          let educationalScore = educationalKeywords.filter(keyword => lowerText.includes(keyword)).length;
          
          if (resumeScore > educationalScore) {
            this.documentType = 'resume';
          } else if (educationalScore > resumeScore) {
            this.documentType = 'educational';
          } else {
            this.documentType = 'general';
          }
          
          this.processPdfFile(file);
        } catch (error) {
          console.error('Error processing file content:', error);
          alert('Error processing the PDF content. Please make sure the PDF is not encrypted and contains extractable text.');
          this.clearFile();
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error in detectDocumentType:', error);
      alert('Error analyzing the document. Please try again.');
      this.clearFile();
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.documentType = 'general';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.resetData();
  }

  resetData() {
    this.summary = 'Professional Experience: Skilled in Java, Python, and SQL. Key Skills: education, projects, certification, achievements.';
    this.keywords = [];
    this.sentiment = '';
    this.complexity = {};
    this.readability = {};
    this.structure = {};
    this.metrics = {};
    this.readingTime = '';
    this.audioUrl = null;
    this.isLoading = false;
    this.skillMentions = 0;
  }

  processPdfFile(file: File) {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('pdf', file);

    this.http.post<any>('http://127.0.0.1:5000/summarize_pdf', formData)
      .subscribe({
        next: (response) => {
          this.summary = this.highlightKeywords(response.summary);
          this.keywords = response.keywords || [];
          this.skills = response.skills || [];
          this.skillMentions = response.skill_mentions || 0;
          this.complexity = response.complexity || {};
          this.readability = response.readability || {};
          this.structure = response.structure || {};
          this.metrics = response.metrics || {};
          this.readingTime = this.metrics.estimated_reading_time || this.calculateReadingTime(this.summary);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error processing PDF:', error);
          this.isLoading = false;
        }
      });
  }

  summarizePdf(file: File) {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('pdf', file);

    this.http.post<any>('http://127.0.0.1:5000/summarize_pdf', formData)
      .subscribe({
        next: (response) => {
          this.summary = this.highlightKeywords(response.summary);
          this.keywords = response.keywords || [];
          this.skills = response.skills || [];
          this.skillMentions = response.skill_mentions || 0;
          this.complexity = response.complexity || {};
          this.readability = response.readability || {};
          this.structure = response.structure || {};
          this.metrics = response.metrics || {};
          this.readingTime = this.metrics.estimated_reading_time || this.calculateReadingTime(this.summary);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error summarizing PDF:', error);
          this.isLoading = false;
        }
      });
  }

  calculateReadingTime(text: string): string {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  generateAudio() {
    this.http.post('http://127.0.0.1:5000/text_to_speech', 
      { text: this.summary },
      { responseType: 'blob' }
    ).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'audio/mp3' });
        this.audioUrl = URL.createObjectURL(blob);
      },
      error: (error) => {
        console.error("Error generating audio:", error);
        alert("An error occurred while generating audio.");
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  toggleSummary() {
    this.showFullSummary = !this.showFullSummary;
  }

  switchTab(tab: 'summary' | 'structure' | 'analysis') {
    this.activeTab = tab;
  }

  downloadPDF() {
    if (!this.summary) {
      alert("Please process a PDF file first.");
      return;
    }

    const payload = {
      text: this.summary,
      keywords: this.keywords,
      complexity: this.complexity,
      readability: this.readability,
      structure: this.structure,
      metrics: this.metrics
    };

    this.http.post('http://127.0.0.1:5000/download_pdf', 
      payload,
      { responseType: 'blob' }
    ).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `summary_${this.selectedFile?.name || 'document'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
        alert('An error occurred while downloading the PDF. Please try again.');
      }
    });
  }

  highlightKeywords(text: string): string {
    const importantKeywords = ['skills', 'education', 'projects', 'certification', 'achievements'];
    const regex = new RegExp(`(${importantKeywords.join('|')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
}
