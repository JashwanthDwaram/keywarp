import React from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { TypingRecord } from '../../types';

export interface MistakeMatrixProps {
  records: TypingRecord[];
}

export const MistakeMatrix: React.FC<MistakeMatrixProps> = ({ records }) => {
  // Aggregate error counts
  const errorMap: Record<string, number> = {};
  let totalMistakesCount = 0;

  records.forEach(r => {
    if (r.mistypedKeys && r.mistypedKeys !== 'None') {
      r.mistypedKeys.split(';').forEach(pair => {
        const [k, countStr] = pair.split(':');
        if (k && countStr) {
          const count = parseInt(countStr, 10);
          if (!isNaN(count)) {
            errorMap[k] = (errorMap[k] || 0) + count;
            totalMistakesCount += count;
          }
        }
      });
    }
  });

  const sortedErrors = Object.entries(errorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxMistakes = sortedErrors.length > 0 ? sortedErrors[0][1] : 1;

  const getFingerReachZone = (keyChar: string) => {
    const k = keyChar.toLowerCase();
    if (['q', 'a', 'z', '1'].includes(k)) return 'Left pinky reach';
    if (['w', 's', 'x', '2'].includes(k)) return 'Left ring reach';
    if (['e', 'd', 'c', '3'].includes(k)) return 'Left middle reach';
    if (['r', 'f', 'v', 't', 'g', 'b', '4', '5'].includes(k)) return 'Left index reach';
    if (['y', 'h', 'n', 'u', 'j', 'm', '6', '7'].includes(k)) return 'Right index reach';
    if (['i', 'k', ',', '8'].includes(k)) return 'Right middle reach';
    if (['o', 'l', '.', '9'].includes(k)) return 'Right ring reach';
    if (['p', ';', "'", '/', '-', '=', '0', '[', ']'].includes(k)) return 'Right pinky reach';
    if (k === '[space]' || k === ' ' || k === 'space') return 'Thumb spacebar';
    return 'Perimeter key';
  };

  return (
    <div className="p-4 rounded-lg border border-ink-400/15 bg-surface space-y-3 shadow-sm font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-100 font-sans">
          <AlertCircle className="w-4 h-4 text-incorrect" />
          <span>Error matrix & reach diagnostics</span>
        </div>
        <span className="text-[11px] font-mono text-ink-400">
          {totalMistakesCount} total mis-hits
        </span>
      </div>

      {sortedErrors.length === 0 ? (
        <div className="p-6 rounded bg-bg/50 border border-ink-400/15 flex flex-col items-center justify-center text-center space-y-1.5">
          <Check className="w-6 h-6 text-correct" />
          <span className="text-xs font-medium text-ink-100 font-sans">Flawless precision record</span>
          <p className="text-[11px] text-ink-400 font-sans max-w-xs">
            No recurring error clusters detected across your typing sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedErrors.map(([keyChar, count], idx) => {
            const percent = Math.round((count / maxMistakes) * 100);
            const zone = getFingerReachZone(keyChar);
            const displayKey = keyChar === '[space]' || keyChar === ' ' ? 'space' : keyChar;

            return (
              <div key={idx} className="p-2.5 rounded bg-bg/50 border border-ink-400/15 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="min-w-6 h-5 px-1.5 rounded bg-surface border border-incorrect/40 text-incorrect font-mono flex items-center justify-center text-[11px] font-medium shrink-0">
                      {displayKey}
                    </span>
                    <span className="font-sans text-ink-100 text-xs truncate">
                      {zone}
                    </span>
                  </div>
                  <span className="text-incorrect tabular-nums shrink-0 text-xs">
                    {count} errors ({Math.round((count / Math.max(1, totalMistakesCount)) * 100)}%)
                  </span>
                </div>

                {/* Flat Frequency bar */}
                <div className="w-full h-1 bg-ink-400/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-incorrect rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
