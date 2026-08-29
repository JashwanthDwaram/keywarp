import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Settings, X, Ghost, Eye, EyeOff, Skull, Activity, ShieldAlert, Layers, Shuffle, Maximize2, Minimize2, Waves, Code2, BookOpen } from 'lucide-react';
import { SoundProfile, AmbientSoundscape, soundEngine } from '../../utils/soundEngine';
import { CodeLanguage, WordFrequencyPack } from '../../data/codingPresets';

export type ArenaMode = 'Passage' | 'Time' | 'Words' | 'N-Grams' | 'Weak Words' | 'Quotes' | 'Code' | 'Procedural' | 'Custom';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface ModeSelectorProps {
  mode: ArenaMode;
  difficulty: DifficultyLevel;
  sprintDuration: number;
  wordCount: number;
  codeLanguage?: CodeLanguage;
  wordFrequencyPack?: WordFrequencyPack;
  soundProfile: SoundProfile;
  ambientSoundscape?: AmbientSoundscape;
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
  onCodeLanguageChange?: (lang: CodeLanguage) => void;
  onWordFrequencyPackChange?: (pack: WordFrequencyPack) => void;
  onSoundProfileChange: (newProfile: SoundProfile) => void;
  onAmbientSoundscapeChange?: (soundscape: AmbientSoundscape) => void;
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
  codeLanguage = 'typescript',
  wordFrequencyPack = '1k',
  soundProfile,
  ambientSoundscape = 'Off',
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
  onCodeLanguageChange,
  onWordFrequencyPackChange,
  onSoundProfileChange,
  onAmbientSoundscapeChange,
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
  const [ambientVolume, setLocalAmbientVolume] = useState<number>(soundEngine.getAmbientVolume());
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
  const isCookieUnlocked =
    typeof window !== 'undefined' &&
    (localStorage.getItem('keywarp_cookie_unlocked') === 'true' ||
      localStorage.getItem('keywarp_cookie_mode') === 'true');
  const soundProfiles: SoundProfile[] = isCookieUnlocked
    ? ['Thock', 'Click', 'Topre', 'Buckling', 'Bubble', 'Cookie', 'Silent']
    : ['Thock', 'Click', 'Topre', 'Buckling', 'Bubble', 'Silent'];
  const ambientProfiles: { id: AmbientSoundscape; label: string }[] = [
    { id: 'Off', label: 'off' },
    { id: 'Drone', label: 'drone' },
    { id: 'Brown', label: 'brown noise' },
    { id: 'Binaural', label: '432hz focus' }
  ];

  const codeLanguages: { id: CodeLanguage; label: string }[] = [
    { id: 'typescript', label: 'ts' },
    { id: 'python', label: 'python' },
    { id: 'rust', label: 'rust' },
    { id: 'sql', label: 'sql' },
    { id: 'htmlcss', label: 'html/css' },
    { id: 'golang', label: 'go' }
  ];

  const vocabPacks: { id: WordFrequencyPack; label: string }[] = [
    { id: '1k', label: '1k' },
    { id: '5k', label: '5k' },
    { id: '10k', label: '10k' },
    { id: 'tech', label: 'tech' }
  ];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalVolume(val);
    soundEngine.setVolume(val);
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalAmbientVolume(val);
    soundEngine.setAmbientVolume(val);
  };

  return (
    <div id="arena-ribbon-card" className="w-full flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-surface/80 border border-ink-400/10 text-xs font-mono select-none">
      {/* 1. Unified Command Ribbon (All Lowercase & Clean Contrast) */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5 scrollbar-none">
        {/* Primary Modes */}
        <div className="flex items-center gap-2.5 shrink-0">
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
        {(mode === 'Time' || mode === 'Words' || mode === 'Passage' || mode === 'Code') && (
          <span className="text-ink-400/30 px-1 shrink-0">|</span>
        )}

        {/* Time Options */}
        {mode === 'Time' && (
          <div className="flex items-center gap-2 shrink-0">
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
          <div className="flex items-center gap-2 shrink-0">
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
            {onWordFrequencyPackChange ? (
              <>
                <span className="text-ink-400/30 px-0.5">•</span>
                {vocabPacks.map(vp => (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => onWordFrequencyPackChange(vp.id)}
                    className={`transition-colors cursor-pointer lowercase ${
                      wordFrequencyPack === vp.id
                        ? 'text-accent font-medium'
                        : 'text-ink-400/70 hover:text-ink-100'
                    }`}
                  >
                    {vp.label}
                  </button>
                ))}
              </>
            ) : null}
          </div>
        )}

        {/* Code Languages Options */}
        {mode === 'Code' && onCodeLanguageChange && (
          <div className="flex items-center gap-2 shrink-0">
            {codeLanguages.map(cl => (
              <button
                key={cl.id}
                type="button"
                onClick={() => onCodeLanguageChange(cl.id)}
                className={`transition-colors cursor-pointer lowercase ${
                  codeLanguage === cl.id
                    ? 'text-accent font-medium'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {cl.label}
              </button>
            ))}
          </div>
        )}

        {/* Difficulty Options */}
        {mode === 'Passage' && (
          <div className="flex items-center gap-2 shrink-0">
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
            <span className="text-ink-400/30 px-1 shrink-0">|</span>
            <span className="text-accent font-medium lowercase shrink-0">
              {mode === 'N-Grams' ? 'n-grams' : mode === 'Weak Words' ? 'weak words' : 'generator'}
            </span>
          </>
        )}
      </div>

      {/* 2. Quiet Actions (Sound Pill & Config Button) */}
      <div className="flex items-center gap-2.5 shrink-0">
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
            <span>{soundProfile === 'Cookie' ? 'crunch' : soundProfile.toLowerCase()}</span>
            {ambientSoundscape !== 'Off' && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" title={`Ambience: ${ambientSoundscape}`} />
            )}
          </button>

          {/* Sound Popover */}
          {isSoundOpen ? (
            <div className="absolute right-0 top-full mt-2 w-56 rounded border border-ink-400/20 bg-surface p-3.5 shadow-2xl z-40 animate-in fade-in zoom-in-95 space-y-3">
              {/* Mechanical Switch Sound Volume */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-ink-400 font-sans">
                  <span className="font-medium text-ink-100/90">Switch volume: {Math.round(volume * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => onSoundProfileChange(soundProfile === 'Silent' ? 'Thock' : 'Silent')}
                    className="text-accent hover:underline cursor-pointer"
                  >
                    {soundProfile === 'Silent' || volume === 0 ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Switch volume slider"
                  className="w-full h-1 bg-ink-400/20 accent-accent cursor-pointer"
                />
              </div>

              {/* Switches list */}
              <div className="space-y-1 pt-1 border-t border-ink-400/10">
                <div className="text-[10px] text-ink-400 font-sans">
                  Tactile switch acoustic
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {soundProfiles.map(sp => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => {
                        onSoundProfileChange(sp);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-mono text-left lowercase transition-colors cursor-pointer ${
                        soundProfile === sp
                          ? 'bg-bg text-accent border border-accent/40 font-medium'
                          : 'text-ink-400 hover:text-ink-100 hover:bg-bg/40'
                      }`}
                    >
                      {sp === 'Cookie' ? '🍪 crunch' : sp.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flow Ambience Drone */}
              {onAmbientSoundscapeChange && (
                <div className="space-y-2 pt-2 border-t border-ink-400/10">
                  <div className="flex items-center justify-between text-[10px] font-sans">
                    <span className="text-ink-100 font-medium flex items-center gap-1">
                      <Waves className="w-3 h-3 text-accent" /> Flow soundscape
                    </span>
                    <span className="text-ink-400 font-mono text-[9px]">{Math.round(ambientVolume * 100)}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={handleAmbientVolumeChange}
                    aria-label="Ambient volume slider"
                    className="w-full h-1 bg-ink-400/20 accent-accent cursor-pointer"
                  />

                  <div className="grid grid-cols-2 gap-1">
                    {ambientProfiles.map(ap => (
                      <button
                        key={ap.id}
                        type="button"
                        onClick={() => {
                          onAmbientSoundscapeChange(ap.id);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-mono text-left lowercase transition-colors cursor-pointer ${
                          ambientSoundscape === ap.id
                            ? 'bg-bg text-accent border border-accent/40 font-semibold'
                            : 'text-ink-400 hover:text-ink-100 hover:bg-bg/40'
                        }`}
                      >
                        {ap.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md rounded-xl border border-ink-400/20 bg-surface p-4 sm:p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 font-sans max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-ink-400/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-medium text-ink-100">
                  Training Modalities & Soundscapes
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

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {/* Specialized Practice Modes */}
              <div className="text-[11px] font-mono text-ink-400 uppercase tracking-wider">
                Specialized Curriculums
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
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-ink-400/15 bg-bg/50 text-ink-100 hover:border-ink-400/40'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5 text-accent shrink-0" />
                  <div>
                    <div className="font-medium font-mono text-[11px]">N-Grams</div>
                    <div className="text-[10px] text-ink-400">Bi-gram pairs</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onModeChange('Weak Words');
                    setIsSettingsOpen(false);
                  }}
                  className={`p-2.5 rounded border text-left text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                    mode === 'Weak Words'
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-ink-400/15 bg-bg/50 text-ink-100 hover:border-ink-400/40'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-accent shrink-0" />
                  <div>
                    <div className="font-medium font-mono text-[11px]">Weak Words</div>
                    <div className="text-[10px] text-ink-400">Error history</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onModeChange('Procedural');
                    setIsSettingsOpen(false);
                  }}
                  className={`p-2.5 rounded border text-left text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                    mode === 'Procedural'
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-ink-400/15 bg-bg/50 text-ink-100 hover:border-ink-400/40'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                  <div>
                    <div className="font-medium font-mono text-[11px]">Generator</div>
                    <div className="text-[10px] text-ink-400">Markov syntax</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    onOpenCustomModal();
                  }}
                  className="p-2.5 rounded border border-ink-400/15 bg-bg/50 text-left text-xs transition-colors cursor-pointer flex items-center gap-2 text-ink-100 hover:border-accent/40"
                >
                  <Code2 className="w-3.5 h-3.5 text-accent shrink-0" />
                  <div>
                    <div className="font-medium font-mono text-[11px]">File / Code Drop</div>
                    <div className="text-[10px] text-ink-400">Custom import</div>
                  </div>
                </button>
              </div>

              {/* Training Modalities */}
              <div className="text-[11px] font-mono text-ink-400 uppercase tracking-wider pt-2 border-t border-ink-400/10">
                Focus Modalities
              </div>

              <div className="space-y-1.5">
                {/* Blind Mode */}
                <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/15 bg-bg/40">
                  <div className="flex items-center gap-2.5">
                    {isBlindMode ? <EyeOff className="w-4 h-4 text-accent" /> : <Eye className="w-4 h-4 text-ink-400" />}
                    <div>
                      <div className="text-xs font-medium text-ink-100 font-mono">Blind Mode</div>
                      <div className="text-[10px] text-ink-400">Hides typed letters to force muscle memory</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleBlindMode}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      isBlindMode ? 'bg-accent' : 'bg-ink-400/20'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      isBlindMode ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Sudden Death */}
                <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/15 bg-bg/40">
                  <div className="flex items-center gap-2.5">
                    <Skull className={`w-4 h-4 ${isSuddenDeath ? 'text-incorrect' : 'text-ink-400'}`} />
                    <div>
                      <div className="text-xs font-medium text-ink-100 font-mono">Sudden Death</div>
                      <div className="text-[10px] text-ink-400">1 mistake instantly fails the test</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleSuddenDeath}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      isSuddenDeath ? 'bg-incorrect' : 'bg-ink-400/20'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      isSuddenDeath ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Ghost Racer */}
                <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/15 bg-bg/40">
                  <div className="flex items-center gap-2.5">
                    <Ghost className={`w-4 h-4 ${showGhost ? 'text-accent' : 'text-ink-400'}`} />
                    <div>
                      <div className="text-xs font-medium text-ink-100 font-mono">Ghost Caret</div>
                      <div className="text-[10px] text-ink-400">Replays your previous run's pace on repeated tests</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleGhost}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      showGhost ? 'bg-accent' : 'bg-ink-400/20'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      showGhost ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Metronome */}
                <div className="flex items-center justify-between p-2.5 rounded border border-ink-400/15 bg-bg/40">
                  <div className="flex items-center gap-2.5">
                    <Activity className={`w-4 h-4 ${isMetronome ? 'text-accent' : 'text-ink-400'}`} />
                    <div>
                      <div className="text-xs font-medium text-ink-100 font-mono">Audio Metronome</div>
                      <div className="text-[10px] text-ink-400">Rhythm pacing audio clicks</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMetronome && (
                      <div className="flex items-center gap-1">
                        {metronomeOptions.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => onChangeMetronomePace(p)}
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer ${
                              metronomePace === p ? 'bg-accent text-accent-contrast font-bold' : 'bg-bg text-ink-400'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={onToggleMetronome}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                        isMetronome ? 'bg-accent' : 'bg-ink-400/20'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        isMetronome ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
