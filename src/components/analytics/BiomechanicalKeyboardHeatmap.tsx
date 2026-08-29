import React, { useState, useMemo } from 'react';
import { Activity, Calendar, ShieldAlert, Check, Flame, Keyboard } from 'lucide-react';
import { TypingRecord } from '../../types';

export interface BiomechanicalKeyboardHeatmapProps {
  records: TypingRecord[];
}

interface KeyMetadata {
  key: string;
  display: string;
  width?: string;
  finger: string;
  hand: 'left' | 'right' | 'thumb';
}

const KEYBOARD_ROWS: KeyMetadata[][] = [
  [
    { key: '`', display: '`', finger: 'Pinky', hand: 'left' },
    { key: '1', display: '1', finger: 'Pinky', hand: 'left' },
    { key: '2', display: '2', finger: 'Ring', hand: 'left' },
    { key: '3', display: '3', finger: 'Middle', hand: 'left' },
    { key: '4', display: '4', finger: 'Index', hand: 'left' },
    { key: '5', display: '5', finger: 'Index', hand: 'left' },
    { key: '6', display: '6', finger: 'Index', hand: 'right' },
    { key: '7', display: '7', finger: 'Index', hand: 'right' },
    { key: '8', display: '8', finger: 'Middle', hand: 'right' },
    { key: '9', display: '9', finger: 'Ring', hand: 'right' },
    { key: '0', display: '0', finger: 'Pinky', hand: 'right' },
    { key: '-', display: '-', finger: 'Pinky', hand: 'right' },
    { key: '=', display: '=', finger: 'Pinky', hand: 'right' }
  ],
  [
    { key: 'q', display: 'Q', finger: 'Pinky', hand: 'left' },
    { key: 'w', display: 'W', finger: 'Ring', hand: 'left' },
    { key: 'e', display: 'E', finger: 'Middle', hand: 'left' },
    { key: 'r', display: 'R', finger: 'Index', hand: 'left' },
    { key: 't', display: 'T', finger: 'Index', hand: 'left' },
    { key: 'y', display: 'Y', finger: 'Index', hand: 'right' },
    { key: 'u', display: 'U', finger: 'Index', hand: 'right' },
    { key: 'i', display: 'I', finger: 'Middle', hand: 'right' },
    { key: 'o', display: 'O', finger: 'Ring', hand: 'right' },
    { key: 'p', display: 'P', finger: 'Pinky', hand: 'right' },
    { key: '[', display: '[', finger: 'Pinky', hand: 'right' },
    { key: ']', display: ']', finger: 'Pinky', hand: 'right' }
  ],
  [
    { key: 'a', display: 'A', finger: 'Pinky', hand: 'left' },
    { key: 's', display: 'S', finger: 'Ring', hand: 'left' },
    { key: 'd', display: 'D', finger: 'Middle', hand: 'left' },
    { key: 'f', display: 'F', finger: 'Index', hand: 'left' },
    { key: 'g', display: 'G', finger: 'Index', hand: 'left' },
    { key: 'h', display: 'H', finger: 'Index', hand: 'right' },
    { key: 'j', display: 'J', finger: 'Index', hand: 'right' },
    { key: 'k', display: 'K', finger: 'Middle', hand: 'right' },
    { key: 'l', display: 'L', finger: 'Ring', hand: 'right' },
    { key: ';', display: ';', finger: 'Pinky', hand: 'right' },
    { key: "'", display: "'", finger: 'Pinky', hand: 'right' }
  ],
  [
    { key: 'z', display: 'Z', finger: 'Pinky', hand: 'left' },
    { key: 'x', display: 'X', finger: 'Ring', hand: 'left' },
    { key: 'c', display: 'C', finger: 'Middle', hand: 'left' },
    { key: 'v', display: 'V', finger: 'Index', hand: 'left' },
    { key: 'b', display: 'B', finger: 'Index', hand: 'left' },
    { key: 'n', display: 'N', finger: 'Index', hand: 'right' },
    { key: 'm', display: 'M', finger: 'Index', hand: 'right' },
    { key: ',', display: ',', finger: 'Middle', hand: 'right' },
    { key: '.', display: '.', finger: 'Ring', hand: 'right' },
    { key: '/', display: '/', finger: 'Pinky', hand: 'right' }
  ],
  [
    { key: ' ', display: 'Spacebar', width: 'w-56 sm:w-72', finger: 'Thumb', hand: 'thumb' }
  ]
];

