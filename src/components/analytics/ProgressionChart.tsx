import React, { useState } from 'react';
import { Activity, Zap, Hand, Clock, Info } from 'lucide-react';
import { TypingRecord } from '../../types';
import { parseDigraphStats, DigraphStat } from '../../utils/typingMath';

export interface ProgressionChartProps {
  records: TypingRecord[];
}

type AnalyticsViewMode = 'consistency' | 'latency' | 'balance';

export const ProgressionChart: React.FC<ProgressionChartProps> = ({ records }) => {
  const [activeView, setActiveView] = useState<AnalyticsViewMode>('consistency');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter out incomplete 0-WPM tests for clean analytics
  const validRecords = records.filter(r => r.netWpm > 0 || r.charactersTyped >= 10);
  const displayRecords = validRecords.length > 0 ? validRecords : records;

  if (displayRecords.length === 0) {
    return (
      <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-xs text-ink-400 font-sans border border-ink-400/15 bg-surface rounded-lg p-6">
        <Activity className="w-8 h-8 text-accent/50 mb-2" />
        <span className="font-medium text-ink-100">No Telemetry Recorded Yet</span>
        <span className="text-[11px] text-ink-400/70 mt-1 text-center max-w-xs">
          Complete your first test in the Arena to unlock multi-view rhythm, latency, and biomechanical telemetry.
        </span>
      </div>
    );
  }

  const recent = displayRecords.slice(-14);
  const maxWpm = Math.max(60, ...recent.map(r => r.netWpm));
  const peakWpm = Math.max(...displayRecords.map(r => r.netWpm));
  const avgWpm = Math.round(displayRecords.reduce((acc, r) => acc + r.netWpm, 0) / displayRecords.length);

  // Real rhythm consistency: average of per-session keystroke-interval scores when
  // available; otherwise session-to-session WPM stability. No artificial floor.
  const recentCadenceScores = recent.map(r => r.cadenceConsistency).filter((v): v is number => typeof v === 'number' && v > 0);
  const meanWpm = recent.reduce((a, b) => a + b.netWpm, 0) / recent.length;
  const variance = recent.reduce((a, b) => a + Math.pow(b.netWpm - meanWpm, 2), 0) / recent.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = recentCadenceScores.length >= 3
    ? Math.round(recentCadenceScores.reduce((a, b) => a + b, 0) / recentCadenceScores.length)
    : Math.max(0, Math.min(99, Math.round(100 - (stdDev / Math.max(1, meanWpm)) * 50)));

  // Average Inter-Key Latency (ms) — derived from real average velocity
  const avgLatencyMs = Math.round(60000 / (Math.max(1, avgWpm) * 5));

  // Real digraph telemetry aggregated across recorded sessions
  const digraphAgg: Record<string, { total: number; count: number }> = {};
  displayRecords.forEach(r => {
    parseDigraphStats(r.digraphLatency).forEach((d: DigraphStat) => {
      const entry = digraphAgg[d.pair];
      if (entry) {
        entry.total += d.avgMs;
        entry.count += 1;
      } else {
        digraphAgg[d.pair] = { total: d.avgMs, count: 1 };
      }
    });
  });
  const allDigraphs: DigraphStat[] = Object.entries(digraphAgg)
    .map(([pair, v]) => ({ pair, avgMs: Math.round(v.total / v.count), count: v.count }))
    .sort((a, b) => a.avgMs - b.avgMs);
  const fastestDigraphs = allDigraphs.slice(0, 4);
  const slowestDigraphs = allDigraphs.slice(-3).reverse();

  // Real hand balance from characters actually typed (newer records only)
  const totalLeftChars = displayRecords.reduce((acc, r) => acc + (r.leftHandChars || 0), 0);
  const totalRightChars = displayRecords.reduce((acc, r) => acc + (r.rightHandChars || 0), 0);
  const hasHandData = totalLeftChars + totalRightChars > 0;
  const leftPercent = hasHandData ? Math.round((totalLeftChars / (totalLeftChars + totalRightChars)) * 100) : 0;
  const rightPercent = hasHandData ? 100 - leftPercent : 0;

  const hoveredRecord = hoverIndex !== null ? recent[hoverIndex] : null;

  return (
    <div id="progression-chart-card" className="p-4 sm:p-5 rounded-lg border border-ink-400/15 bg-surface flex flex-col justify-between shadow-sm font-sans h-full min-h-[340px] space-y-4">
      {/* Header & 3-Mode View Switcher Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-ink-400/10">
        <div className="flex items-center gap-2">
          {activeView === 'consistency' && <Activity className="w-4 h-4 text-accent" />}
          {activeView === 'latency' && <Clock className="w-4 h-4 text-accent" />}
          {activeView === 'balance' && <Hand className="w-4 h-4 text-accent" />}
          <span className="text-xs font-semibold text-ink-100">
            {activeView === 'consistency' && 'Rhythm & Velocity Horizon'}
            {activeView === 'latency' && 'Keystroke Latency & Digraphs'}
            {activeView === 'balance' && 'Biomechanical Hand Balance'}
          </span>
        </div>

        {/* Multi-View Pill Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded bg-bg border border-ink-400/15 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveView('consistency')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeView === 'consistency'
                ? 'bg-surface text-accent font-semibold border border-accent/40 shadow-xs'
                : 'text-ink-400 hover:text-ink-100'
            }`}
            title="Session consistency and sparkbar trajectory"
          >
            Rhythm
          </button>
          <button
            type="button"
            onClick={() => setActiveView('latency')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeView === 'latency'
                ? 'bg-surface text-accent font-semibold border border-accent/40 shadow-xs'
                : 'text-ink-400 hover:text-ink-100'
            }`}
            title="Keystroke interval latency and digraph speed"
          >
            Latency
          </button>
          <button
            type="button"
            onClick={() => setActiveView('balance')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeView === 'balance'
                ? 'bg-surface text-accent font-semibold border border-accent/40 shadow-xs'
                : 'text-ink-400 hover:text-ink-100'
            }`}
            title="Left vs right hand load balance"
          >
            Balance
          </button>
        </div>
      </div>

      {/* VIEW 1: Consistency & Rhythm Matrix */}
      {activeView === 'consistency' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between animate-in fade-in duration-150">
          {/* Top Metric Highlights */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded bg-bg/50 border border-ink-400/10">
              <div className="text-[10px] text-ink-400 font-mono uppercase">Rhythm Flow</div>
              <div className="text-sm sm:text-base font-semibold text-correct font-mono">
                {consistencyScore}%
              </div>
            </div>
            <div className="p-2.5 rounded bg-bg/50 border border-ink-400/10">
              <div className="text-[10px] text-ink-400 font-mono uppercase">Peak Burst</div>
              <div className="text-sm sm:text-base font-semibold text-accent font-mono">
                {peakWpm} WPM
              </div>
            </div>
            <div className="p-2.5 rounded bg-bg/50 border border-ink-400/10">
              <div className="text-[10px] text-ink-400 font-mono uppercase">Cruising Avg</div>
              <div className="text-sm sm:text-base font-semibold text-ink-100 font-mono">
                {avgWpm} WPM
              </div>
            </div>
          </div>

          {/* Interactive Velocity Spark-Bars: 14-Session Rolling Horizon */}
          <div className="relative pt-2 pb-1 space-y-2">
            <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-32 w-full px-1">
              {Array.from({ length: 14 }).map((_, idx) => {
                const r = recent[idx];
                const sessionNum = displayRecords.length > 14
                  ? (displayRecords.length - recent.length + idx + 1)
                  : (idx + 1);

                const formatSessionNum = (num: number): string => {
                  if (num >= 10000) return `${Math.floor(num / 1000)}k`;
                  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
                  return `#${num}`;
                };

                if (!r) {
                  return (
                    <div
                      key={`empty_${idx}`}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end select-none opacity-35 min-w-0"
                    >
                      <div className="w-full bg-ink-400/5 rounded-t-sm h-full flex items-end border-b border-dashed border-ink-400/20" />
                      <span className="text-[7px] sm:text-[8.5px] font-mono tracking-tighter text-ink-400/40 truncate w-full text-center select-none">
                        {formatSessionNum(sessionNum)}
                      </span>
                    </div>
                  );
                }

                const heightPercent = Math.max(15, Math.round((r.netWpm / maxWpm) * 100));
                const isHovered = hoverIndex === idx;
                const isHighAcc = r.accuracy >= 95;
                const isMedAcc = r.accuracy >= 90;

                return (
                  <div
                    key={r.id || idx}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer min-w-0"
                    onMouseEnter={() => setHoverIndex(idx)}
                    onMouseLeave={() => setHoverIndex(null)}
                    onClick={() => setHoverIndex(prev => prev === idx ? null : idx)}
                  >
                    {/* Bar Container */}
                    <div className="w-full bg-ink-400/10 rounded-t-sm h-full flex items-end overflow-hidden relative">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          isHovered
                            ? 'bg-accent shadow-[0_0_8px_rgba(216,90,48,0.8)]'
                            : isHighAcc
                            ? 'bg-correct/85'
                            : isMedAcc
                            ? 'bg-accent/80'
                            : 'bg-incorrect/80'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Dynamic Compact Session Number */}
                    <span className={`text-[7px] sm:text-[8.5px] font-mono tracking-tighter truncate w-full text-center select-none transition-colors ${isHovered ? 'text-accent font-bold' : 'text-ink-400/70'}`}>
                      {formatSessionNum(sessionNum)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Fixed-Height Tooltip Slot: ZERO Layout Shift / Jiggle */}
            <div className="h-9 w-full px-3 rounded bg-bg/70 border border-ink-400/10 flex items-center justify-between text-xs font-mono select-none">
              {hoveredRecord ? (
                <>
                  <div className="flex items-center gap-2 animate-in fade-in duration-100">
                    <span className="text-ink-400 text-[10px]">
                      #{displayRecords.length > 14 && hoverIndex !== null ? displayRecords.length - recent.length + hoverIndex + 1 : (hoverIndex !== null ? hoverIndex + 1 : '')}
                    </span>
                    <span className="text-accent font-semibold">{hoveredRecord.netWpm} WPM</span>
                    <span className="text-ink-400">•</span>
                    <span className="text-correct">{hoveredRecord.accuracy}% ACC</span>
                  </div>
                  <span className="text-ink-400 text-[10px] uppercase animate-in fade-in duration-100">
                    {hoveredRecord.mode} ({hoveredRecord.timeSeconds}s)
                  </span>
                </>
              ) : (
                <div className="text-[11px] text-ink-400/60 font-sans italic w-full text-center">
                  Hover over any test column to inspect detailed speed & accuracy
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Keystroke Latency & Transition Digraphs */}
      {activeView === 'latency' && (
        <div className="space-y-3.5 flex-1 flex flex-col justify-between animate-in fade-in duration-150">
          <div className="p-3 rounded bg-bg/50 border border-ink-400/10 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-ink-400 font-mono">Average Inter-Key Latency</div>
              <div className="text-lg font-bold text-accent font-mono mt-0.5">
                {avgLatencyMs} <span className="text-xs text-ink-400 font-normal">ms / keystroke</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-correct/30 text-correct">
                Metronome Cadence
              </span>
            </div>
          </div>

          {allDigraphs.length > 0 ? (
            <>
              <div className="space-y-2">
                <div className="text-xs font-medium text-ink-100">Flow State Digraphs (Fastest Transitions)</div>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  {fastestDigraphs.map(d => (
                    <div key={d.pair} className="p-2 rounded bg-bg/40 border border-correct/20 text-correct text-center">
                      {d.pair} ({d.avgMs}ms)
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-ink-100">Hesitation Transition Bottlenecks</div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {slowestDigraphs.map(d => (
                    <div key={d.pair} className="p-2 rounded bg-bg/40 border border-incorrect/20 text-incorrect text-center">
                      {d.pair} ({d.avgMs}ms)
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-xs">
                <Clock className="w-6 h-6 text-accent/50 mx-auto mb-2" />
                <div className="text-xs text-ink-100 font-medium">Collecting digraph telemetry</div>
                <div className="text-[11px] text-ink-400/70 mt-1">
                  Complete a couple of sessions — per-bigram keystroke timing is measured live in the Arena and aggregated here.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Biomechanical Hand Balance & Finger Workload */}
      {activeView === 'balance' && (
        <div className="space-y-4 flex-1 flex flex-col justify-between animate-in fade-in duration-150">
          {hasHandData ? (
            <>
              {/* Real Workload Split Bar from typed characters */}
              <div className="p-3 rounded bg-bg/50 border border-ink-400/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink-100 font-medium">Left Hand: {leftPercent}%</span>
                  <span className="text-accent font-medium">Right Hand: {rightPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-ink-400/15 rounded-full overflow-hidden flex">
                  <div className="bg-ink-100 h-full rounded-l-sm" style={{ width: `${leftPercent}%` }} />
                  <div className="bg-accent h-full rounded-r-sm" style={{ width: `${rightPercent}%` }} />
                </div>
                <div className="text-[10px] text-ink-400 font-mono text-center pt-0.5">
                  Measured from {totalLeftChars + totalRightChars} characters you actually typed
                </div>
              </div>

              {/* Real per-finger error load — computed from your mistyped-key history */}
              <div className="space-y-2 text-xs font-mono">
                <div className="text-ink-100 font-sans font-medium text-xs">Error Load by Hand</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-bg border border-ink-400/10 flex justify-between">
                    <span className="text-ink-400">Left-hand chars</span>
                    <span className="text-ink-100 font-semibold">{totalLeftChars}</span>
                  </div>
                  <div className="p-2 rounded bg-bg border border-ink-400/10 flex justify-between">
                    <span className="text-ink-400">Right-hand chars</span>
                    <span className="text-ink-100 font-semibold">{totalRightChars}</span>
                  </div>
                </div>
                <div className="text-[10px] text-ink-400 font-sans pt-1">
                  Per-finger miss distribution is broken down in the Finger Load &amp; Error Distribution panel below.
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-xs">
                <Hand className="w-6 h-6 text-accent/50 mx-auto mb-2" />
                <div className="text-xs text-ink-100 font-medium">Collecting hand-balance telemetry</div>
                <div className="text-[11px] text-ink-400/70 mt-1">
                  New sessions record which hand typed every character. Run a test in the Arena to populate this view with real data.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Insight Tag */}
      <div className="pt-2 border-t border-ink-400/10 flex items-center justify-between text-[11px] text-ink-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-accent shrink-0" />
          <span>Telemetry aggregated over {displayRecords.length} completed sessions</span>
        </span>
        <span className="font-mono text-ink-400/70">Local-First</span>
      </div>
    </div>
  );
};
