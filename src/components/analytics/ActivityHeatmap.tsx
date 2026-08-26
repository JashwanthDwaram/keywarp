import React, { useMemo } from 'react';
import { Calendar, Flame } from 'lucide-react';
import { TypingRecord } from '../../types';

export interface ActivityHeatmapProps {
  records: TypingRecord[];
}

function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ records }) => {
  const { dayBuckets, currentStreak, totalDaysActive } = useMemo(() => {
    // Generate last 35 days (5 full weeks)
    const today = new Date();
    const days: { dateStr: string; label: string; count: number; dayOfWeek: number }[] = [];
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
        count: dateCounts[dateStr] || 0,
        dayOfWeek: d.getDay()
      });
    }

    // Calculate active days & current daily streak
    let streak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dStr = toLocalDateStr(checkDate);
      if (dateCounts[dStr] && dateCounts[dStr] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has 0 tests yet, check if yesterday had tests
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

    const activeCount = Object.keys(dateCounts).length;

    return {
      dayBuckets: days,
      currentStreak: streak,
      totalDaysActive: activeCount
    };
  }, [records]);

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-bg/80 border-ink-400/10 text-transparent';
    if (count === 1) return 'bg-accent/30 border-accent/40 text-ink-100';
    if (count <= 3) return 'bg-accent/60 border-accent/70 text-ink-100';
    return 'bg-accent border-accent text-bg font-bold';
  };

  return (
    <div className="rounded border border-ink-400/15 bg-surface p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-400/10 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <h3 className="text-xs font-medium text-ink-100 font-sans uppercase tracking-wider">
            Daily practice volume (Last 35 days)
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-accent font-medium">
            <Flame className="w-3.5 h-3.5" />
            <span>{currentStreak} day streak</span>
          </div>
          <span className="text-ink-400">
            {totalDaysActive} active days
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1.5 min-w-[280px]">
          {dayBuckets.map((day, i) => (
            <div
              key={i}
              title={`${day.label}: ${day.count} tests completed`}
              className={`h-8 rounded border flex flex-col items-center justify-center text-[10px] font-mono select-none transition-transform hover:scale-105 cursor-default ${getCellColor(day.count)}`}
            >
              <span>{day.count > 0 ? day.count : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] font-sans text-ink-400 pt-1">
        <span>Less practice</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-bg/80 border border-ink-400/10" />
          <div className="w-2.5 h-2.5 rounded bg-accent/30 border border-accent/40" />
          <div className="w-2.5 h-2.5 rounded bg-accent/60 border border-accent/70" />
          <div className="w-2.5 h-2.5 rounded bg-accent border border-accent" />
        </div>
        <span>More practice</span>
      </div>
    </div>
  );
};
