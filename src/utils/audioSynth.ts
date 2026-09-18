// Audio synthesizer for Baby Growth Movie BGM
// Specially arranged melodic themes for:
// 1. 악뮤 (AKMU) - '기쁨, 슬픔, 아름다운 마음'
// 2. 윤종신 - 'O my baby'

import { BgmTrackId } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let streamDest: MediaStreamAudioDestinationNode | null = null;
let loopTimer: number | null = null;
let customAudioEl: HTMLAudioElement | null = null;
let currentPlayingTrack: BgmTrackId = 'none';

// Note frequencies in Hz
const NOTE_FREQS: Record<string, number> = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50,
  'REST': 0,
};

interface NoteEvent {
  pitch: string;
  duration: number; // in seconds
  bassPitch?: string;
  isChord?: boolean;
}

// AKMU - '기쁨, 슬픔, 아름다운 마음' gentle melodic theme
// Gentle, uplifting acoustic piano & music box cadence
const AKMU_MELODY: NoteEvent[] = [
  // Phrase 1: "기쁨과 슬픔, 그 안의 따뜻한 마음"
  { pitch: 'F4', duration: 0.7, bassPitch: 'F3' },
  { pitch: 'A4', duration: 0.5 },
  { pitch: 'C5', duration: 0.6 },
  { pitch: 'D5', duration: 0.9, bassPitch: 'D3' },
  { pitch: 'C5', duration: 0.5 },
  { pitch: 'A4', duration: 0.8 },
  
  { pitch: 'G4', duration: 0.6, bassPitch: 'G3' },
  { pitch: 'A4', duration: 0.5 },
  { pitch: 'G4', duration: 0.6 },
  { pitch: 'F4', duration: 1.1, bassPitch: 'C4' },

  // Phrase 2: 밝고 맑은 미소
  { pitch: 'A4', duration: 0.6, bassPitch: 'F3' },
  { pitch: 'C5', duration: 0.6 },
  { pitch: 'D5', duration: 0.7, bassPitch: 'B3' },
  { pitch: 'F5', duration: 0.9 },
  { pitch: 'E5', duration: 0.6, bassPitch: 'C4' },
  { pitch: 'D5', duration: 0.6 },
  { pitch: 'C5', duration: 1.2, bassPitch: 'A3' },

  // Phrase 3: 아름다운 마음
  { pitch: 'D5', duration: 0.6, bassPitch: 'B3' },
  { pitch: 'C5', duration: 0.5 },
  { pitch: 'A4', duration: 0.7, bassPitch: 'F3' },
  { pitch: 'G4', duration: 0.6, bassPitch: 'C4' },
  { pitch: 'F4', duration: 1.4, bassPitch: 'F3' },
  { pitch: 'REST', duration: 0.5 },
];

// Yoon Jong Shin - 'O my baby' sweet tender lullaby theme
// Warm, emotional acoustic ballad arpeggios
const YOON_MELODY: NoteEvent[] = [
  // Intro / Theme: "O my baby, 나의 품에 안긴 작은 천사"
  { pitch: 'G4', duration: 0.8, bassPitch: 'G3' },
  { pitch: 'B4', duration: 0.6 },
  { pitch: 'D5', duration: 0.7 },
  { pitch: 'E5', duration: 1.1, bassPitch: 'E3' },
  { pitch: 'D5', duration: 0.6 },
  { pitch: 'B4', duration: 0.8 },

  { pitch: 'A4', duration: 0.6, bassPitch: 'C3' },
  { pitch: 'B4', duration: 0.5 },
  { pitch: 'C5', duration: 0.8, bassPitch: 'D3' },
  { pitch: 'B4', duration: 0.6 },
  { pitch: 'A4', duration: 1.0, bassPitch: 'G3' },

  // Second half: "사랑해 언제까지나"
  { pitch: 'D5', duration: 0.7, bassPitch: 'B3' },
  { pitch: 'E5', duration: 0.6 },
  { pitch: 'G5', duration: 1.0, bassPitch: 'C4' },
  { pitch: 'F5', duration: 0.5 },
  { pitch: 'E5', duration: 0.7, bassPitch: 'D4' },
  { pitch: 'D5', duration: 0.8 },
  { pitch: 'C5', duration: 0.6, bassPitch: 'C4' },
  { pitch: 'B4', duration: 0.7, bassPitch: 'G3' },
  { pitch: 'A4', duration: 0.8, bassPitch: 'D3' },
  { pitch: 'G4', duration: 1.6, bassPitch: 'G3' },
  { pitch: 'REST', duration: 0.6 },
];

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    streamDest = audioCtx.createMediaStreamDestination();

    masterGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
    masterGain.connect(streamDest);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return { audioCtx, masterGain, streamDest };
}