function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const BiomechanicalKeyboardHeatmap: React.FC<BiomechanicalKeyboardHeatmapProps> = ({ records }) => {
  const [viewMode, setViewMode] = useState<'keyboard' | 'daily'>('keyboard');
  const [hoveredKey, setHoveredKey] = useState<KeyMetadata | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ label: string; count: number } | null>(null);

  // Aggregate mistakes across all records
  const { mistakeCounts, totalErrors, maxErrorCount } = useMemo(() => {
    const map: Record<string, number> = {};
    let errTotal = 0;

    records.forEach(r => {
      if (r.mistypedKeys && r.mistypedKeys !== 'None') {
        r.mistypedKeys.split(';').forEach(pair => {
          const [k, countStr] = pair.split(':');
          if (k && countStr) {
            const count = parseInt(countStr, 10);
            if (!isNaN(count)) {
              const lower = k.toLowerCase();
              map[lower] = (map[lower] || 0) + count;
              errTotal += count;
            }
          }
        });
      }
    });

    const maxErr = Math.max(1, ...Object.values(map));

    return {
      mistakeCounts: map,
      totalErrors: errTotal,
      maxErrorCount: maxErr
    };
  }, [records]);

  // Daily Streak Buckets (Last 35 days: 5 weeks x 7 days)
  const { dayBuckets, currentStreak, totalDaysActive } = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; label: string; count: number }[] = [];
    const dateCounts: Record<string, number> = {};

    records.forEach(r => {
      if (r.timestamp) {
        const d = new Date(r.timestamp);
        const dStr = toLocalDateStr(d);
        dateCounts[dStr] = (dateCounts[dStr] || 0) + 1;
      }
    });

    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateStr(d);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({
        dateStr,
        label,
        count: dateCounts[dateStr] || 0
      });
    }

    let streak = 0;
    const checkDate = new Date(today);
    let guard = 0;
    while (guard++ < 365) {
      const dStr = toLocalDateStr(checkDate);
      if (dateCounts[dStr] && dateCounts[dStr] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak === 0 && dStr === toLocalDateStr(today)) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yStr = toLocalDateStr(checkDate);
          if (dateCounts[yStr] && dateCounts[yStr] > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return {
      dayBuckets: days,
      currentStreak: streak,
      totalDaysActive: Object.keys(dateCounts).length
    };
  }, [records]);

  const getKeyStyle = (k: KeyMetadata) => {
    const errorCount = mistakeCounts[k.key.toLowerCase()] || 0;
    if (records.length === 0) {
      return 'bg-bg/60 border-ink-400/15 text-ink-400';
    }

    if (errorCount >= 4) {
      return 'bg-incorrect/20 border-incorrect text-incorrect shadow-[0_0_8px_rgba(226,75,74,0.35)] font-bold';
    }
    if (errorCount >= 1) {
      return 'bg-accent/20 border-accent/50 text-accent font-semibold';
    }
    return 'bg-correct/10 border-correct/30 text-correct/90';
  };

  const getDayCellColor = (count: number) => {
    if (count === 0) return 'bg-bg/60 border-ink-400/10 text-transparent';
    if (count === 1) return 'bg-accent/30 border-accent/40 text-ink-100';
    if (count <= 3) return 'bg-accent/60 border-accent/70 text-ink-100';
    return 'bg-accent border-accent text-accent-contrast font-bold';
  };

  return (
    <div id="analytics-heatmap-card" className="rounded-lg border border-ink-400/15 bg-surface p-4 sm:p-5 space-y-4 font-sans select-none">
      {/* Top Header with Switchable Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-400/10 pb-3">
        <div className="flex items-center gap-2">
          {viewMode === 'keyboard' ? (
            <Keyboard className="w-4 h-4 text-accent" />
          ) : (
            <Calendar className="w-4 h-4 text-accent" />
          )}
          <h3 className="text-xs font-semibold text-ink-100 font-sans tracking-wide uppercase">
            {viewMode === 'keyboard' ? 'Biomechanical Key Heatmap' : 'Daily Practice Volume'}
          </h3>
        </div>

        {/* Mode Toggle Pill */}
        <div className="flex items-center p-0.5 rounded-lg bg-bg border border-ink-400/15 text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode('keyboard')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'keyboard'
                ? 'bg-surface text-accent font-medium shadow-xs border border-ink-400/15'
                : 'text-ink-400 hover:text-ink-100'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'daily'
                ? 'bg-surface text-accent font-medium shadow-xs border border-ink-400/15'
                : 'text-ink-400 hover:text-ink-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Streak</span>
          </button>
        </div>
      </div>

      {viewMode === 'keyboard' ? (
        /* Keyboard Heatmap View */
        <div className="space-y-3">
          <div className="overflow-x-auto py-1 scrollbar-none">
            <div className="min-w-[460px] max-w-2xl mx-auto space-y-1 select-none font-mono">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center justify-center gap-1">
                  {row.map((k) => {
                    const errors = mistakeCounts[k.key.toLowerCase()] || 0;
                    const isHovered = hoveredKey?.key === k.key;

                    return (
                      <div
                        key={k.key}
                        onMouseEnter={() => setHoveredKey(k)}
                        onMouseLeave={() => setHoveredKey(null)}
                        onClick={() => setHoveredKey(prev => prev?.key === k.key ? null : k)}
                        className={`h-9 sm:h-10 rounded border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          k.width ? k.width : 'w-7 sm:w-9'
                        } ${getKeyStyle(k)} ${
                          isHovered ? 'scale-105 z-10 ring-1 ring-accent shadow-md' : ''
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs font-semibold leading-none">{k.display}</span>
                        {errors > 0 && (
                          <span className="text-[8px] sm:text-[9px] font-mono leading-none opacity-80 mt-0.5">
                            {errors}
                          </span>
                        )}
                        {(k.key === 'f' || k.key === 'j') && (
                          <span className="w-2 h-0.5 rounded-full bg-ink-400/50 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Inspection Bar */}
          <div className="h-9 w-full px-3 rounded bg-bg/80 border border-ink-400/10 flex items-center justify-between text-xs font-mono select-none">
            {hoveredKey ? (
              <div className="flex items-center justify-between w-full animate-in fade-in duration-100">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold">Key [{hoveredKey.display}]</span>
                  <span className="text-ink-400">•</span>
                  <span className="text-ink-100">
                    {hoveredKey.hand === 'thumb' ? 'Dual Thumbs' : `${hoveredKey.hand === 'left' ? 'Left' : 'Right'} ${hoveredKey.finger}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {mistakeCounts[hoveredKey.key.toLowerCase()] ? (
                    <span className="text-incorrect font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {mistakeCounts[hoveredKey.key.toLowerCase()]} mistakes logged
                    </span>
                  ) : (
                    <span className="text-correct flex items-center gap-1">
                      <Check className="w-3 h-3" /> Clean reach (0 errors)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-[11px] text-ink-400 font-sans">
                <span>Hover any key to inspect biomechanical reach & error rate</span>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="flex items-center gap-1 text-correct"><span className="w-2 h-2 rounded bg-correct/40 inline-block" /> Clean</span>
                  <span className="flex items-center gap-1 text-accent"><span className="w-2 h-2 rounded bg-accent/40 inline-block" /> 1-3 Errors</span>
                  <span className="flex items-center gap-1 text-incorrect"><span className="w-2 h-2 rounded bg-incorrect inline-block" /> 4+ Bottleneck</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Daily Practice Streak View */
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1 text-accent font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>{currentStreak} day streak</span>
            </div>
            <span className="text-ink-400">{totalDaysActive} active practice days</span>
          </div>

          {/* Clean GitHub-Style Square Matrix */}
          <div className="overflow-x-auto py-1">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 max-w-md mx-auto">
              {dayBuckets.map((day, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`h-8 sm:h-9 rounded border flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-105 cursor-pointer select-none ${getDayCellColor(day.count)}`}
                >
                  <span>{day.count > 0 ? day.count : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Inspection Bar for Daily Streak */}
          <div className="h-8 w-full px-3 rounded bg-bg/80 border border-ink-400/10 flex items-center justify-between text-xs select-none">
            {hoveredDay ? (
              <div className="flex items-center justify-between w-full font-mono animate-in fade-in duration-100 text-[11px]">
                <span className="text-accent font-medium">{hoveredDay.label}</span>
                <span className="text-ink-100">{hoveredDay.count} session{hoveredDay.count === 1 ? '' : 's'} completed</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-[11px] text-ink-400 font-sans">
                <span>Hover over any day tile to inspect session volume</span>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-xs bg-bg/60 border border-ink-400/10" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-accent/30 border border-accent/40" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-accent/60 border border-accent/70" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-accent border border-accent" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
