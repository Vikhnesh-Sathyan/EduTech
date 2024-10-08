import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as Tone from 'tone'; // Import Tone.js library

@Component({
  selector: 'app-task2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task2.component.html',
  styleUrls: ['./task2.component.css']
})
export class Task2Component {
  notes: string[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']; // Available notes
  chords: string[] = ['C Major', 'G Major', 'A Minor', 'F Major']; // Available chords
  selectedNotes: string[] = []; // Array to store selected notes
  selectedChord: string = ''; // Selected chord

  constructor(private router: Router) {}

  // Toggle note selection
  toggleNoteSelection(note: string) {
    if (this.selectedNotes.includes(note)) {
      this.selectedNotes = this.selectedNotes.filter(n => n !== note);
    } else {
      this.selectedNotes.push(note);
    }
  }

  // Play the melody and harmony using Tone.js
  async playComposition() {
    // Create a new synth for melody
    const synth = new Tone.Synth().toDestination();

    // Create a timeline for the selected notes
    let time = 0; // Start at time 0
    const noteDuration = '4n'; // Quarter notes

    // Schedule each selected note to be played one after another
    this.selectedNotes.forEach(note => {
      synth.triggerAttackRelease(note, noteDuration, Tone.now() + time);
      time += Tone.Time(noteDuration).toSeconds(); // Increment the time by the duration of each note
    });

    // Play a chord after the melody
    if (this.selectedChord) {
      const chordNotes = this.getChordNotes(this.selectedChord); // Get chord notes based on the selected chord
      const chordSynth = new Tone.PolySynth().toDestination(); // Use polyphonic synth for chords
      chordSynth.triggerAttackRelease(chordNotes, '1n', Tone.now() + time); // Play chord after the melody
    }

    await Tone.start(); // Ensure Tone.js audio context is started
  }

  // Get the notes for a specific chord
  getChordNotes(chord: string): string[] {
    const chordMap: { [key: string]: string[] } = {
      'C Major': ['C4', 'E4', 'G4'],
      'G Major': ['G4', 'B4', 'D5'],
      'A Minor': ['A4', 'C5', 'E5'],
      'F Major': ['F4', 'A4', 'C5'],
    };
    return chordMap[chord] || [];
  }

  // Submit the composition (you can add further logic here)
  submitComposition() {
    if (this.selectedNotes.length > 0 && this.selectedChord) {
      alert('Composition submitted successfully!');
      this.router.navigate(['/task3']); // Redirect to Task 3 after submission
    } else {
      alert('Please select at least one note and a chord before submitting.');
    }
  }
}
