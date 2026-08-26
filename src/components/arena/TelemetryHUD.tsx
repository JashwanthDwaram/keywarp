import React from 'react';

export interface TelemetryHUDProps {
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  streak: number;
  isTyping: boolean;
  mode: string;
  sprintRemainingSeconds?: number;
  progressPercent: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  netWpm,
  accuracy,
  streak,
  isTyping,
  mode,
  sprintRemainingSeconds,
  progressPercent
}) => {
  const isTimeSprint = mode === 'Time' || mode === 'Sprint';

  return (
    <div className="w-full space-y-1.5 select-none animate-in fade-in duration-150 py-0.5">
      {/* Ambient metrics line */}
      <div className="flex items-center justify-between text-xs font-mono text-ink-400 px-0.5">
        <div className="flex items-center gap-3 tabular-nums">
          <span className="text-ink-100 font-medium">
            <span className="text-accent">{netWpm}</span> wpm
          </span>
          <span className="text-ink-400/30">•</span>
          <span className={accuracy < 95 ? 'text-incorrect font-medium' : 'text-correct'}>
            {accuracy}% acc
          </span>
          {isTyping && streak >= 5 ? (
            <>
              <span className="text-ink-400/30">•</span>
              <span className="text-accent font-medium">{streak} streak</span>
            </>
          ) : null}
        </div>

        {isTimeSprint ? (
          <span className="text-accent font-medium tabular-nums text-xs">
            {sprintRemainingSeconds !== undefined ? `${Math.ceil(sprintRemainingSeconds)}s remaining` : '30s'}
          </span>
        ) : (
          <span className="text-ink-400/60 text-[11px] tabular-nums">
            {isTyping ? `${Math.round(progressPercent)}% done` : 'ready'}
          </span>
        )}
      </div>

      {/* Subtle minimal progress line */}
      <div className="w-full h-[2px] bg-ink-400/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-100 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};
