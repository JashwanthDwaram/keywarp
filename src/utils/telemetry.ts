import { track } from '@vercel/analytics';

export interface TestCompletedMetrics {
  mode: string;
  difficulty: string;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  durationSeconds: number;
  isDisqualified: boolean;
}

export function trackTestCompleted(metrics: TestCompletedMetrics): void {
  try {
    track('test_completed', {
      mode: metrics.mode,
      difficulty: metrics.difficulty,
      net_wpm: Math.round(metrics.netWpm),
      gross_wpm: Math.round(metrics.grossWpm),
      accuracy: Math.round(metrics.accuracy),
      duration_sec: Math.round(metrics.durationSeconds),
      disqualified: metrics.isDisqualified ? 'yes' : 'no'
    });
  } catch {
    // Telemetry failover
  }
}

export function trackTabChange(tab: 'arena' | 'coach' | 'analytics'): void {
  try {
    track('tab_switched', { tab });
  } catch {}
}

export function trackThemeChange(themeId: string): void {
  try {
    track('theme_changed', { theme: themeId });
  } catch {}
}

export function trackSoundProfileChange(profile: string): void {
  try {
    track('sound_profile_changed', { profile });
  } catch {}
}

export function trackCoachDrillApplied(): void {
  try {
    track('coach_drill_applied');
  } catch {}
}

export function trackTourCompleted(): void {
  try {
    track('tour_completed');
  } catch {}
}

export function trackDataExport(format: 'json' | 'csv', count: number): void {
  try {
    track('data_exported', { format, count });
  } catch {}
}

export function trackDataImport(format: string, count: number): void {
  try {
    track('data_imported', { format, count });
  } catch {}
}
