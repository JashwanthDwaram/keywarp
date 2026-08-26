/**
 * Challenge Link Encoder/Decoder & Weak Words Vault Manager
 */

export interface ChallengePayload {
  text: string;
  wpm: number;
  mode: string;
}

const WEAK_WORDS_KEY = 'typepulse_weak_words';

// Create a shareable challenge URL with base64 encoded payload
export function generateChallengeUrl(text: string, wpm: number, mode: string): string {
  try {
    const payload: ChallengePayload = { text, wpm, mode };
    const json = JSON.stringify(payload);
    const b64 = btoa(encodeURIComponent(json));
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('challenge', b64);
    return url.toString();
  } catch {
    return window.location.href;
  }
}

// Decode challenge payload from URL search params
export function decodeChallengeUrl(): ChallengePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const challengeStr = params.get('challenge');
    if (!challengeStr) return null;

    const json = decodeURIComponent(atob(challengeStr));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.text === 'string' && typeof parsed.wpm === 'number') {
      return parsed;
    }
  } catch {
    // Malformed challenge parameter fallback
  }
  return null;
}

// Weak Words Vault Functions
export function recordWeakWord(word: string): void {
  if (!word || word.length < 2) return;
  const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanWord) return;

  try {
    const existingStr = localStorage.getItem(WEAK_WORDS_KEY);
    const map: Record<string, number> = existingStr ? JSON.parse(existingStr) : {};
    map[cleanWord] = (map[cleanWord] || 0) + 1;
    localStorage.setItem(WEAK_WORDS_KEY, JSON.stringify(map));
  } catch {
    // Storage fallback
  }
}

export function getWeakWordsList(limit: number = 25): string[] {
  try {
    const existingStr = localStorage.getItem(WEAK_WORDS_KEY);
    if (!existingStr) return [];
    const map: Record<string, number> = JSON.parse(existingStr);
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, limit).map(([w]) => w);
  } catch {
    return [];
  }
}

export function getWeakWordsDrill(): string {
  const words = getWeakWordsList(20);
  if (words.length >= 5) {
    // Shuffle and repeat weak words to build a targeted drill
    const shuffled = [...words, ...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 25).join(' ');
  }
  // Default challenging vocabulary if vault is fresh
  return "unprecedented maintenance rhythmically characteristic extraordinary algorithmic philosophy phenomenon psychological simultaneously jurisdiction bureaucratic choreography synchronicity";
}
