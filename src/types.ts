export interface TypingRecord {
  id: string;
  timestamp: string;
  mode: 'Passage' | 'Sprint' | 'Time' | 'Words' | 'Quotes' | 'Code' | 'Procedural' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Quotes' | 'Code' | string;
  passageLength: number;
  charactersTyped: number;
  timeSeconds: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  totalErrors: number;
  mistypedKeys: string;
  isDisqualified?: boolean;
  isSuddenDeathFailed?: boolean;
  /** 0-100 rhythm consistency computed from inter-keystroke intervals (absent on older records) */
  cadenceConsistency?: number;
  /** Compact "th:62;he:71" map of fastest/slowest digraph averages in ms */
  digraphLatency?: string;
  /** Characters typed by each hand, for real hand-balance telemetry */
  leftHandChars?: number;
  rightHandChars?: number;
}

export interface SummaryStats {
  totalSessions: number;
  bestNetWpm: number;
  avgNetWpm: number;
  avgAccuracy: number;
  totalWordsTyped: number;
  totalTimeMin: number;
  improvementWpm: number;
}

export interface GeminiCoachResponse {
  executiveInsight: string;
  entropyDiagnosis: string;
  ngramClusterAnalysis: string;
  estimatedWpmGain: number;
  recommendedDrill: string;
  focusKeys: string[];
  thoughtTrace: string[];
  toolsTelemetry: {
    entropyMetric: string;
    clusterFindings: string;
    curriculumRationale: string;
  };
  isLiveGemini?: boolean;
}
