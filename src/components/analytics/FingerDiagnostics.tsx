import React, { useMemo } from 'react';
import { Hand } from 'lucide-react';
import { TypingRecord } from '../../types';

export interface FingerDiagnosticsProps {
  records: TypingRecord[];
}

interface FingerStat {
  finger: string;
  hand: 'left' | 'right' | 'thumb';
  keys: string;
  totalErrors: number;
  errorSharePercent: number;
}

export const FingerDiagnostics: React.FC<FingerDiagnosticsProps> = ({ records }) => {
  const stats = useMemo(() => {
    const errorMap: Record<string, number> = {};
    records.forEach(r => {
      if (r.mistypedKeys && r.mistypedKeys !== 'None') {
        r.mistypedKeys.split(';').forEach(pair => {
          const [k, countStr] = pair.split(':');
          if (k && countStr) {
            const count = parseInt(countStr, 10);
            if (!isNaN(count)) {
              errorMap[k.toLowerCase()] = (errorMap[k.toLowerCase()] || 0) + count;
            }
          }
        });
      }
    });

    const fingerDefinitions: Omit<FingerStat, 'totalErrors' | 'errorSharePercent'>[] = [
      { finger: 'Left Pinky', hand: 'left', keys: 'q, a, z, 1' },
      { finger: 'Left Ring', hand: 'left', keys: 'w, s, x, 2' },
      { finger: 'Left Middle', hand: 'left', keys: 'e, d, c, 3' },
      { finger: 'Left Index', hand: 'left', keys: 'r, t, f, g, v, b, 4, 5' },
      { finger: 'Thumbs', hand: 'thumb', keys: '[space], space' },
      { finger: 'Right Index', hand: 'right', keys: 'y, u, h, j, n, m, 6, 7' },
      { finger: 'Right Middle', hand: 'right', keys: 'i, k, comma, 8' },
      { finger: 'Right Ring', hand: 'right', keys: 'o, l, period, 9' },
      { finger: 'Right Pinky', hand: 'right', keys: 'p, slash, semicolon, 0, enter' }
    ];

    let totalErrorsCount = 0;
    const computed: FingerStat[] = fingerDefinitions.map(fd => {
      const keysList = fd.keys.split(',').map(k => k.trim());
      let fingerErrors = 0;

      keysList.forEach(k => {
        if (errorMap[k]) fingerErrors += errorMap[k];
        if (k === 'period' && errorMap['.']) fingerErrors += errorMap['.'];
        if (k === 'comma' && errorMap[',']) fingerErrors += errorMap[','];
        if (k === 'slash' && errorMap['/']) fingerErrors += errorMap['/'];
        if (k === 'semicolon' && errorMap[';']) fingerErrors += errorMap[';'];
      });

      totalErrorsCount += fingerErrors;
      return {
        ...fd,
        totalErrors: fingerErrors,
        errorSharePercent: 0
      };
    });

    // Compute error share percent
    computed.forEach(f => {
      f.errorSharePercent = totalErrorsCount > 0
        ? Math.round((f.totalErrors / totalErrorsCount) * 100)
        : 0;
    });

    let leftHandErrors = 0;
    let rightHandErrors = 0;
    computed.forEach(f => {
      if (f.hand === 'left') leftHandErrors += f.totalErrors;
      if (f.hand === 'right') rightHandErrors += f.totalErrors;
    });

    const totalHandErrors = leftHandErrors + rightHandErrors;
    const leftRatio = totalHandErrors > 0 ? Math.round((leftHandErrors / totalHandErrors) * 100) : 50;
    const rightRatio = 100 - leftRatio;

    return {
      fingerStats: computed,
      totalErrors: totalErrorsCount,
      leftRatio,
      rightRatio
    };
  }, [records]);

  return (
    <div className="rounded border border-ink-400/15 bg-surface p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-400/10 pb-3">
        <div className="flex items-center gap-2">
          <Hand className="w-3.5 h-3.5 text-accent" />
          <h3 className="text-xs font-medium text-ink-100 font-sans uppercase tracking-wider">
            Biomechanical finger load & error distribution
          </h3>
        </div>
        <div className="text-xs font-mono text-ink-400">
          Left: <span className="text-ink-100">{stats.leftRatio}%</span> • Right: <span className="text-ink-100">{stats.rightRatio}%</span>
        </div>
      </div>

      {/* Hand Balance Ratio Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-sans text-ink-400">
          <span>Left hand friction</span>
          <span>Right hand friction</span>
        </div>
        <div className="w-full h-2 rounded bg-bg overflow-hidden flex">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${stats.leftRatio}%` }}
            title={`Left hand: ${stats.leftRatio}%`}
          />
          <div
            className="h-full bg-correct transition-all duration-300"
            style={{ width: `${stats.rightRatio}%` }}
            title={`Right hand: ${stats.rightRatio}%`}
          />
        </div>
      </div>

      {/* Finger Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {stats.fingerStats.map((f, i) => {
          const isHighError = f.errorSharePercent >= 20;
          return (
            <div
              key={i}
              className="p-2.5 rounded bg-bg/60 border border-ink-400/10 flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-sans font-medium text-ink-100">
                  {f.finger}
                </span>
                <span className={`font-mono text-[11px] ${isHighError ? 'text-incorrect font-medium' : 'text-ink-400'}`}>
                  {f.errorSharePercent}% misses
                </span>
              </div>

              <div className="w-full h-1 bg-ink-400/15 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isHighError ? 'bg-incorrect' : 'bg-accent'}`}
                  style={{ width: `${Math.min(100, f.errorSharePercent * 2)}%` }}
                />
              </div>

              <div className="text-[10px] font-mono text-ink-400/70 truncate">
                Keys: {f.keys}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
