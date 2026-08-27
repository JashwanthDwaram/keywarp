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

export type ToolStatus = 'idle' | 'running' | 'success' | 'error';

export interface ToolCall {
  id: string;
  name: string;
  description: string;
  status: ToolStatus;
  inputArgs?: Record<string, any>;
  resultSummary?: string;
  durationMs?: number;
}

export interface ApprovalAction {
  id: string;
  title: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  payloadSummary: string;
  diffCode?: string;
  status: 'pending' | 'approved' | 'rejected';
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
