import React, { useState } from 'react';
import { X, Flame, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export interface CookieJarWidgetProps {
  isActive: boolean;
  onToggle: () => void;
  currentWpm: number;
  totalBaked: number;
}

export const CookieJarWidget: React.FC<CookieJarWidgetProps> = React.memo(({
  isActive,
  onToggle,
  currentWpm,
  totalBaked
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [nomEffect, setNomEffect] = useState(false);

  if (!isActive) return null;

  const handleEatCookie = () => {
    try {
      soundEngine.playKey('Bubble', false, false);
    } catch {}
    setNomEffect(true);
    setTimeout(() => setNomEffect(false), 800);
  };

  const ovenStatus =
    currentWpm >= 100
      ? { label: 'Oven Overdrive!', icon: <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />, glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)] border-amber-400' }
      : currentWpm >= 65
      ? { label: 'Golden Crust', icon: <Flame className="w-3 h-3 text-amber-400 animate-pulse" />, glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)] border-amber-500/40' }
      : { label: 'Baking Warm', icon: <span className="text-xs">♨️</span>, glow: 'border-ink-400/20' };

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-14 right-3 sm:bottom-14 sm:right-4 z-40 p-2 sm:p-2.5 rounded-full bg-surface border border-amber-500/40 text-amber-400 shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer select-none transform-gpu"
        title="Open Cookie Bakery HUD"
      >
        <span className="text-sm sm:text-base">🍪</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Cookie Bakery HUD"
      className={`fixed bottom-14 right-3 sm:bottom-14 sm:right-4 z-40 p-2.5 sm:p-3 rounded-xl bg-surface/95 border ${ovenStatus.glow} shadow-xl transition-all duration-200 select-none max-w-[190px] sm:max-w-[210px] font-sans transform-gpu`}
    >
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-ink-400/10">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-100 font-mono">
          <span className="text-sm">🍪</span>
          <span>Bakery HUD</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-ink-400 hover:text-ink-100 hover:bg-bg/40 transition-colors cursor-pointer"
            title="Minimize"
          >
            <span className="text-[10px] font-mono leading-none">_</span>
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="p-1 rounded text-ink-400 hover:text-ink-100 hover:bg-bg/40 transition-colors cursor-pointer"
            title="Close Cookie Mode"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="py-2 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-ink-400 text-[11px]">Batch:</span>
          <span className="font-bold text-amber-400 tabular-nums">
            {totalBaked} {totalBaked === 1 ? 'cookie' : 'cookies'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-ink-400">
          <span>Heat:</span>
          <span className="flex items-center gap-1 text-ink-100 font-medium">
            {ovenStatus.icon}
            <span>{ovenStatus.label}</span>
          </span>
        </div>
      </div>

      <div className="pt-1.5 border-t border-ink-400/10 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={handleEatCookie}
          className="w-full py-1 px-2 rounded bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{nomEffect ? '✨ Yummy!' : 'Crunch Cookie'}</span>
        </button>
      </div>
    </aside>
  );
});