// Play a tender warm bell/rhodes synth tone
function playNote(freq: number, duration: number, when: number, isBass = false) {
  if (!audioCtx || !masterGain || freq <= 0) return;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  // Tone color: Soft sine + gentle triangle for baby music-box warm feel
  osc1.type = isBass ? 'triangle' : 'sine';
  osc1.frequency.setValueAtTime(freq, when);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * (isBass ? 0.5 : 1.002), when); // subtle chorus shimmer

  // Envelope: gentle attack, warm sustain, soft release
  const attack = isBass ? 0.04 : 0.02;
  const decay = duration * 0.9;

  noteGain.gain.setValueAtTime(0.0001, when);
  noteGain.gain.exponentialRampToValueAtTime(isBass ? 0.18 : 0.28, when + attack);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, when + decay);

  osc1.connect(noteGain);
  osc2.connect(noteGain);
  noteGain.connect(masterGain);

  osc1.start(when);
  osc2.start(when);
  osc1.stop(when + decay);
  osc2.stop(when + decay);
}

function scheduleScore(melody: NoteEvent[]) {
  if (!audioCtx) return;

  let currentTime = audioCtx.currentTime + 0.05;
  const totalDuration = melody.reduce((acc, n) => acc + n.duration, 0);

  melody.forEach((note) => {
    const freq = NOTE_FREQS[note.pitch] || 0;
    if (freq > 0) {
      playNote(freq, note.duration, currentTime, false);
    }
    if (note.bassPitch) {
      const bassFreq = NOTE_FREQS[note.bassPitch] || 0;
      if (bassFreq > 0) {
        playNote(bassFreq, note.duration * 1.2, currentTime, true);
      }
    }
    currentTime += note.duration;
  });

  // Loop
  loopTimer = window.setTimeout(() => {
    if (currentPlayingTrack === 'akmu' || currentPlayingTrack === 'yoon') {
      scheduleScore(melody);
    }
  }, totalDuration * 1000);
}

export const soundManager = {
  startBgm(track: BgmTrackId, volume = 0.5) {
    this.stopBgm();
    currentPlayingTrack = track;

    if (track === 'none') return;

    initAudioContext();
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
    }

    if (track === 'akmu') {
      scheduleScore(AKMU_MELODY);
    } else if (track === 'yoon') {
      scheduleScore(YOON_MELODY);
    }
  },

  playCustomAudio(audioSource: string | File, volume = 0.5) {
    this.stopBgm();
    currentPlayingTrack = 'custom';

    const el = new Audio();
    el.loop = true;
    el.volume = Math.max(0, Math.min(1, volume));

    if (typeof audioSource === 'string') {
      el.src = audioSource;
    } else {
      el.src = URL.createObjectURL(audioSource);
    }

    initAudioContext();
    if (audioCtx && streamDest) {
      try {
        const sourceNode = audioCtx.createMediaElementSource(el);
        sourceNode.connect(masterGain!);
        sourceNode.connect(streamDest);
      } catch (err) {
        console.warn('Could not connect custom audio to WebAudio stream:', err);
      }
    }

    el.play().catch((err) => console.warn('Audio play prevented:', err));
    customAudioEl = el;
  },

  setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(clamped, audioCtx.currentTime);
    }
    if (customAudioEl) {
      customAudioEl.volume = clamped;
    }
  },

  stopBgm() {
    currentPlayingTrack = 'none';
    if (loopTimer) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
    if (customAudioEl) {
      customAudioEl.pause();
      customAudioEl.src = '';
      customAudioEl = null;
    }
  },

  getAudioStream(): MediaStream | null {
    if (streamDest) {
      return streamDest.stream;
    }
    return null;
  },

  getAudioStreamTrack(): MediaStreamTrack | null {
    if (streamDest && streamDest.stream) {
      const tracks = streamDest.stream.getAudioTracks();
      return tracks.length > 0 ? tracks[0] : null;
    }
    return null;
  },

  getCurrentTrack(): BgmTrackId {
    return currentPlayingTrack;
  },
};
