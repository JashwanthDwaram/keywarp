import React, { useState } from 'react';
import { Download, Table } from 'lucide-react';
import { TypingRecord } from '../../types';
import { Button } from '../ui/Button';

export interface SessionHistoryTableProps {
  records: TypingRecord[];
}

export const SessionHistoryTable: React.FC<SessionHistoryTableProps> = ({ records }) => {
  const [filterMode, setFilterMode] = useState<'All' | 'Passage' | 'Sprint'>('All');

  const filtered = records.filter(r => {
    if (filterMode === 'All') return true;
    return r.mode === filterMode;
  });

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = "timestamp,mode,difficulty,passage_length,characters_typed,time_seconds,gross_wpm,net_wpm,accuracy,total_errors,mistyped_keys\n";
    const rows = records.map(r =>
      `"${r.timestamp}","${r.mode}","${r.difficulty}",${r.passageLength},${r.charactersTyped},${r.timeSeconds},${r.grossWpm},${r.netWpm},${r.accuracy},${r.totalErrors},"${r.mistypedKeys}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typepulse_history_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="p-4 rounded border border-ink-400/15 bg-surface space-y-3">
      {/* Header with Filter Pills and Export Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-100 font-sans">
          <Table className="w-3.5 h-3.5 text-accent" />
          <span>Session log history</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded bg-bg/60 border border-ink-400/10 text-xs font-sans">
            {(['All', 'Passage', 'Sprint'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setFilterMode(m)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-sans transition-colors cursor-pointer ${
                  filterMode === m
                    ? 'bg-surface text-ink-100 border border-ink-400/30'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {m.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCSV}
            disabled={records.length === 0}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table Content */}
      {filtered.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-xs text-ink-400 font-sans border border-ink-400/15 rounded">
          No records match the current filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-ink-400/15 bg-bg/50">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-ink-400/15 text-[11px] text-ink-400 font-sans bg-ink-400/5">
                <th className="py-2.5 px-3">Date & time</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Difficulty</th>
                <th className="py-2.5 px-3 text-right">Net speed</th>
                <th className="py-2.5 px-3 text-right">Gross</th>
                <th className="py-2.5 px-3 text-right">Accuracy</th>
                <th className="py-2.5 px-3 text-right">Errors</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-400/10">
              {filtered.slice().reverse().map((rec, i) => (
                <tr key={rec.id ? rec.id : i} className="hover:bg-ink-400/5 transition-colors">
                  <td className="py-2 px-3 text-ink-400 whitespace-nowrap">
                    {formatDate(rec.timestamp)}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.2 rounded bg-surface border border-ink-400/20 text-ink-100 text-[10px]">
                      {(rec.mode || 'standard').toLowerCase()}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-ink-400 font-sans">
                    {(rec.difficulty || 'medium').toLowerCase()}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-ink-100 tabular-nums">
                    {rec.netWpm ?? 0}
                  </td>
                  <td className="py-2 px-3 text-right text-ink-400 tabular-nums">
                    {rec.grossWpm ?? 0}
                  </td>
                  <td className="py-2 px-3 text-right text-correct tabular-nums">
                    {rec.accuracy ?? 100}%
                  </td>
                  <td className="py-2 px-3 text-right text-incorrect tabular-nums">
                    {rec.totalErrors ?? 0}
                  </td>
                  <td className="py-2 px-3 text-right text-ink-400 tabular-nums">
                    {(rec.timeSeconds ?? 0).toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
