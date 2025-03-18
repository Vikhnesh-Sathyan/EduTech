import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-youtube-summarize',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './youtube-summarize.component.html',
  styleUrls: ['./youtube-summarize.component.css']
})
export class YoutubeSummarizeComponent {
  videoUrl: string = '';
  summary: string = '';
  isLoading: boolean = false;
  summaryHistory: string[] = [];

  constructor(private http: HttpClient) {}

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
        if (response.error) {
          alert(`Server error: ${response.error}`);
          this.isLoading = false;
          return;
        }
        this.summary = response.summary; // Assuming the response contains a summary
        this.summaryHistory.push(this.summary);
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error summarizing video:", error);
        alert("An error occurred while summarizing the video.");
        this.isLoading = false;
      }
    });
  }

  extractTranscript() {
    if (!this.videoUrl.trim()) {
      alert("Please enter a YouTube video link.");
      return;
    }

    this.isLoading = true;

    this.http.post<any>('http://127.0.0.1:5000/extract_transcript', { 
      video_url: this.videoUrl 
    }).subscribe({
      next: (response) => {
        if (response.error) {
          alert(`Server error: ${response.error}`);
          this.isLoading = false;
          return;
        }
        if (response.transcript.length < 50) {
          alert("Transcript is too short for summarization.");
          this.isLoading = false;
          return;
        }
        this.summary = response.transcript;
        this.summaryHistory.push(this.summary);
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error extracting transcript:", error);
        alert("An error occurred while extracting the transcript.");
        this.isLoading = false;
      }
    });
  }

  downloadSummary() {
    if (this.summary) {
      const blob = new Blob([this.summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'summary.txt'; // Name of the downloaded file
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the URL object
    } else {
      console.error('No summary available to download.');
    }
  }

  highlightKeywords(summary: string, keywords: string[]): string {
    if (!summary || !keywords.length) return summary;

    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    return summary.replace(regex, '<span class="highlight">$1</span>');
  }

  displaySummary() {
    const keywords = ['important', 'keyword']; // Add your keywords here
    this.summary = this.highlightKeywords(this.summary, keywords);
  }
}