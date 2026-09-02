/**
 * KeyWarp Typing Mathematics and Metric Utilities
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

/**
 * Computes a 0-100 cadence consistency score from inter-keystroke intervals (ms).
 * 100 = perfectly even rhythm; score falls as interval variability (coefficient of
 * variation) grows. Intervals above `maxIntervalMs` (long pauses/thinking gaps) are
 * ignored so natural hesitation between words doesn't dominate the metric.
 */
export function calculateCadenceConsistency(intervals: number[], maxIntervalMs: number = 1500): number {
  const samples = intervals.filter(ms => ms > 0 && ms < maxIntervalMs);
  if (samples.length < 5) return 0;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean <= 0) return 0;
  const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  const score = Math.round(Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100)));
  return score;
}

export interface DigraphStat {
  pair: string;
  avgMs: number;
  count: number;
}

/** Internal accumulator shape for per-bigram timing sums. */
export type DigraphTimings = Record<string, { sum: number; count: number }>;

export const recordDigraphTiming = (timings: DigraphTimings, pair: string, intervalMs: number): void => {
  if (!pair || pair.length !== 2) return;
  const entry = timings[pair];
  if (entry) {
    entry.sum += intervalMs;
    entry.count += 1;
  } else {
    timings[pair] = { sum: intervalMs, count: 1 };
  }
};

/**
 * Serializes the fastest `fastLimit` and slowest `slowLimit` digraphs (with at least
 * `minCount` samples) into the compact "th:62;he:71" record format.
 */
export const serializeDigraphStats = (
  timings: DigraphTimings,
  fastLimit: number = 8,
  slowLimit: number = 6,
  minCount: number = 2
): string => {
  const stats: DigraphStat[] = Object.entries(timings)
    .filter(([, v]) => v.count >= minCount)
    .map(([pair, v]) => ({ pair, avgMs: Math.round(v.sum / v.count), count: v.count }))
    .sort((a, b) => a.avgMs - b.avgMs);

  const fastest = stats.slice(0, fastLimit);
  const slowest = stats.slice(-slowLimit);
  const seen = new Set<string>();
  const entries: string[] = [];
  [...fastest, ...slowest].forEach(s => {
    if (!seen.has(s.pair)) {
      seen.add(s.pair);
      entries.push(`${s.pair}:${s.avgMs}`);
    }
  });
  return entries.join(';');
};

/** Parses the compact digraph record format back into stats. */
export const parseDigraphStats = (serialized: string | undefined): DigraphStat[] => {
  if (!serialized || serialized === 'None') return [];
  const stats: DigraphStat[] = [];
  serialized.split(';').forEach(pair => {
    const [p, msStr] = pair.split(':');
    const avgMs = parseInt(msStr, 10);
    if (p && p.length === 2 && !isNaN(avgMs) && avgMs > 0) {
      stats.push({ pair: p, avgMs, count: 1 });
    }
  });
  return stats;
};
