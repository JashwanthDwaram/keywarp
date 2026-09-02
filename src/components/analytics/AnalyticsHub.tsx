import React, { useState, useMemo, useRef } from 'react';
import { Award, Target, BarChart2, TrendingUp, AlertTriangle, RotateCcw, Download, Upload, Check } from 'lucide-react';
import { TypingRecord } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { ProgressionChart } from './ProgressionChart';
import { MistakeMatrix } from './MistakeMatrix';
import { SessionHistoryTable } from './SessionHistoryTable';
import { BiomechanicalKeyboardHeatmap } from './BiomechanicalKeyboardHeatmap';
import { FingerDiagnostics } from './FingerDiagnostics';
import { AchievementsGrid } from './AchievementsGrid';
import { Button } from '../ui/Button';
import { exportRecordsToJson, parseImportedJson } from '../../utils/dataImportExport';
import { trackDataExport, trackDataImport } from '../../utils/telemetry';

export interface AnalyticsHubProps {
  records: TypingRecord[];
  onResetRecords?: () => void;
  onImportRecords?: (imported: TypingRecord[]) => void;
}

export const AnalyticsHub: React.FC<AnalyticsHubProps> = ({
  records,
  onResetRecords,
  onImportRecords
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disqualified runs (too short, too few keystrokes, sudden-death fails) must never
  // pollute PBs, averages, trends, or achievements. Raw records are still exported/tabled.
  const validRecords = useMemo(() => records.filter(r => !r.isDisqualified), [records]);

  // Summary KPIs derived synchronously during render
  const stats = useMemo(() => {
    const count = validRecords.length;
    if (count === 0) {
      return {
        totalSessions: 0,
        bestWpm: 0,
        avgWpm: 0,
        avgAcc: 0,
        totalWords: 0,
        totalMins: 0,
        trendValue: '0/5 tests',
        trendSubtitle: 'Calibrating baseline',
        deltaBadge: undefined
      };
    }

    const bestWpm = Math.max(...validRecords.map(r => r.netWpm));
    const avgWpm = Math.round((validRecords.reduce((acc, r) => acc + r.netWpm, 0) / count) * 10) / 10;
    const avgAcc = Math.round((validRecords.reduce((acc, r) => acc + r.accuracy, 0) / count) * 10) / 10;
    const totalWords = validRecords.reduce((acc, r) => acc + Math.floor(r.charactersTyped / 5), 0);
    const totalSecs = validRecords.reduce((acc, r) => acc + r.timeSeconds, 0);
    const totalMins = Math.round((totalSecs / 60) * 10) / 10;

    let trendValue = count < 5 ? `${count}/5 tests` : '±0.0 wpm';
    let trendSubtitle = count < 5 ? 'Calibrating baseline' : `${totalMins}m practice time`;
    let deltaBadge: { value: string; isPositive?: boolean; isNeutral?: boolean } | undefined = undefined;

    if (count >= 5) {
      const first3Avg = validRecords.slice(0, 3).reduce((acc, r) => acc + r.netWpm, 0) / 3;
      const last3Avg = validRecords.slice(-3).reduce((acc, r) => acc + r.netWpm, 0) / 3;
      const diff = Math.round((last3Avg - first3Avg) * 10) / 10;
      trendSubtitle = `${totalMins}m practice time`;

      if (Math.abs(diff) <= 2.5) {
        trendValue = diff > 0 ? `+${diff} wpm` : diff < 0 ? `${diff} wpm` : '±0.0 wpm';
        deltaBadge = { value: 'Steady', isNeutral: true };
      } else if (diff > 2.5) {
        trendValue = `+${diff} wpm`;
        deltaBadge = { value: 'Accelerating', isPositive: true, isNeutral: false };
      } else {
        trendValue = `${diff} wpm`;
        deltaBadge = { value: 'Variance', isPositive: false, isNeutral: false };
      }
    }

    return {
      totalSessions: count,
      bestWpm,
      avgWpm,
      avgAcc,
      totalWords,
      totalMins,
      trendValue,
      trendSubtitle,
      deltaBadge
    };
  }, [validRecords]);

  const handleConfirmReset = () => {
    if (onResetRecords) {
      onResetRecords();
    }
    setShowConfirmReset(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseImportedJson(text);
        if (onImportRecords && result.records.length > 0) {
          onImportRecords(result.records);
          trackDataImport('json', result.count);
          setImportStatus(`Imported ${result.count} records!`);
          setTimeout(() => setImportStatus(null), 3000);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface border border-ink-400/15 shadow-sm font-sans">
        <div>
          <div className="text-xs font-semibold text-ink-100 uppercase tracking-wider font-mono">
            Typing performance analytics
          </div>
          <div className="text-[11px] text-ink-400 font-sans">
            Telemetry, error clusters, biomechanics, and trajectory
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export JSON Backup */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              exportRecordsToJson(records);
              trackDataExport('json', records.length);
            }}
            disabled={records.length === 0}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>

          {/* Import JSON Backup / Monkeytype */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Import JSON records"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Import JSON
          </Button>

          {importStatus ? (
            <span className="text-xs font-mono text-correct flex items-center gap-1 animate-in fade-in">
              <Check className="w-3 h-3" /> {importStatus}
            </span>
          ) : null}

          {/* Reset Analytics */}
          {onResetRecords ? (
            <div>
              {!showConfirmReset ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowConfirmReset(true)}
                  disabled={records.length === 0}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset
                </Button>
              ) : (
                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="text-xs text-incorrect font-sans flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Clear all?
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConfirmReset}
                    className="bg-incorrect/20 text-incorrect border-incorrect hover:bg-incorrect/30"
                  >
                    Yes, reset
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowConfirmReset(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* 4 Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Total sessions"
          value={stats.totalSessions}
          subtitle={`${stats.totalWords} words typed`}
          icon={<BarChart2 className="w-4 h-4" aria-hidden="true" />}
        />
        <MetricCard
          title="Personal best"
          value={`${stats.bestWpm} wpm`}
          subtitle="Peak velocity"
          icon={<Award className="w-4 h-4 text-accent" aria-hidden="true" />}
        />
        <MetricCard
          title="Average speed"
          value={`${stats.avgWpm} wpm`}
          subtitle={`${stats.avgAcc}% accuracy`}
          icon={<Target className="w-4 h-4 text-correct" aria-hidden="true" />}
        />
        <MetricCard
          title="Velocity trend"
          value={stats.trendValue}
          subtitle={stats.trendSubtitle}
          delta={stats.deltaBadge}
          icon={<TrendingUp className="w-4 h-4" aria-hidden="true" />}
        />
      </div>

      {/* Visual Charts Grid: Trajectory & Mistake Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressionChart records={validRecords} />
        <MistakeMatrix records={validRecords} />
      </div>

      {/* Biomechanical Finger Diagnostics */}
      <FingerDiagnostics records={validRecords} />

      {/* Biomechanical Keyboard Heatmap & Daily Practice Streak */}
      <BiomechanicalKeyboardHeatmap records={validRecords} />

      {/* Milestones & Achievements Grid */}
      <AchievementsGrid records={validRecords} />

      {/* Session Records Table */}
      <SessionHistoryTable records={records} />
    </div>
  );
};
