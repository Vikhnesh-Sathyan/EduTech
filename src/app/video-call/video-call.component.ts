import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit {
  localVideo!: HTMLVideoElement;  // Definite assignment
  remoteVideo!: HTMLVideoElement;
  peerConnection: RTCPeerConnection | null = null; // Allow peerConnection to be null

  socket = io('http://localhost:3000');  // Connect to Node.js server

  ngOnInit(): void {
    this.localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    this.remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
    this.setupMedia();
    this.setupSocketListeners();
  }

  async setupMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.srcObject = stream;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));

    this.peerConnection.ontrack = (event) => {
      this.remoteVideo.srcObject = event.streams[0];
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', event.candidate);
      }
    };
  }

  setupSocketListeners() {
    this.socket.on('offer', async (offer) => {
      if (this.peerConnection) {  // Check if peerConnection is not null
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.socket.emit('answer', answer);
      }
    });

    this.socket.on('answer', (answer) => {
      if (this.peerConnection) {  // Check if peerConnection is not null
        this.peerConnection.setRemoteDescription(answer);
      }
    });

    this.socket.on('ice-candidate', (candidate) => {
      if (this.peerConnection) {  // Check if peerConnection is not null
        this.peerConnection.addIceCandidate(candidate);
      }
    });
  }

  async makeCall() {
    if (this.peerConnection) {  // Check if peerConnection is not null
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit('offer', offer);
    }
  }

  endCall() {
    if (this.peerConnection) {
      // Close the peer connection
      this.peerConnection.close();
      this.peerConnection = null; // Clear the reference to the peer connection
      console.log('Call ended');
      
      // Optionally, notify the server that the call has ended
      this.socket.emit('call-ended'); // Adjust payload as necessary
      
      // Stop local video stream if applicable
      const localStream = this.localVideo.srcObject as MediaStream;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop()); // Stop all tracks
        this.localVideo.srcObject = null; // Clear local video
      }
      
      // Clear the remote video stream
      this.remoteVideo.srcObject = null; // Clear remote video
    }
  }
}
