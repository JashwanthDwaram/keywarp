import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Zap, ChevronDown, ChevronUp, Play, RotateCcw, ShieldCheck, Target, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { TypingRecord, GeminiCoachResponse } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { fetchGeminiCoachInsight, generateProceduralHeuristicInsight, getCachedGeminiResponse } from '../../utils/geminiCoach';

export interface AICoachLabProps {
  records: TypingRecord[];
  onApplyDrill: (customText: string) => void;
}

export const AICoachLab: React.FC<AICoachLabProps> = ({
  records,
  onApplyDrill
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Initialize with cached Live Gemini response or procedural heuristic (0ms instant display)
  const [coachResponse, setCoachResponse] = useState<GeminiCoachResponse>(() => {
    const cached = getCachedGeminiResponse();
    if (cached && records.length > 0) return cached;
    return generateProceduralHeuristicInsight(records);
  });
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Latest session summary
  const latestRecord = useMemo(() => {
    return records.length > 0 ? records[records.length - 1] : null;
  }, [records]);

  // Run Gemini analysis in background
  const runDiagnostics = useCallback(async () => {
    setIsAnalyzing(true);
    const { response, error } = await fetchGeminiCoachInsight(records);
    if (response) {
      setCoachResponse(response);
    }
    setDiagnosticError(error || null);
    setIsAnalyzing(false);
  }, [records]);

  // Run background sync on mount and when records update
  useEffect(() => {
    runDiagnostics();
  }, [records, runDiagnostics]);

  const handleStartDrill = () => {
    if (coachResponse?.recommendedDrill) {
      onApplyDrill(coachResponse.recommendedDrill);
    }
  };

  const focusKeys = coachResponse?.focusKeys || ['t', 'i', 'o', 'r'];
  const estimatedGain = coachResponse?.estimatedWpmGain || 6.5;
  const currentModuleNumber = (records.length % 5) + 1;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 font-sans select-none animate-in fade-in duration-200">
      {/* 1. Recent Completed Drill Banner */}
      {latestRecord ? (
        <div className="p-3.5 rounded-lg border border-correct/30 bg-surface flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-correct shrink-0" />
            <div>
              <span className="font-medium text-ink-100">Last Session Calibrated:</span>{' '}
              <span className="text-ink-400 font-mono">
                {latestRecord.netWpm} WPM • {latestRecord.accuracy}% accuracy ({latestRecord.charactersTyped} chars)
              </span>
            </div>
          </div>
          <Badge variant="emerald" size="sm">
            Telemetry Synced
          </Badge>
        </div>
      ) : null}

      {/* Diagnostic Error Notice (If Live AI had connection trouble) */}
      {diagnosticError && !coachResponse.isLiveGemini ? (
        <div className="p-3 rounded border border-accent/40 bg-surface flex items-start gap-2.5 text-xs font-mono text-ink-100/90 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <div className="font-semibold text-accent">Live Gemini Diagnostics Notice:</div>
            <div className="text-ink-400 break-all">{diagnosticError}</div>
          </div>
        </div>
      ) : null}

      {/* 2. Hero Personal Coach Card */}
      <div id="coach-diagnostics-card" className="rounded-lg border border-ink-400/15 bg-surface p-6 sm:p-7 space-y-5 shadow-sm">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-ink-100">
                  AI Typing Coach
                </h2>
                <Badge
                  variant={isAnalyzing && !coachResponse.isLiveGemini ? 'amber' : coachResponse.isLiveGemini ? 'emerald' : 'slate'}
                  size="sm"
                >
                  {isAnalyzing && !coachResponse.isLiveGemini ? (
                    <span className="flex items-center gap-1 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Connecting…
                    </span>
                  ) : coachResponse.isLiveGemini ? (
                    '✨ Live AI'
                  ) : (
                    'Offline Engine'
                  )}
                </Badge>
              </div>
              <p className="text-xs text-ink-400">
                Level {currentModuleNumber} Progressive Muscle-Memory Program
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={runDiagnostics}
            disabled={isAnalyzing}
            isLoading={isAnalyzing}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {isAnalyzing ? 'Analyzing…' : 'Generate new drill'}
          </Button>
        </div>

        {/* Coach Executive Briefing */}
        <div className="space-y-4 pt-1">
          <p className="text-sm sm:text-[15px] text-ink-100/90 leading-relaxed font-normal">
            {coachResponse.executiveInsight}
          </p>

          {/* Metric Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-ink-400/10">
            {/* Estimated Gain */}
            <div className="flex items-center gap-3 p-3 rounded bg-bg/50 border border-ink-400/10">
              <div className="w-8 h-8 rounded bg-correct/10 border border-correct/30 flex items-center justify-center text-correct shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-ink-400 uppercase tracking-wider font-mono">
                  Estimated Speed Gain
                </div>
                <div className="text-sm sm:text-base font-semibold text-correct font-mono">
                  +{estimatedGain} WPM
                </div>
              </div>
            </div>

            {/* Diagnosed Friction Keys */}
            <div className="flex items-center gap-3 p-3 rounded bg-bg/50 border border-ink-400/10">
              <div className="w-8 h-8 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-ink-400 uppercase tracking-wider font-mono">
                  Target Friction Keys
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 overflow-x-auto">
                  {focusKeys.map((k, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.2 rounded bg-surface border border-accent/40 text-ink-100 font-mono text-xs font-medium"
                    >
                      {k === ' ' || k === '[space]' ? 'space' : k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured Action: Prescribed Practice Workout */}
      {coachResponse.recommendedDrill ? (
        <div className="rounded-lg border border-accent/40 bg-surface p-6 sm:p-7 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-wider font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Training Module #{currentModuleNumber}: Targeted Reach Remediation</span>
            </div>
            <span className="text-xs text-ink-400 font-mono">
              ~45s drill
            </span>
          </div>

          {/* Drill Passage Preview */}
          <div className="p-4 rounded bg-bg border border-ink-400/10 font-mono text-sm sm:text-base text-ink-100/90 leading-relaxed">
            “{coachResponse.recommendedDrill}”
          </div>

          {/* Action Launch CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-ink-400">
              Targeting keys <span className="font-mono text-ink-100 font-medium">[{focusKeys.join(', ')}]</span> to eliminate transition hesitations.
            </p>

            <button
              type="button"
              onClick={handleStartDrill}
              className="flex items-center gap-2 px-5 py-2.5 rounded bg-accent text-accent-contrast font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Module #{currentModuleNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* 4. Subtle Technical Diagnostics Accordion */}
      <div className="rounded border border-ink-400/10 bg-surface/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(prev => !prev)}
          className="w-full flex items-center justify-between p-3 text-xs text-ink-400 hover:text-ink-100 transition-colors cursor-pointer"
        >
          <span>View technical kinesiology & entropy telemetry</span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-4 pt-1 border-t border-ink-400/10 space-y-3 text-xs font-mono animate-in fade-in">
            {/* Entropy Metric */}
            <div className="space-y-1">
              <span className="text-ink-400">Latency Entropy Variance:</span>
              <p className="text-ink-100 bg-bg p-2.5 rounded border border-ink-400/10">
                {coachResponse.toolsTelemetry?.entropyMetric || coachResponse.entropyDiagnosis}
              </p>
            </div>

            {/* N-Gram Clusters */}
            <div className="space-y-1">
              <span className="text-ink-400">Transition Bottleneck Analysis:</span>
              <p className="text-ink-100 bg-bg p-2.5 rounded border border-ink-400/10">
                {coachResponse.toolsTelemetry?.clusterFindings || coachResponse.ngramClusterAnalysis}
              </p>
            </div>

            {/* Diagnostic Reasoning Steps */}
            {coachResponse.thoughtTrace && coachResponse.thoughtTrace.length > 0 ? (
              <div className="space-y-1">
                <span className="text-ink-400">Diagnostic Synthesis Steps:</span>
                <div className="space-y-1 bg-bg p-2.5 rounded border border-ink-400/10 text-ink-400/80">
                  {coachResponse.thoughtTrace.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-accent">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
