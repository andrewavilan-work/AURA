let melodySynth = null;
let padSynth = null;
let melodyPattern = null;
let padLoop = null;
let isPlaying = false;
let reverb = null;
let delay = null;
let chorus = null;

async function initAudio() {
  if (melodySynth) return; 
  await Tone.start();
  
  // High quality spatial effects chain (Ambience)
  reverb = new Tone.Reverb({ decay: 6, preDelay: 0.2, wet: 0.8 }).toDestination();
  delay = new Tone.PingPongDelay({ delayTime: "4n", feedback: 0.4, wet: 0.4 }).connect(reverb);
  chorus = new Tone.Chorus({ frequency: 2, delayTime: 2.5, depth: 0.5, wet: 0.5 }).connect(delay);
  
  // Main Synthesizer (Melodies) - Bell/warm sound
  melodySynth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 10,
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 2 },
    modulation: { type: "triangle" },
    modulationEnvelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 2 }
  }).connect(chorus);
  
  // Atmospheric Synthesizer (Pads and background chords) - Soft wrapping sound
  padSynth = new Tone.PolySynth(Tone.AMSynth, {
    harmonicity: 1.5,
    oscillator: { type: "sine" },
    envelope: { attack: 2, decay: 1, sustain: 0.8, release: 4 },
    modulation: { type: "sine" },
    modulationEnvelope: { attack: 2, decay: 0.5, sustain: 0.8, release: 4 }
  }).connect(reverb);
  
  melodySynth.volume.value = -12;
  padSynth.volume.value = -18;
}

// Soulful musical profiles to avoid ugly randomness
const musicalProfiles = {
  joy: {
    tempo: 120,
    padChords: [["C3", "E3", "G3", "C4"], ["F3", "A3", "C4", "F4"]],
    melodyNotes: ["C4", "D4", "E4", "G4", "A4", "C5"],
    melodyRhythm: "8n",
    melodyPattern: "up",
    synthType: "sine"
  },
  calm: {
    tempo: 60,
    padChords: [["F2", "C3", "G3", "A3"], ["C3", "G3", "D4", "E4"]],
    melodyNotes: ["F4", "G4", "A4", "C5", "E5"], // Lydian scale
    melodyRhythm: "4n",
    melodyPattern: "randomWalk",
    synthType: "sine"
  },
  sadness: {
    tempo: 50,
    padChords: [["A2", "E3", "C4"], ["F2", "C3", "A3"]],
    melodyNotes: ["A3", "B3", "C4", "E4", "F4"], // Natural Minor
    melodyRhythm: "2n",
    melodyPattern: "down",
    synthType: "triangle"
  },
  anxiety: {
    tempo: 140,
    padChords: [["C3", "C#3", "G3"], ["F#2", "G2", "C3"]], // Dissonance (Tritones/Minor seconds)
    melodyNotes: ["C4", "C#4", "F#4", "G4"],
    melodyRhythm: "16n",
    melodyPattern: "random",
    synthType: "square"
  },
  determination: {
    tempo: 100,
    padChords: [["C3", "G3", "C4", "D4"], ["G2", "D3", "G3", "A3"]],
    melodyNotes: ["C4", "D4", "F4", "G4", "A#4", "C5"], // Minor pentatonic, rock/dorian
    melodyRhythm: "8n",
    melodyPattern: "upDown",
    synthType: "sawtooth"
  },
  exhaustion: {
    tempo: 40,
    padChords: [["E2", "B2", "E3"], ["E2", "A2", "D3"]], 
    melodyNotes: ["E3", "F#3", "B3"], // Very minimalist
    melodyRhythm: "1m", // Only extremely long notes
    melodyPattern: "randomOnce",
    synthType: "sine"
  },
  nostalgia: {
    tempo: 70,
    padChords: [["A2", "E3", "G3", "C4"], ["D3", "A3", "C4", "F4"]], // Minor seventh chords
    melodyNotes: ["A4", "C5", "D5", "E5", "G5"],
    melodyRhythm: "4n",
    melodyPattern: "alternateDown",
    synthType: "triangle"
  },
  gratitude: {
    tempo: 85,
    padChords: [["G2", "D3", "G3", "B3"], ["C3", "G3", "E4"]],
    melodyNotes: ["G4", "A4", "B4", "D5", "E5"],
    melodyRhythm: "4t", // Soft triplets
    melodyPattern: "upDown",
    synthType: "sine"
  },
  love: {
    tempo: 90,
    padChords: [["C3", "E3", "G3", "B3"], ["F3", "A3", "C4", "E4"]], // Major seventh chords (Romantic)
    melodyNotes: ["E4", "G4", "B4", "D5", "E5"],
    melodyRhythm: "8t",
    melodyPattern: "upDown",
    synthType: "sine"
  },
  anger: {
    tempo: 160,
    padChords: [["C2", "G2", "C3"], ["C#2", "G#2", "C#3"]], // Aggressive power chords
    melodyNotes: ["C3", "C#3", "G3", "G#3"],
    melodyRhythm: "16n",
    melodyPattern: "up",
    synthType: "sawtooth"
  },
  confusion: {
    tempo: 65,
    padChords: [["C3", "E3", "G#3"], ["D3", "F#3", "A#3"]], // Augmented chords
    melodyNotes: ["C4", "D4", "E4", "F#4", "G#4", "A#4"], // Whole tone scale
    melodyRhythm: "4n",
    melodyPattern: "randomWalk",
    synthType: "triangle"
  },
  hope: {
    tempo: 110,
    padChords: [["C3", "E3", "G3"], ["G2", "B2", "D3"], ["A2", "C3", "E3"], ["F2", "A2", "C3"]], // Inspirational pop progression I-V-vi-IV
    melodyNotes: ["C4", "D4", "E4", "G4", "A4"],
    melodyRhythm: "8n",
    melodyPattern: "up",
    synthType: "triangle"
  },
  loneliness: {
    tempo: 45,
    padChords: [["A2", "E3"], ["F2", "C3"]], // Absolute minimalism
    melodyNotes: ["A4", "E5"], // Distant lonely notes
    melodyRhythm: "1n",
    melodyPattern: "random",
    synthType: "sine"
  },
  surprise: {
    tempo: 130,
    padChords: [["C3", "E3", "G3", "C4"], ["Ab3", "Eb4", "C5"]], // Unexpected chord jump
    melodyNotes: ["C5", "C6", "G5", "E6"], // Wide jumps
    melodyRhythm: "16n",
    melodyPattern: "randomOnce",
    synthType: "square"
  },
  default: {
    tempo: 70,
    padChords: [["C3", "G3", "D4"]],
    melodyNotes: ["C4", "D4", "G4", "A4"],
    melodyRhythm: "4n",
    melodyPattern: "random",
    synthType: "sine"
  }
};

