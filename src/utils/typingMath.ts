/**
 * TypePulse Typing Mathematics and Metric Utilities
 * Implements standard touch-typing formulas with zero distortion and stabilized live HUD metrics.
 */

export interface MetricSnapshot {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  charactersTyped: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  elapsedSeconds: number;
}

export type PerformanceGrade = 'Novice' | 'Intermediate' | 'Advanced' | 'Pro' | 'Master' | 'Grandmaster';

export interface PerformanceRank {
  grade: PerformanceGrade;
  title: string;
  badgeColor: string;
  minWpm: number;
  description: string;
}

export const PERFORMANCE_RANKS: PerformanceRank[] = [
  { grade: 'Grandmaster', title: 'Grandmaster', badgeColor: 'border-accent text-accent', minWpm: 100, description: 'Top 1% world-class typing velocity and flawless muscle memory.' },
  { grade: 'Master', title: 'Master', badgeColor: 'border-ink-100 text-ink-100', minWpm: 80, description: 'Exceptional touch-typing fluency with rapid key transitions.' },
  { grade: 'Pro', title: 'Professional', badgeColor: 'border-ink-100 text-ink-100', minWpm: 60, description: 'High-speed professional velocity for software and knowledge work.' },
  { grade: 'Advanced', title: 'Advanced', badgeColor: 'border-correct text-correct', minWpm: 45, description: 'Solid touch-typing rhythm with above-average accuracy.' },
  { grade: 'Intermediate', title: 'Intermediate', badgeColor: 'border-ink-400 text-ink-400', minWpm: 30, description: 'Developing finger reach coordination and muscle memory.' },
  { grade: 'Novice', title: 'Novice', badgeColor: 'border-incorrect text-incorrect', minWpm: 0, description: 'Foundational stage. Focus on accuracy before pure speed.' },
];

/**
 * Calculates Gross Words Per Minute
 * Formula: (Total Characters Typed / 5) / Time in Minutes
 */
export function calculateGrossWpm(charsTyped: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const gross = (charsTyped / 5) / minutes;
  return Math.max(0, Math.round(gross * 10) / 10);
}

/**
 * Calculates Standard Net Words Per Minute
 * Standard touch-typing definition: (Correct Characters Typed / 5) / Time in Minutes
 */
export function calculateNetWpm(correctChars: number, _errors: number = 0, elapsedSeconds: number = 0.1): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const net = (correctChars / 5) / minutes;
  return Math.max(0, Math.round(net * 10) / 10);
}

/**
 * Calculates a calm, stabilized real-time WPM metric for live HUD display.
 * Applies a gentle warmup ramp in the first 1.5 seconds and exponential moving average (EMA)
 * to prevent jarring digit jitter and early divisor instability.
 */
export function calculateSmoothedWpm(
  currentRawWpm: number,
  previousSmoothedWpm: number,
  elapsedSeconds: number,
  smoothingFactor: number = 0.35
): number {
  if (elapsedSeconds <= 0) return 0;

  // During the first 1.2s, ramp up smoothly to avoid initial 1-character 150+ WPM spike
  let targetWpm = currentRawWpm;
  if (elapsedSeconds < 1.2) {
    const rampRatio = Math.min(1, Math.max(0.15, elapsedSeconds / 1.2));
    targetWpm = currentRawWpm * rampRatio;
  }

  // If starting from 0, initialize smoothly
  if (previousSmoothedWpm === 0) {
    return Math.round(targetWpm);
  }

  // Exponential Moving Average: display = alpha * target + (1 - alpha) * prev
  const smoothed = (smoothingFactor * targetWpm) + ((1 - smoothingFactor) * previousSmoothedWpm);
  return Math.round(smoothed);
}

/**
 * Calculates Keystroke Accuracy Percentage
 * Formula: (Correct Keystrokes / Total Keystrokes) * 100%
 */
export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  const acc = (correctKeystrokes / totalKeystrokes) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

/**
 * Derives Performance Rank from Net WPM and Accuracy
 */
export function getPerformanceRank(netWpm: number, accuracy: number): PerformanceRank {
  // If accuracy is below 85%, step down by one tier
  const adjustedWpm = accuracy < 85 ? Math.max(0, netWpm - 15) : netWpm;
  for (const rank of PERFORMANCE_RANKS) {
    if (adjustedWpm >= rank.minWpm) {
      return rank;
    }
  }
  return PERFORMANCE_RANKS[PERFORMANCE_RANKS.length - 1];
}

/**
 * Evaluates typing pace description string
 */
export function getPaceDescription(wpm: number): string {
  if (wpm >= 100) return 'Godspeed';
  if (wpm >= 80) return 'Hypersonic';
  if (wpm >= 60) return 'Flow State';
  if (wpm >= 40) return 'Steady Cadence';
  if (wpm >= 20) return 'Warming Up';
  return 'Ready';
}
