import React, { useState } from 'react';
import { RotateCcw, ArrowRight, Award, Zap, Target, Clock, AlertTriangle, Sparkles, BarChart2, Check, Share2, Swords } from 'lucide-react';
import { TypingRecord } from '../../types';
import { getPerformanceRank } from '../../utils/typingMath';
import { generateChallengeUrl } from '../../utils/challengeUtils';
import { Button } from '../ui/Button';

export interface SecondSnapshot {
  second: number;
  wpm: number;
  raw: number;
  errors: number;
}

export interface SessionResultsCardProps {
  record: TypingRecord;
  snapshots: SecondSnapshot[];
  targetText?: string;
  onRestart: () => void;
  onNextTest: () => void;
  onOpenCoach?: () => void;
  onPracticeMistakes?: (mistakeText: string) => void;
}

export const SessionResultsCard: React.FC<SessionResultsCardProps> = ({
  record,
  snapshots,
  targetText = '',
  onRestart,
  onNextTest,
  onOpenCoach,
  onPracticeMistakes
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<string | null>(null);
  const rank = getPerformanceRank(record.netWpm, record.accuracy);

  // Parse mistyped keys
  const parsedMistakes: { key: string; count: number }[] = [];
  if (record.mistypedKeys && record.mistypedKeys !== 'None') {
    record.mistypedKeys.split(';').forEach(pair => {
      const [k, countStr] = pair.split(':');
      if (k && countStr) {
        const count = parseInt(countStr, 10);
        if (!isNaN(count)) {
          parsedMistakes.push({ key: k, count });
        }
      }
    });
  }
  parsedMistakes.sort((a, b) => b.count - a.count);

  // Waveform graph calculations: ensure clean numeric coordinates and smooth progression
  const width = 640;
  const height = 140;
  const padding = { top: 15, right: 25, bottom: 20, left: 30 };

  const validSnapshots = React.useMemo(() => {
    const rawSnaps = (snapshots || []).filter(s => Number.isFinite(s.wpm) && s.second >= 1);
    if (rawSnaps.length >= 2) {
      return rawSnaps.map(s => ({
        second: s.second,
        wpm: Number.isFinite(s.wpm) ? s.wpm : record.netWpm,
        raw: Number.isFinite(s.raw) ? s.raw : (Number.isFinite(s.wpm) ? s.wpm : record.grossWpm),
        errors: s.errors || 0
      }));
    }

    const dur = Math.max(2, Math.round(record.timeSeconds || 2));
    const firstNet = Math.round(record.netWpm * 0.8);
    const firstGross = Math.round(record.grossWpm * 0.85);

    return [
      { second: 1, wpm: firstNet, raw: firstGross, errors: 0 },
      { second: dur, wpm: record.netWpm, raw: record.grossWpm, errors: record.totalErrors }
    ];
  }, [snapshots, record]);

  const maxWpm = Math.max(40, ...validSnapshots.map(s => Math.max(s.wpm, s.raw))) + 10;
  const maxSec = Math.max(2, validSnapshots[validSnapshots.length - 1].second);

  const getX = (sec: number) => {
    return padding.left + ((sec - 1) / Math.max(1, maxSec - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return height - padding.bottom - (Math.max(0, val) / maxWpm) * (height - padding.top - padding.bottom);
  };

  const wpmPoints = validSnapshots.map(s => `${getX(s.second).toFixed(1)},${getY(s.wpm).toFixed(1)}`).join(' ');
  const rawPoints = validSnapshots.map(s => `${getX(s.second).toFixed(1)},${getY(s.raw).toFixed(1)}`).join(' ');

  const hovered = hoverIndex !== null ? validSnapshots[hoverIndex] : null;

  const handleLaunchMistakeDrill = () => {
    if (parsedMistakes.length === 0 || !onPracticeMistakes) return;
    const focusKeys = parsedMistakes.slice(0, 4).map(m => m.key);
    const drill = `Focus remediation drill for keys [${focusKeys.join(', ')}]: ${focusKeys.map(k => `${k}${k} ${k}a ${k}e ${k}i ${k}o ${k}u`).join(' ')}. Practice deliberate reach and rhythmic accuracy across targeted finger transitions.`;
    onPracticeMistakes(drill);
  };

  // Generate Challenge Link
  const handleChallengeLink = () => {
    if (!targetText) return;
    const url = generateChallengeUrl(targetText, record.netWpm, record.mode);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setChallengeStatus('Challenge Link Copied!');
      setTimeout(() => setChallengeStatus(null), 3000);
    }
  };

  // Generate high-resolution shareable PNG card
  const handleShareCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#1a1a16';
    ctx.fillRect(0, 0, 800, 460);

    // Inner Card Border
    ctx.strokeStyle = 'rgba(232, 230, 225, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 420);

    // Monogram Box & Brand Header
    ctx.fillStyle = '#22221c';
    ctx.fillRect(40, 40, 36, 36);
    ctx.strokeStyle = 'rgba(216, 90, 48, 0.6)';
    ctx.strokeRect(40, 40, 36, 36);

    ctx.fillStyle = '#d85a30';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('ty', 50, 64);

    ctx.fillStyle = '#e8e6e1';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('typepulse', 88, 65);

    ctx.fillStyle = '#8a8578';
    ctx.font = '13px monospace';
    ctx.fillText(`${record.mode} • ${record.difficulty}`, 88, 88);

    // Certified Rank Badge on Top Right
    ctx.fillStyle = '#22221c';
    ctx.fillRect(560, 40, 200, 50);
    ctx.strokeStyle = 'rgba(216, 90, 48, 0.4)';
    ctx.strokeRect(560, 40, 200, 50);

    ctx.fillStyle = '#d85a30';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CERTIFIED RANK', 575, 60);

    ctx.fillStyle = '#e8e6e1';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(rank.title, 575, 80);

    // 4 Big Metrics
    const metrics = [
      { label: 'NET SPEED', val: `${record.netWpm} wpm`, color: '#e8e6e1', sub: `Gross: ${record.grossWpm} wpm` },
      { label: 'ACCURACY', val: `${record.accuracy}%`, color: '#639922', sub: `${record.charactersTyped} chars` },
      { label: 'DURATION', val: `${record.timeSeconds.toFixed(1)}s`, color: '#e8e6e1', sub: `${Math.floor(record.charactersTyped / 5)} words` },
      { label: 'ERRORS', val: `${record.totalErrors}`, color: record.totalErrors > 0 ? '#e24b4a' : '#639922', sub: `${parsedMistakes.length} keys` }
    ];

    metrics.forEach((m, i) => {
      const x = 40 + i * 185;
      const y = 120;
      ctx.fillStyle = '#22221c';
      ctx.fillRect(x, y, 175, 95);
      ctx.strokeStyle = 'rgba(232, 230, 225, 0.08)';
      ctx.strokeRect(x, y, 175, 95);

      ctx.fillStyle = '#8a8578';
      ctx.font = '10px sans-serif';
      ctx.fillText(m.label, x + 15, y + 25);

      ctx.fillStyle = m.color;
      ctx.font = 'bold 26px monospace';
      ctx.fillText(m.val, x + 15, y + 60);

      ctx.fillStyle = '#8a8578';
      ctx.font = '11px monospace';
      ctx.fillText(m.sub, x + 15, y + 82);
    });

    // Waveform Graph Section
    ctx.fillStyle = '#22221c';
    ctx.fillRect(40, 235, 720, 150);
    ctx.strokeStyle = 'rgba(232, 230, 225, 0.08)';
    ctx.strokeRect(40, 235, 720, 150);

    ctx.fillStyle = '#8a8578';
    ctx.font = '11px sans-serif';
    ctx.fillText('Velocity Cadence Waveform', 55, 258);

    // Draw mini graph
    if (validSnapshots.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#d85a30';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      validSnapshots.forEach((s, idx) => {
        const gx = 65 + ((s.second - 1) / Math.max(1, maxSec - 1)) * 670;
        const gy = 365 - (s.wpm / maxWpm) * 90;
        if (idx === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      });
      ctx.stroke();
    }

    // Footer
    ctx.fillStyle = '#8a8578';
    ctx.font = '11px monospace';
    ctx.fillText(`typepulse.app • ${new Date().toLocaleDateString()}`, 40, 415);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setShareStatus('Card Copied to Clipboard!');
          setTimeout(() => setShareStatus(null), 3000);
          return;
        }
      } catch {
        // Fallback to image download
      }

      // Download Fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `typepulse_${record.netWpm}wpm_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShareStatus('Snapshot Saved!');
      setTimeout(() => setShareStatus(null), 3000);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded border border-ink-400/15 bg-surface p-5 sm:p-6 space-y-5">
      {/* Header with Certified Rank */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink-400/10">
        <div>
          <div className="text-xs text-accent font-mono mb-1">
            Session completed • {record.mode.toLowerCase()} ({record.difficulty.toLowerCase()})
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-ink-100 font-sans">
            Performance summary
          </h2>
          <p className="text-xs text-ink-400 font-sans mt-0.5">
            {rank.description}
          </p>
        </div>

        {/* Rank Badge & Share/Challenge Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-ink-400/20 bg-bg/50">
            <Award className="w-4 h-4 text-accent" aria-hidden="true" />
            <div>
              <div className="text-[10px] text-ink-400 font-sans">
                Certified rank
              </div>
              <div className="text-xs font-medium text-ink-100 font-sans">
                {rank.title}
              </div>
            </div>
          </div>

          {targetText ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleChallengeLink}
              icon={challengeStatus ? <Check className="w-3.5 h-3.5 text-correct" /> : <Swords className="w-3.5 h-3.5 text-accent" />}
            >
              {challengeStatus || 'Challenge friend'}
            </Button>
          ) : null}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShareCard}
            icon={shareStatus ? <Check className="w-3.5 h-3.5 text-correct" /> : <Share2 className="w-3.5 h-3.5 text-accent" />}
          >
            {shareStatus || 'Share card'}
          </Button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Net WPM */}
        <div className="p-3 rounded bg-bg/50 border border-ink-400/15">
          <div className="text-[11px] text-ink-400 font-sans flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-accent" />
            Net speed
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-ink-100 font-mono tabular-nums">
            {record.netWpm}
            <span className="text-xs text-ink-400 font-sans font-normal ml-1">wpm</span>
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5 font-mono">
            Gross: {record.grossWpm} wpm
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-3 rounded bg-bg/50 border border-ink-400/15">
          <div className="text-[11px] text-ink-400 font-sans flex items-center gap-1.5 mb-1">
            <Target className="w-3 h-3 text-correct" />
            Accuracy
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-correct font-mono tabular-nums">
            {record.accuracy}%
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5 font-mono">
            {record.charactersTyped} characters
          </div>
        </div>

        {/* Duration */}
        <div className="p-3 rounded bg-bg/50 border border-ink-400/15">
          <div className="text-[11px] text-ink-400 font-sans flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3 text-ink-400" />
            Duration
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-ink-100 font-mono tabular-nums">
            {record.timeSeconds.toFixed(1)}s
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5 font-mono">
            {Math.floor(record.charactersTyped / 5)} words
          </div>
        </div>

        {/* Mistakes */}
        <div className="p-3 rounded bg-bg/50 border border-ink-400/15">
          <div className="text-[11px] text-ink-400 font-sans flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3 h-3 text-incorrect" />
            Errors
          </div>
          <div className="text-2xl sm:text-3xl font-medium text-incorrect font-mono tabular-nums">
            {record.totalErrors}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5 font-mono">
            {parsedMistakes.length} unique keys
          </div>
        </div>
      </div>

      {/* Cadence Waveform */}
      {validSnapshots.length > 1 ? (
        <div className="p-4 rounded bg-bg/50 border border-ink-400/15 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-ink-400 font-sans flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-accent" />
              <span>Velocity cadence waveform</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-accent">
                <span className="w-2 h-0.5 bg-accent inline-block" />
                Net
              </span>
              <span className="flex items-center gap-1 text-ink-400">
                <span className="w-2 h-0.5 border-b border-dashed border-ink-400 inline-block" />
                Gross
              </span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden select-none font-mono">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Grid Lines */}
              {[0.33, 0.66, 1].map(r => {
                const val = Math.round(maxWpm * r);
                const y = getY(val);
                return (
                  <g key={r}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      className="stroke-ink-400"
                      strokeOpacity="0.15"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={padding.left - 4}
                      y={y + 3}
                      className="fill-ink-400"
                      fontSize="9"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Raw line */}
              <polyline
                points={rawPoints}
                fill="none"
                className="stroke-ink-400"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.5"
              />

              {/* Net line */}
              <polyline
                points={wpmPoints}
                fill="none"
                className="stroke-accent"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Nodes */}
              {validSnapshots.map((s, i) => (
                <rect
                  key={i}
                  x={getX(s.second) - 6}
                  y={padding.top}
                  width="12"
                  height={height - padding.top - padding.bottom}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              ))}

              {/* Hover Cursor */}
              {hovered ? (
                <g>
                  <line
                    x1={getX(hovered.second)}
                    y1={padding.top}
                    x2={getX(hovered.second)}
                    y2={height - padding.bottom}
                    className="stroke-ink-100"
                    strokeOpacity="0.3"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={getX(hovered.second)}
                    cy={getY(hovered.wpm)}
                    r="3"
                    className="fill-accent stroke-bg"
                    strokeWidth="1.5"
                  />
                </g>
              ) : null}
            </svg>

            {/* Hover Tooltip: Clamped and Floating Cleanly Without Edge Collisions */}
            {hovered ? (() => {
              const pctX = (getX(hovered.second) / width) * 100;
              const pctY = Math.max(18, Math.min(82, (getY(hovered.wpm) / height) * 100));
              const alignClass = pctX < 22
                ? 'translate-x-2 -translate-y-full'
                : pctX > 78
                ? '-translate-x-[calc(100%+8px)] -translate-y-full'
                : '-translate-x-1/2 -translate-y-full -mt-2';

              return (
                <div
                  className={`absolute pointer-events-none px-2.5 py-1 rounded-md bg-surface/95 border border-accent/40 text-[10px] sm:text-[11px] font-mono text-ink-100 flex items-center gap-1.5 shadow-xl backdrop-blur-md z-30 transition-all ${alignClass}`}
                  style={{
                    left: `${pctX}%`,
                    top: `${pctY}%`
                  }}
                >
                  <span className="text-accent font-semibold">{hovered.wpm} net</span>
                  <span className="text-ink-400">•</span>
                  <span className="text-ink-100">{hovered.raw} raw</span>
                  <span className="text-ink-400">•</span>
                  <span className="text-ink-400">{hovered.second}s</span>
                </div>
              );
            })() : null}
          </div>
        </div>
      ) : null}

      {/* Mistyped Keys */}
      {parsedMistakes.length > 0 ? (
        <div className="p-3.5 rounded bg-bg/50 border border-ink-400/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-ink-400 font-sans">
              Mistyped keys:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {parsedMistakes.slice(0, 6).map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-surface border border-incorrect/30 text-incorrect font-mono text-xs flex items-center gap-1"
                >
                  <span>{m.key === ' ' ? 'space' : m.key}</span>
                  <span className="text-[10px] text-ink-400">×{m.count}</span>
                </span>
              ))}
            </div>
          </div>

          {onPracticeMistakes ? (
            <Button
              variant="outline"
              size="xs"
              onClick={handleLaunchMistakeDrill}
              icon={<Sparkles className="w-3 h-3 text-accent" />}
            >
              Practice mistakes
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="p-3 rounded bg-bg/50 border border-correct/20 text-correct text-xs font-sans flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-correct shrink-0" />
          <span>Zero mistakes recorded in this session.</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-400/10">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRestart}
            icon={<RotateCcw className="w-3.5 h-3.5 text-ink-400" />}
          >
            Repeat passage
          </Button>

          {onOpenCoach ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenCoach}
              icon={<Sparkles className="w-3.5 h-3.5 text-accent" />}
            >
              Run diagnostics
            </Button>
          ) : null}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onNextTest}
          icon={<ArrowRight className="w-3.5 h-3.5 text-ink-100" />}
          iconPosition="right"
        >
          Next test (Tab + Enter)
        </Button>
      </div>
    </div>
  );
};