async function playEmotionMusic(emotion, params) {
  await initAudio();
  
  if (melodyPattern) {
    melodyPattern.stop();
    melodyPattern.dispose();
  }
  if (padLoop) {
    padLoop.stop();
    padLoop.dispose();
  }

  const profile = musicalProfiles[emotion] || musicalProfiles.default;

  // Parameter adjustments gracefully depending on Gemini's model intensity
  Tone.Transport.bpm.value = profile.tempo;

  // Adjusting timbre according to the profile
  melodySynth.set({
    oscillator: { type: profile.synthType || 'sine' }
  });
  
  if (emotion === 'anxiety') {
      melodySynth.set({ vibratoAmount: 0.8, vibratoRate: 10 });
      reverb.decay = 2; // Dry
  } else if (emotion === 'sadness' || emotion === 'exhaustion') {
      melodySynth.set({ vibratoAmount: 0.1, vibratoRate: 3 });
      reverb.decay = 10; // Extra wet, distant echo
  } else {
      melodySynth.set({ vibratoAmount: 0.2, vibratoRate: 5 });
      reverb.decay = 6;
  }

  // --- Layer 1: Atmospheric Background (Pads) ---
  let chordIndex = 0;
  padLoop = new Tone.Loop((time) => {
    let currentChord = profile.padChords[chordIndex];
    padSynth.triggerAttackRelease(currentChord, "1m", time);
    chordIndex = (chordIndex + 1) % profile.padChords.length;
  }, "2m"); // Change chord every 2 measures
  
  // --- Layer 2: Beautiful Generative Melody ---
  melodyPattern = new Tone.Pattern((time, note) => {
    // If the note hits specifically, sometimes randomly skip to give it a human feel (silence = breathing)
    if (Math.random() > 0.8 && emotion !== 'joy' && emotion !== 'anxiety') {
        return; // Musical silence
    }
    melodySynth.triggerAttackRelease(note, "8n", time);
  }, profile.melodyNotes, profile.melodyPattern);

  melodyPattern.interval = profile.melodyRhythm;

  // Start the layers
  padLoop.start(0);
  melodyPattern.start("0.5"); // Melody enters slightly after the pad
  Tone.Transport.start();
  
  isPlaying = true;
}

function toggleMusic() {
  if (!isPlaying) {
    Tone.Transport.start();
    isPlaying = true;
  } else {
    Tone.Transport.pause();
    isPlaying = false;
  }
  return isPlaying;
}

function stopMusic() {
  if (melodyPattern) {
    melodyPattern.stop();
  }
  if (padLoop) {
      padLoop.stop();
  }
  Tone.Transport.stop();
  isPlaying = false;
}

window.AuraAudio = {
  playEmotionMusic,
  toggleMusic,
  stopMusic
};
