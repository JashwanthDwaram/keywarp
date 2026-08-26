/**
 * Procedural Web Audio Synthesizer for TypePulse
 * Generates tactile mechanical switch acoustics with zero external audio assets.
 */

export type SoundProfile = 'Thock' | 'Click' | 'Topre' | 'Buckling' | 'Bubble' | 'Silent';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.8;
  private currentProfile: SoundProfile = 'Thock';

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setProfile(profile: SoundProfile): void {
    this.currentProfile = profile;
  }

  public playMetronomeTick(): void {
    if (this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.015);
      gain.gain.setValueAtTime(0.04 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.015);
    } catch {}
  }

  public playStreakChime(tier: number = 1): void {
    if (this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const t = ctx.currentTime;

      const baseNotes = tier >= 3 
        ? [659.25, 830.61, 987.77, 1318.5] // E5, G#5, B5, E6
        : tier === 2 
        ? [587.33, 739.99, 880.0, 1174.66] // D5, F#5, A5, D6
        : [523.25, 659.25, 783.99]; // C5, E5, G5

      baseNotes.forEach((freq, i) => {
        if (!ctx || !this.masterGain) return;
        const noteTime = t + i * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.05 * this.volume, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.25);
      });
    } catch {}
  }

  public playKeyClick(charOrSpace?: string, isError = false): void {
    const isSpace = charOrSpace === ' ' || charOrSpace === '[space]';
    this.playKey(this.currentProfile, isSpace, isError);
  }

  public playCompletionChime(): void {
    this.playComplete();
  }

  public playKey(profile: SoundProfile = this.currentProfile, isSpace = false, isError = false): void {
    if (profile === 'Silent' || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;

      const t = ctx.currentTime;

      if (isError) {
        // Error buzz: low sawtooth with fast decay
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
        gain.gain.setValueAtTime(0.08 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.08);
        return;
      }

      if (profile === 'Thock') {
        // Deep mechanical switch "thock"
        const baseFreq = isSpace ? 110 : 160 + (Math.random() * 25 - 12);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, t + 0.045);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, t);

        gain.gain.setValueAtTime((isSpace ? 0.16 : 0.12) * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.045);
        return;
      }

      if (profile === 'Click') {
        // Crisp mechanical click (Cherry MX Blue)
        const baseFreq = isSpace ? 900 : 1300 + (Math.random() * 300 - 150);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, t + 0.025);

        gain.gain.setValueAtTime(0.06 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.025);
        return;
      }

      if (profile === 'Topre') {
        // Electrostatic capacitive switch: muted rubber-dome tactile thud
        const baseFreq = isSpace ? 140 : 210 + (Math.random() * 20 - 10);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.035);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);

        gain.gain.setValueAtTime(0.14 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.035);
        return;
      }

      if (profile === 'Buckling') {
        // Vintage IBM Model M Buckling Spring: metallic ping + crisp stroke
        const baseFreq = isSpace ? 1100 : 1600 + (Math.random() * 200 - 100);
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2400, t);
        osc2.frequency.exponentialRampToValueAtTime(600, t + 0.02);

        gain.gain.setValueAtTime(0.04 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.03);
        osc2.stop(t + 0.03);
        return;
      }

      if (profile === 'Bubble') {
        // Soft organic bubble pop
        const baseFreq = isSpace ? 360 : 500 + Math.random() * 120;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.035);

        gain.gain.setValueAtTime(0.07 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.035);
      }
    } catch {}
  }

  public playComplete(): void {
    if (this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx || !this.masterGain) return;
      const t = ctx.currentTime;

      // Harmonious completion arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        if (!ctx || !this.masterGain) return;
        const noteTime = t + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.06 * this.volume, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.35);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
