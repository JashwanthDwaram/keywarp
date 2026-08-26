/**
 * Procedural Web Audio Synthesizer for TypePulse
 * Generates tactile mechanical switch acoustics and real-time generative flow soundscapes
 * with ZERO external audio files or network requests.
 */

export type SoundProfile = 'Thock' | 'Click' | 'Topre' | 'Buckling' | 'Bubble' | 'Silent';
export type AmbientSoundscape = 'Off' | 'Drone' | 'Brown' | 'Binaural';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.8;
  private currentProfile: SoundProfile = 'Thock';

  // Ambient Flow Soundscape Nodes
  private ambientSoundscape: AmbientSoundscape = 'Off';
  private ambientVolume: number = 0.3;
  private ambientMasterGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private shimmerGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Ambient channel
        this.ambientMasterGain = this.ctx.createGain();
        this.ambientMasterGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
        this.ambientMasterGain.connect(this.ctx.destination);
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

  public getProfile(): SoundProfile {
    return this.currentProfile;
  }

  public setAmbientVolume(val: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.ambientMasterGain) {
      this.ambientMasterGain.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setAmbientSoundscape(soundscape: AmbientSoundscape): void {
    if (this.ambientSoundscape === soundscape) return;
    this.ambientSoundscape = soundscape;
    this.rebuildAmbientSoundscape();
  }

  public getAmbientSoundscape(): AmbientSoundscape {
    return this.ambientSoundscape;
  }

  private stopAmbientNodes(): void {
    this.ambientOscillators.forEach(node => {
      try {
        if ('stop' in node) node.stop();
        node.disconnect();
      } catch {}
    });
    this.ambientOscillators = [];
  }

  private rebuildAmbientSoundscape(): void {
    this.stopAmbientNodes();
    if (this.ambientSoundscape === 'Off') return;

    const ctx = this.getContext();
    if (!ctx || !this.ambientMasterGain) return;
    const t = ctx.currentTime;

    // Filter Node for dynamic pace modulation
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.Q.setValueAtTime(2.0, t);
    filter.connect(this.ambientMasterGain);
    this.ambientFilter = filter;

    if (this.ambientSoundscape === 'Drone') {
      // Warm Fifth Chord Drone (F2: 87.3Hz, C3: 130.8Hz, G3: 196Hz, D4: 293.6Hz)
      const freqs = [87.31, 130.81, 196.0, 293.66];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), t);

        const oscGain = 0.06 / (i + 1);
        gain.gain.setValueAtTime(oscGain, t);

        osc.connect(gain);
        gain.connect(filter);
        osc.start();
        this.ambientOscillators.push(osc);
      });

      // Shimmer High Overtone layer (activated on high streaks)
      const shimmerOsc = ctx.createOscillator();
      const shimmerG = ctx.createGain();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(587.33, t); // D5
      shimmerG.gain.setValueAtTime(0.001, t);
      shimmerOsc.connect(shimmerG);
      shimmerG.connect(filter);
      shimmerOsc.start();
      this.shimmerGain = shimmerG;
      this.ambientOscillators.push(shimmerOsc);
    } else if (this.ambientSoundscape === 'Brown') {
      // Velvet Brown Noise generator via procedural buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);

      noiseSource.connect(gain);
      gain.connect(filter);
      noiseSource.start();
      this.ambientOscillators.push(noiseSource);
    } else if (this.ambientSoundscape === 'Binaural') {
      // 432Hz Alpha Focus (432Hz Left, 440Hz Right = 8Hz binaural wave)
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(216, t); // 216Hz Fundamental
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(224, t); // 224Hz (8Hz Alpha Beat)

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gain);
      gain.connect(filter);

      oscL.start();
      oscR.start();
      this.ambientOscillators.push(oscL);
      this.ambientOscillators.push(oscR);
    }
  }

  /**
   * Modulates the flow soundscape in real-time based on live WPM velocity and streak.
   */
  public updateCadenceModulation(wpm: number, streak: number): void {
    if (this.ambientSoundscape === 'Off' || !this.ambientFilter || !this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Filter opens from 200Hz up to 850Hz as WPM goes from 0 to 120
      const targetCutoff = Math.min(900, 200 + Math.max(0, wpm * 6.5));
      this.ambientFilter.frequency.setTargetAtTime(targetCutoff, t, 0.25);

      // Shimmer layer emerges during high velocity streaks (50+ streak)
      if (this.shimmerGain) {
        const shimmerTarget = streak >= 50 ? 0.03 : streak >= 25 ? 0.012 : 0.001;
        this.shimmerGain.gain.setTargetAtTime(shimmerTarget, t, 0.4);
      }
    } catch {}
  }

  public resetCadenceModulation(): void {
    if (this.ambientFilter && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.ambientFilter.frequency.setTargetAtTime(200, t, 0.8);
        if (this.shimmerGain) {
          this.shimmerGain.gain.setTargetAtTime(0.001, t, 0.5);
        }
      } catch {}
    }
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
