import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SummarizeService {
  private textApiUrl = 'http://127.0.0.1:5000/summarize';  // Flask backend URL for text
  private videoApiUrl = 'http://127.0.0.1:5000/summarize_video'; // Flask backend URL for video summaries

  constructor(private http: HttpClient) { }

  // Function to summarize text
  summarizeText(text: string): Observable<any> {
    return this.http.post<any>(this.textApiUrl, { text });
  }

  // Function to summarize YouTube video transcript
  summarizeVideo(youtubeUrl: string) {
    if (!youtubeUrl.trim()) {
      alert("Please enter a YouTube video link.");
      return;
    }

    console.log("Sending request with URL:", youtubeUrl);

    this.http.post(this.videoApiUrl, 
      { url: youtubeUrl }, 
      { responseType: 'blob' } // Receive response as a file (PDF)
    ).subscribe(response => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link to download the PDF
        const a = document.createElement('a');
        a.href = url;
        a.download = "summary.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Cleanup URL object
        window.URL.revokeObjectURL(url);
      }, error => {
        console.error("Error fetching video summary:", error);
      }
    );
  }
}
