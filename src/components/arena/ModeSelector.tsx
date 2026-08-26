import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Settings, X, Ghost, Eye, EyeOff, Skull, Activity, ShieldAlert, Layers, Shuffle, Maximize2, Minimize2 } from 'lucide-react';
import { SoundProfile, soundEngine } from '../../utils/soundEngine';

export type ArenaMode = 'Passage' | 'Time' | 'Words' | 'N-Grams' | 'Weak Words' | 'Quotes' | 'Code' | 'Procedural' | 'Custom';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface ModeSelectorProps {
  mode: ArenaMode;
  difficulty: DifficultyLevel;
  sprintDuration: number;
  wordCount: number;
  soundProfile: SoundProfile;
  zenMode: boolean;
  showKeyboard: boolean;
  showGhost: boolean;
  isBlindMode: boolean;
  isSuddenDeath: boolean;
  isMetronome: boolean;
  metronomePace: number;
  onModeChange: (newMode: ArenaMode) => void;
  onDifficultyChange: (newDiff: DifficultyLevel) => void;
  onSprintDurationChange: (duration: number) => void;
  onWordCountChange: (count: number) => void;
  onSoundProfileChange: (newProfile: SoundProfile) => void;
  onToggleZen: () => void;
  onToggleKeyboard: () => void;
  onToggleGhost: () => void;
  onToggleBlindMode: () => void;
  onToggleSuddenDeath: () => void;
  onToggleMetronome: () => void;
  onChangeMetronomePace: (pace: number) => void;
  onOpenCustomModal: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  difficulty,
  sprintDuration,
  wordCount,
  soundProfile,
  zenMode,
  showKeyboard,
  showGhost,
  isBlindMode,
  isSuddenDeath,
  isMetronome,
  metronomePace,
  onModeChange,
  onDifficultyChange,
  onSprintDurationChange,
  onWordCountChange,
  onSoundProfileChange,
  onToggleZen,
  onToggleKeyboard,
  onToggleGhost,
  onToggleBlindMode,
  onToggleSuddenDeath,
  onToggleMetronome,
  onChangeMetronomePace,
  onOpenCustomModal
}) => {
  const [volume, setLocalVolume] = useState<number>(soundEngine.getVolume());
  const [isSoundOpen, setIsSoundOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const soundRef = useRef<HTMLDivElement>(null);

  // Close sound dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (soundRef.current && !soundRef.current.contains(event.target as Node)) {
        setIsSoundOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryModes: { id: ArenaMode; label: string }[] = [
    { id: 'Time', label: 'time' },
    { id: 'Words', label: 'words' },
    { id: 'Passage', label: 'passage' },
    { id: 'Quotes', label: 'quote' },
    { id: 'Code', label: 'code' },
    { id: 'Custom', label: 'custom' }
  ];

  const timeOptions = [15, 30, 60, 120];
  const wordOptions = [10, 25, 50, 100];
  const metronomeOptions = [60, 80, 100, 120];
  const difficulties: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
  const soundProfiles: SoundProfile[] = ['Thock', 'Click', 'Topre', 'Buckling', 'Bubble', 'Silent'];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalVolume(val);
    soundEngine.setVolume(val);
  };

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surface/80 border border-ink-400/10 text-xs font-mono select-none">
      {/* 1. Unified Command Ribbon (All Lowercase & Clean Contrast) */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
        {/* Primary Modes */}
        <div className="flex items-center gap-2.5">
          {primaryModes.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                if (m.id === 'Custom') {
                  onOpenCustomModal();
                } else {
                  onModeChange(m.id);
                }
              }}
              className={`transition-colors cursor-pointer lowercase ${
                mode === m.id
                  ? 'text-accent font-medium'
                  : 'text-ink-400 hover:text-ink-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        {(mode === 'Time' || mode === 'Words' || mode === 'Passage') && (
          <span className="text-ink-400/30 px-1">|</span>
        )}

        {/* Time Options */}
        {mode === 'Time' && (
          <div className="flex items-center gap-2">
            {timeOptions.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onSprintDurationChange(t)}
                className={`transition-colors cursor-pointer ${
                  sprintDuration === t
                    ? 'text-accent font-medium'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Word Options */}
        {mode === 'Words' && (
          <div className="flex items-center gap-2">
            {wordOptions.map(w => (
              <button
                key={w}
                type="button"
                onClick={() => onWordCountChange(w)}
                className={`transition-colors cursor-pointer ${
                  wordCount === w
                    ? 'text-accent font-medium'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {/* Difficulty Options */}
        {mode === 'Passage' && (
          <div className="flex items-center gap-2">
            {difficulties.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => onDifficultyChange(d)}
                className={`transition-colors cursor-pointer lowercase ${
                  difficulty === d
                    ? 'text-accent font-medium'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {d.toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Indicator if special mode is active */}
        {(mode === 'N-Grams' || mode === 'Weak Words' || mode === 'Procedural') && (
          <>
            <span className="text-ink-400/30 px-1">|</span>
            <span className="text-accent font-medium lowercase">
              {mode === 'N-Grams' ? 'n-grams' : mode === 'Weak Words' ? 'weak words' : 'generator'}
            </span>
          </>
        )}
      </div>

      {/* 2. Quiet Actions (Sound Pill & Config Button) */}
      <div className="flex items-center gap-2.5">
        {/* Sound Switch Pill with Popover */}
        <div className="relative" ref={soundRef}>
          <button
            type="button"
            onClick={() => setIsSoundOpen(prev => !prev)}
            aria-label={`Sound profile: ${soundProfile}`}
            className="flex items-center gap-1.5 text-ink-400 hover:text-ink-100 transition-colors cursor-pointer select-none lowercase"
          >
            {soundProfile === 'Silent' || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-ink-400/60" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-accent" />
            )}
            <span>{soundProfile.toLowerCase()}</span>
          </button>

          {/* Sound Popover */}
          {isSoundOpen ? (
            <div className="absolute right-0 top-full mt-2 w-48 rounded border border-ink-400/20 bg-surface p-3 shadow-xl z-40 animate-in fade-in zoom-in-95 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] text-ink-400 font-sans">
                <span>Volume: {Math.round(volume * 100)}%</span>
                <button
                  type="button"
                  onClick={() => onSoundProfileChange(soundProfile === 'Silent' ? 'Thock' : 'Silent')}
                  className="text-accent hover:underline cursor-pointer"
                >
                  {soundProfile === 'Silent' || volume === 0 ? 'Unmute' : 'Mute'}
                </button>
              </div>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="w-full h-1 bg-ink-400/20 accent-accent cursor-pointer"
              />

              {/* Switches list */}
              <div className="text-[10px] text-ink-400 pt-1 border-t border-ink-400/10 font-sans">
                Switch acoustics
              </div>
              <div className="grid grid-cols-2 gap-1">
                {soundProfiles.map(sp => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => {
                      onSoundProfileChange(sp);
                      setIsSoundOpen(false);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono text-left lowercase transition-colors cursor-pointer ${
                      soundProfile === sp
                        ? 'bg-bg text-ink-100 border border-accent/60 font-medium'
                        : 'text-ink-400 hover:text-ink-100 hover:bg-bg/40'
                    }`}
                  >
                    {sp.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Quick Settings Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Arena quick configuration"
          title="Training settings (Blind mode, Sudden Death, Metronome, Ghost, etc.)"
          className="text-ink-400 hover:text-ink-100 transition-colors p-1 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Quick Settings Modal */}
      {isSettingsOpen ? (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-ink-400/20 bg-surface p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b border-ink-400/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-medium text-ink-100">
                  Training Modalities & Tools
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-ink-400 hover:text-ink-100 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Special Practice Modes */}
              <div className="text-[11px] font-mono text-ink-400 uppercase tracking-wider">
                Practice packs
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('N-Grams');
                    setIsSettingsOpen(false);
                  }}
                  className={`p-2.5 rounded border text-left text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                    mode === 'N-Grams'
                      ? 'bg-bg text-ink-100 border-accent'
                      : 'bg-bg/40 text-ink-400 border-ink-400/10 hover:text-ink-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>N-Gram Drills</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onModeChange('Weak Words');
                    setIsSettingsOpen(false);
                  }}
                  className={`p-2.5 rounded border text-left text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                    mode === 'Weak Words'
                      ? 'bg-bg text-ink-100 border-accent'
                      : 'bg-bg/40 text-ink-400 border-ink-400/10 hover:text-ink-100'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Weak Word Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onModeChange('Procedural');
                    setIsSettingsOpen(false);
                  }}
                  className={`p-2.5 rounded border text-left text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                    mode === 'Procedural'
                      ? 'bg-bg text-ink-100 border-accent'
                      : 'bg-bg/40 text-ink-400 border-ink-400/10 hover:text-ink-100'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Generator</span>
                </button>
              </div>

              {/* Discipline & Training Modalities */}
              <div className="text-[11px] font-mono text-ink-400 uppercase tracking-wider pt-2">
                Discipline & Pacers
              </div>

              {/* Blind Mode Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/10 bg-bg/40">
                <div className="flex items-center gap-2.5">
                  <EyeOff className="w-4 h-4 text-accent" />
                  <div>
                    <div className="text-xs font-medium text-ink-100">Blind / Confidence Mode</div>
                    <div className="text-[11px] text-ink-400">Fades correctly typed letters behind caret</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleBlindMode}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    isBlindMode ? 'bg-accent text-white font-medium' : 'bg-surface text-ink-400 border border-ink-400/20'
                  }`}
                >
                  {isBlindMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Sudden Death Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/10 bg-bg/40">
                <div className="flex items-center gap-2.5">
                  <Skull className="w-4 h-4 text-incorrect" />
                  <div>
                    <div className="text-xs font-medium text-ink-100">Sudden Death Mode</div>
                    <div className="text-[11px] text-ink-400">1 mistyped character immediately fails test</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleSuddenDeath}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    isSuddenDeath ? 'bg-incorrect text-white font-medium' : 'bg-surface text-ink-400 border border-ink-400/20'
                  }`}
                >
                  {isSuddenDeath ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Cadence Metronome */}
              <div className="p-2.5 rounded border border-ink-400/10 bg-bg/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-accent" />
                    <div>
                      <div className="text-xs font-medium text-ink-100">Cadence Metronome</div>
                      <div className="text-[11px] text-ink-400">Rhythmic acoustic tempo pacer</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleMetronome}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      isMetronome ? 'bg-accent text-white font-medium' : 'bg-surface text-ink-400 border border-ink-400/20'
                    }`}
                  >
                    {isMetronome ? 'ON' : 'OFF'}
                  </button>
                </div>

                {isMetronome && (
                  <div className="flex items-center gap-1.5 pt-1 border-t border-ink-400/10">
                    <span className="text-[11px] text-ink-400 font-mono">Tempo:</span>
                    {metronomeOptions.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onChangeMetronomePace(p)}
                        className={`px-2 py-0.5 rounded text-xs font-mono cursor-pointer ${
                          metronomePace === p
                            ? 'bg-accent text-white font-medium'
                            : 'bg-surface text-ink-400 hover:text-ink-100 border border-ink-400/20'
                        }`}
                      >
                        {p}w
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ghost Caret Replay */}
              <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/10 bg-bg/40">
                <div className="flex items-center gap-2.5">
                  <Ghost className="w-4 h-4 text-accent" />
                  <div>
                    <div className="text-xs font-medium text-ink-100">Ghost Pace Replay</div>
                    <div className="text-[11px] text-ink-400">Replays your pace when repeating a passage</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleGhost}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    showGhost ? 'bg-accent text-white font-medium' : 'bg-surface text-ink-400 border border-ink-400/20'
                  }`}
                >
                  {showGhost ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Virtual Keyboard */}
              <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/10 bg-bg/40">
                <div className="flex items-center gap-2.5">
                  {showKeyboard ? <Eye className="w-4 h-4 text-ink-100" /> : <EyeOff className="w-4 h-4 text-ink-400" />}
                  <div>
                    <div className="text-xs font-medium text-ink-100">Virtual Keyboard HUD</div>
                    <div className="text-[11px] text-ink-400">Live keycap error heatmap display</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleKeyboard}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    showKeyboard ? 'bg-surface text-ink-100 border border-accent' : 'bg-surface text-ink-400 border border-ink-400/20'
                  }`}
                >
                  {showKeyboard ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Zen Mode */}
              <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/10 bg-bg/40">
                <div className="flex items-center gap-2.5">
                  {zenMode ? <Minimize2 className="w-4 h-4 text-accent" /> : <Maximize2 className="w-4 h-4 text-ink-400" />}
                  <div>
                    <div className="text-xs font-medium text-ink-100">Zen Focus Mode</div>
                    <div className="text-[11px] text-ink-400">Hides all interface chrome while typing (Esc)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleZen}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    zenMode ? 'bg-accent text-white font-medium' : 'bg-surface text-ink-400 border border-ink-400/20'
                  }`}
                >
                  {zenMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
