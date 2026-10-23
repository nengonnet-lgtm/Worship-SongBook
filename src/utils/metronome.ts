// High precision Web Audio API Metronome engine

export class MetronomeEngine {
  private audioCtx: AudioContext | null = null;
  private isRunning: boolean = false;
  private tempo: number = 120;
  private beatsPerBar: number = 4;
  private currentBeat: number = 0;
  private timerId: number | null = null;
  private onBeatCallback?: (beat: number) => void;

  constructor() {
    // Lazy init audio context on user action
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setTempo(bpm: number) {
    this.tempo = Math.max(30, Math.min(300, bpm));
    if (this.isRunning) {
      this.restart();
    }
  }

  public setTimeSignature(beats: number) {
    this.beatsPerBar = beats;
    this.currentBeat = 0;
  }

  public setOnBeat(cb: (beat: number) => void) {
    this.onBeatCallback = cb;
  }

  private playClick(isAccent: boolean) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // High accent tone on beat 1 (1200Hz vs 800Hz)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(isAccent ? 0.4 : 0.25, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  private tick = () => {
    if (!this.isRunning) return;

    const isAccent = this.currentBeat === 0;
    this.playClick(isAccent);

    if (this.onBeatCallback) {
      this.onBeatCallback(this.currentBeat);
    }

    this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;

    const intervalMs = (60 / this.tempo) * 1000;
    this.timerId = window.setTimeout(this.tick, intervalMs);
  };

  public start() {
    this.initAudio();
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentBeat = 0;
    this.tick();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentBeat = 0;
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  private restart() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    const intervalMs = (60 / this.tempo) * 1000;
    this.timerId = window.setTimeout(this.tick, intervalMs);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Tap Tempo Helper
export class TapTempoCalculator {
  private taps: number[] = [];

  public tap(): number | null {
    const now = Date.now();
    // Clear taps if more than 2.5 seconds since last tap
    if (this.taps.length > 0 && now - this.taps[this.taps.length - 1] > 2500) {
      this.taps = [];
    }

    this.taps.push(now);
    if (this.taps.length > 5) {
      this.taps.shift();
    }

    if (this.taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < this.taps.length; i++) {
        intervals.push(this.taps[i] - this.taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgInterval);
      return Math.max(40, Math.min(260, bpm));
    }
    return null;
  }

  public reset() {
    this.taps = [];
  }
}
