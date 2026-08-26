import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RotateCcw, Sparkles, Minimize2, X, FileText, Check, Ghost, Skull, Flame, Swords } from 'lucide-react';
import { TypingRecord } from '../../types';
import { SPRINT_WORDS, getRandomPassage, getRandomQuote } from '../../data/passages';
import { generateRandomPassage } from '../../utils/sentenceGenerator';
import { soundEngine, SoundProfile } from '../../utils/soundEngine';
import { calculateGrossWpm, calculateNetWpm, calculateAccuracy, calculateSmoothedWpm } from '../../utils/typingMath';
import { decodeChallengeUrl, recordWeakWord, getWeakWordsDrill } from '../../utils/challengeUtils';
import { ModeSelector, ArenaMode, DifficultyLevel } from './ModeSelector';
import { TelemetryHUD } from './TelemetryHUD';
import { WordSpan } from './WordSpan';
import { VirtualKeyboardHUD } from './VirtualKeyboardHUD';
import { SessionResultsCard, SecondSnapshot } from './SessionResultsCard';
import { Button } from '../ui/Button';

export interface TypingArenaProps {
  onSessionComplete: (record: TypingRecord) => void;
  onOpenCoach?: () => void;
  onZenModeChange?: (isZen: boolean) => void;
  customDrillText?: string | null;
  onClearCustomDrill?: () => void;
}

interface PreviousAttempt {
  targetText: string;
  netWpm: number;
}

const STORAGE_KEYS = {
  MODE: 'typepulse_user_mode',
  DIFFICULTY: 'typepulse_user_difficulty',
  SPRINT_DURATION: 'typepulse_user_sprint_duration',
  WORD_COUNT: 'typepulse_user_word_count',
  SOUND_PROFILE: 'typepulse_user_sound_profile'
};

// Device detection helper: Words & 10-words for Mobile, Passage for PC/Desktop
const isMobileDevice = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return false;
};

const getSavedMode = (): ArenaMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.MODE) as ArenaMode;
    if (saved && ['Passage', 'Time', 'Words', 'N-Grams', 'Weak Words', 'Quotes', 'Code', 'Procedural', 'Custom'].includes(saved)) {
      return saved;
    }
  }
  return isMobileDevice() ? 'Words' : 'Passage';
};

const getSavedDifficulty = (): DifficultyLevel => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.DIFFICULTY) as DifficultyLevel;
    if (saved && ['Easy', 'Medium', 'Hard'].includes(saved)) {
      return saved;
    }
  }
  return 'Medium';
};

const getSavedSprintDuration = (): number => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.SPRINT_DURATION);
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && [15, 30, 60, 120].includes(num)) return num;
    }
  }
  return 30;
};

const getSavedWordCount = (): number => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.WORD_COUNT);
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && [10, 25, 50, 100].includes(num)) return num;
    }
  }
  return isMobileDevice() ? 10 : 25;
};

const getSavedSoundProfile = (): SoundProfile => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_PROFILE) as SoundProfile;
    if (saved && ['Thock', 'Click', 'Topre', 'Buckling', 'Bubble', 'Silent'].includes(saved)) {
      return saved;
    }
  }
  return 'Thock';
};

const getInitialTargetText = (initMode: ArenaMode, initDiff: DifficultyLevel, initWords: number): { text: string; author: string | null } => {
  if (initMode === 'Words') {
    const generated = Array.from({ length: initWords }, () =>
      SPRINT_WORDS[Math.floor(Math.random() * SPRINT_WORDS.length)]
    ).join(' ');
    return { text: generated, author: null };
  } else if (initMode === 'Time') {
    const stream = Array.from({ length: 120 }, () =>
      SPRINT_WORDS[Math.floor(Math.random() * SPRINT_WORDS.length)]
    ).join(' ');
    return { text: stream, author: null };
  } else if (initMode === 'Quotes') {
    const q = getRandomQuote();
    return { text: q.text, author: q.author };
  }
  return {
    text: getRandomPassage(initDiff === 'Easy' ? 'Easy' : initDiff === 'Hard' ? 'Hard' : initMode === 'Code' ? 'Code' : initMode === 'N-Grams' ? 'N-Grams' : 'Medium'),
    author: null
  };
};

export const TypingArena: React.FC<TypingArenaProps> = ({
  onSessionComplete,
  onOpenCoach,
  onZenModeChange,
  customDrillText,
  onClearCustomDrill
}) => {
  const initialMode = useMemo(getSavedMode, []);
  const initialDifficulty = useMemo(getSavedDifficulty, []);
  const initialWordCount = useMemo(getSavedWordCount, []);
  const initialTarget = useMemo(() => getInitialTargetText(initialMode, initialDifficulty, initialWordCount), [initialMode, initialDifficulty, initialWordCount]);

  const [mode, setMode] = useState<ArenaMode>(initialMode);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [sprintDuration, setSprintDuration] = useState<number>(getSavedSprintDuration);
  const [wordCount, setWordCount] = useState<number>(initialWordCount);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>(getSavedSoundProfile);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [showGhost, setShowGhost] = useState<boolean>(true);

  // Training modalities
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);
  const [isSuddenDeath, setIsSuddenDeath] = useState<boolean>(false);
  const [isMetronome, setIsMetronome] = useState<boolean>(false);
  const [metronomePace, setMetronomePace] = useState<number>(80);
  const [suddenDeathFailed, setSuddenDeathFailed] = useState<boolean>(false);

  // Challenge Race Banner
  const [activeChallenge, setActiveChallenge] = useState<{ fromWpm: number; mode: string } | null>(null);

  // Previous run attempt data for ghost replay on repeated passages
  const [previousRun, setPreviousRun] = useState<PreviousAttempt | null>(null);

  // Custom Text Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('');

  const [targetText, setTargetText] = useState<string>(initialTarget.text);
  const [quoteAuthor, setQuoteAuthor] = useState<string | null>(initialTarget.author);
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastPressedKey, setLastPressedKey] = useState<string>('');
  const [lastMistakeKey, setLastMistakeKey] = useState<string>('');
  const [mistypedKeysMap, setMistypedKeysMap] = useState<Record<string, number>>({});

  // Stabilized smoothed live metrics
  const [smoothedNetWpm, setSmoothedNetWpm] = useState<number>(0);
  const [smoothedGrossWpm, setSmoothedGrossWpm] = useState<number>(0);
  const lastKeyTimeRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);

  const [now, setNow] = useState<number>(Date.now());
  const [snapshots, setSnapshots] = useState<SecondSnapshot[]>([]);
  const [lastSnapshotSec, setLastSnapshotSec] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-zen active when typing is in progress or when manually toggled
  const isZenActive = (zenMode || Boolean(startTime && !isFinished));

  // Word list parsed from targetText
  const words = useMemo(() => {
    return targetText.trim().split(/\s+/).filter(Boolean);
  }, [targetText]);

  // Global Auto-Focus: ensures typing always works immediately on any keystroke or tap
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target !== inputRef.current))) {
        return;
      }
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    // Initial auto-focus
    inputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Notify parent of Zen focus mode immediately
  useEffect(() => {
    if (onZenModeChange) {
      onZenModeChange(isZenActive);
    }
  }, [isZenActive, onZenModeChange]);

  // Load new target text helper
  const loadNewText = useCallback((selectedMode = mode, selectedDiff = difficulty, selectedWords = wordCount) => {
    setPreviousRun(null);
    setSuddenDeathFailed(false);

    if (customDrillText) {
      setTargetText(customDrillText);
      setQuoteAuthor(null);
    } else if (selectedMode === 'Words') {
      const generated = Array.from({ length: selectedWords }, () =>
        SPRINT_WORDS[Math.floor(Math.random() * SPRINT_WORDS.length)]
      ).join(' ');
      setTargetText(generated);
      setQuoteAuthor(null);
    } else if (selectedMode === 'Time') {
      const poolSize = Math.max(120, Math.ceil(sprintDuration * 4.5));
      const stream = Array.from({ length: poolSize }, () =>
        SPRINT_WORDS[Math.floor(Math.random() * SPRINT_WORDS.length)]
      ).join(' ');
      setTargetText(stream);
      setQuoteAuthor(null);
    } else if (selectedMode === 'Quotes') {
      const quoteObj = getRandomQuote();
      setTargetText(quoteObj.text);
      setQuoteAuthor(quoteObj.author);
    } else if (selectedMode === 'Procedural') {
      setTargetText(generateRandomPassage(3, 'Medium'));
      setQuoteAuthor(null);
    } else if (selectedMode === 'Weak Words') {
      const weakDrill = getWeakWordsDrill();
      setTargetText(weakDrill || SPRINT_WORDS.slice(0, 20).join(' '));
      setQuoteAuthor(null);
    } else {
      setTargetText(getRandomPassage(selectedDiff === 'Easy' ? 'Easy' : selectedDiff === 'Hard' ? 'Hard' : selectedMode === 'Code' ? 'Code' : selectedMode === 'N-Grams' ? 'N-Grams' : 'Medium'));
      setQuoteAuthor(null);
    }

    setWordIndex(0);
    setTypedWords([]);
    setCurrentInput('');
    setStartTime(null);
    setEndTime(null);
    setIsFinished(false);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIncorrectKeystrokes(0);
    setStreak(0);
    setMistypedKeysMap({});
    setSmoothedNetWpm(0);
    setSmoothedGrossWpm(0);
    setSnapshots([]);
    setLastSnapshotSec(0);
    setTimeout(() => inputRef.current?.focus(), 20);
  }, [mode, difficulty, wordCount, sprintDuration, customDrillText]);

  // Initial mount: check challenge URL
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const challenge = decodeChallengeUrl();
      if (challenge) {
        setActiveChallenge({ fromWpm: challenge.wpm, mode: challenge.mode });
        setTargetText(challenge.text);
        setQuoteAuthor(null);
        setWordIndex(0);
        setTypedWords([]);
        setCurrentInput('');
      }
    }
  }, []);

  // Handle custom drill text changes from parent
  useEffect(() => {
    if (customDrillText) {
      setMode('Custom');
      setTargetText(customDrillText);
      setQuoteAuthor(null);
      setWordIndex(0);
      setTypedWords([]);
      setCurrentInput('');
      setStartTime(null);
      setEndTime(null);
      setIsFinished(false);
      setTotalKeystrokes(0);
      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setStreak(0);
      setMistypedKeysMap({});
      setSmoothedNetWpm(0);
      setSmoothedGrossWpm(0);
      setSnapshots([]);
      setLastSnapshotSec(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [customDrillText]);

  // Live timer interval
  useEffect(() => {
    if (!startTime || isFinished) return;
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  // Calculate live statistics
  const elapsedSeconds = startTime
    ? Math.max(0.1, ((isFinished && endTime ? endTime : now) - startTime) / 1000)
    : 0;

  const sprintRemainingSeconds = mode === 'Time'
    ? Math.max(0, sprintDuration - elapsedSeconds)
    : undefined;

  // Auto finish for Time mode when timer hits zero
  useEffect(() => {
    if (mode === 'Time' && startTime && !isFinished && sprintRemainingSeconds !== undefined && sprintRemainingSeconds <= 0) {
      finishSession();
    }
  }, [mode, startTime, isFinished, sprintRemainingSeconds]);

  // Metronome tick pacing audio effect
  useEffect(() => {
    if (!isMetronome || !startTime || isFinished) return;
    const intervalMs = (60 / metronomePace) * 1000;
    const metronomeInterval = setInterval(() => {
      soundEngine.playMetronomeTick();
    }, intervalMs);
    return () => clearInterval(metronomeInterval);
  }, [isMetronome, startTime, isFinished, metronomePace]);

  // Snapshot telemetry for second-by-second analytics chart
  useEffect(() => {
    if (!startTime || isFinished) return;
    const currentSec = Math.floor(elapsedSeconds);
    if (currentSec > lastSnapshotSec && currentSec >= 1) {
      setLastSnapshotSec(currentSec);
      const rawNet = calculateNetWpm(correctKeystrokes, incorrectKeystrokes, currentSec / 60);
      const rawErrors = incorrectKeystrokes;
      setSnapshots(prev => [...prev, { second: currentSec, wpm: rawNet, errors: rawErrors }]);
    }
  }, [elapsedSeconds, lastSnapshotSec, startTime, isFinished, correctKeystrokes, incorrectKeystrokes]);

  // Calculate characters typed in completed words
  const completedCharacters = useMemo(() => {
    return typedWords.reduce((acc, word) => acc + word.length + 1, 0) + currentInput.length;
  }, [typedWords, currentInput]);

  const totalTargetChars = useMemo(() => {
    return targetText.length;
  }, [targetText]);

  const progressPercent = totalTargetChars > 0
    ? Math.min(100, (completedCharacters / totalTargetChars) * 100)
    : 0;

  const liveAccuracy = calculateAccuracy(correctKeystrokes, totalKeystrokes);

  // Compute ghost racer position based on previous run Net WPM
  const ghostPosition = useMemo(() => {
    if (!showGhost || !previousRun || !startTime || isFinished) {
      return { wordIdx: -1, charOffset: -1 };
    }
    const ghostWpm = previousRun.netWpm || 60;
    const ghostCharsPerSec = (ghostWpm * 5) / 60;
    const totalGhostChars = Math.floor(elapsedSeconds * ghostCharsPerSec);

    let runningChars = 0;
    for (let w = 0; w < words.length; w++) {
      const wordLen = words[w].length;
      if (runningChars + wordLen >= totalGhostChars) {
        const offset = totalGhostChars - runningChars;
        return { wordIdx: w, charOffset: Math.max(0, Math.min(wordLen, offset)) };
      }
      runningChars += wordLen + 1; // account for space
    }
    return { wordIdx: words.length - 1, charOffset: words[words.length - 1]?.length || 0 };
  }, [showGhost, previousRun, startTime, isFinished, elapsedSeconds, words]);

  // Finish session helper
  const finishSession = useCallback(() => {
    const end = Date.now();
    setEndTime(end);
    setIsFinished(true);

    const durationSec = Math.max(1, (end - (startTime || end)) / 1000);
    const grossWpm = calculateGrossWpm(totalKeystrokes, durationSec);
    const netWpm = calculateNetWpm(correctKeystrokes, incorrectKeystrokes, durationSec / 60);
    const accuracy = calculateAccuracy(correctKeystrokes, totalKeystrokes);

    soundEngine.playCompletionChime();

    // Store previous run for ghost racer replay
    setPreviousRun({
      targetText,
      netWpm
    });

    const mistypedStr = Object.entries(mistypedKeysMap)
      .map(([k, count]) => `${k}:${count}`)
      .join(';');

    const newRecord: TypingRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      mode: mode === 'Time' ? `Time (${sprintDuration}s)` : mode === 'Words' ? `Words (${wordCount}w)` : mode,
      difficulty: mode === 'Passage' ? difficulty : 'Medium',
      passageLength: targetText.length,
      charactersTyped: totalKeystrokes,
      timeSeconds: Math.round(durationSec * 10) / 10,
      grossWpm,
      netWpm,
      accuracy,
      totalErrors: incorrectKeystrokes,
      mistypedKeys: mistypedStr || 'None'
    };

    onSessionComplete(newRecord);
  }, [
    startTime,
    totalKeystrokes,
    correctKeystrokes,
    incorrectKeystrokes,
    targetText,
    mistypedKeysMap,
    mode,
    sprintDuration,
    wordCount,
    difficulty,
    onSessionComplete
  ]);

  // Repeat current passage helper
  const repeatCurrentPassage = () => {
    setWordIndex(0);
    setTypedWords([]);
    setCurrentInput('');
    setStartTime(null);
    setEndTime(null);
    setIsFinished(false);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIncorrectKeystrokes(0);
    setStreak(0);
    setMistypedKeysMap({});
    setSmoothedNetWpm(0);
    setSmoothedGrossWpm(0);
    setSnapshots([]);
    setLastSnapshotSec(0);
    setSuddenDeathFailed(false);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  // Keystroke input processor
  const handleCharInput = (char: string) => {
    if (isFinished) return;

    const activeWord = words[wordIndex] || '';
    const charIndex = currentInput.length;
    const expectedChar = activeWord[charIndex];

    const currentNow = Date.now();
    let currentStartTime = startTime;
    if (!currentStartTime) {
      currentStartTime = currentNow;
      setStartTime(currentStartTime);
      lastKeyTimeRef.current = currentNow;
    }

    setLastPressedKey(char);

    const isCorrect = char === expectedChar;

    if (isCorrect) {
      soundEngine.playKeyClick(char, false);
      setCorrectKeystrokes(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      soundEngine.playKeyClick(char, true);
      setIncorrectKeystrokes(prev => prev + 1);
      setStreak(0);
      setLastMistakeKey(char);

      // Track weak word
      if (activeWord) {
        recordWeakWord(activeWord);
      }

      // Sudden death instant failure condition
      if (isSuddenDeath) {
        setSuddenDeathFailed(true);
        finishSession();
        return;
      }

      setMistypedKeysMap(prev => ({
        ...prev,
        [expectedChar || '[space]']: (prev[expectedChar || '[space]'] || 0) + 1
      }));
    }

    setTotalKeystrokes(prev => prev + 1);
    const updatedInput = currentInput + char;
    setCurrentInput(updatedInput);

    // Update stabilized smoothed live WPM
    const currentDurationSec = Math.max(0.1, (currentNow - currentStartTime) / 1000);
    const rawNet = calculateNetWpm(correctKeystrokes + (isCorrect ? 1 : 0), incorrectKeystrokes + (!isCorrect ? 1 : 0), currentDurationSec / 60);
    const rawGross = calculateGrossWpm(totalKeystrokes + 1, currentDurationSec);

    setSmoothedNetWpm(prev => calculateSmoothedWpm(prev, rawNet, currentDurationSec));
    setSmoothedGrossWpm(prev => calculateSmoothedWpm(prev, rawGross, currentDurationSec));

    lastKeyTimeRef.current = currentNow;

    // In Passage / Words / Code mode: auto finish on final character of final word
    if (mode !== 'Time' && wordIndex === words.length - 1 && updatedInput === activeWord) {
      setTypedWords(prev => [...prev, updatedInput]);
      setCurrentInput('');
      finishSession();
    }
  };

  // Spacebar word advance handler
  const handleSpace = () => {
    if (isFinished || !currentInput) return;

    const activeWord = words[wordIndex] || '';
    const isWordCorrect = currentInput === activeWord;

    soundEngine.playKeyClick(' ', !isWordCorrect);

    setTypedWords(prev => [...prev, currentInput]);
    setCurrentInput('');
    setWordIndex(prev => prev + 1);
    setLastPressedKey(' ');

    if (!isWordCorrect) {
      recordWeakWord(activeWord);
    }

    // In Passage / Words mode: finish if last word was just submitted
    if (mode !== 'Time' && wordIndex >= words.length - 1) {
      finishSession();
    }
  };

  // Keyboard input handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      loadNewText();
      return;
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      repeatCurrentPassage();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setZenMode(prev => !prev);
      return;
    }

    if (isFinished) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (e.ctrlKey || e.altKey) {
        setCurrentInput('');
      } else if (currentInput.length > 0) {
        setCurrentInput(prev => prev.slice(0, -1));
      }
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      handleSpace();
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      handleCharInput(e.key);
    }
  };

  // Mobile / Touchscreen Input Handler: handles single keys, space, and autocomplete bursts
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    if (val.endsWith(' ') || val.includes(' ')) {
      const parts = val.split(' ');
      parts.forEach((p, idx) => {
        if (idx < parts.length - 1) {
          for (let i = 0; i < p.length; i++) {
            handleCharInput(p[i]);
          }
          handleSpace();
        } else if (p.length > 0) {
          for (let i = 0; i < p.length; i++) {
            handleCharInput(p[i]);
          }
        }
      });
    } else {
      for (let i = 0; i < val.length; i++) {
        handleCharInput(val[i]);
      }
    }
    e.target.value = '';
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    inputRef.current?.focus();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputText.trim()) {
      setPreviousRun(null);
      setMode('Custom');
      try { localStorage.setItem(STORAGE_KEYS.MODE, 'Custom'); } catch {}
      setTargetText(customInputText.trim());
      setQuoteAuthor(null);
      setWordIndex(0);
      setTypedWords([]);
      setCurrentInput('');
      setStartTime(null);
      setEndTime(null);
      setIsFinished(false);
      setTotalKeystrokes(0);
      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setStreak(0);
      setMistypedKeysMap({});
      setSmoothedNetWpm(0);
      setSmoothedGrossWpm(0);
      setSnapshots([]);
      setIsCustomModalOpen(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const activeTargetWord = words[wordIndex] || '';
  const activeExpectedChar = activeTargetWord[currentInput.length] || 'space';

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto space-y-4 select-none transition-all duration-300 font-sans"
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasClick}
    >
      {/* Custom Text Import Modal */}
      {isCustomModalOpen ? (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-ink-400/20 bg-surface p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ink-400/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-medium text-ink-100 font-sans">
                  Custom practice text
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-ink-400 hover:text-ink-100 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <p className="text-xs text-ink-400 font-sans">
                Paste any article, lecture notes, or code to practice typing your own custom material.
              </p>
              <textarea
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="Paste custom passage text here..."
                rows={5}
                required
                className="w-full rounded border border-ink-400/20 bg-bg p-3 text-xs font-mono text-ink-100 placeholder:text-ink-400/40 focus:outline-none focus:border-accent"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCustomModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Check className="w-3.5 h-3.5" />}
                >
                  Start practice
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Challenge Link Banner if active */}
      {activeChallenge && !isZenActive ? (
        <div className="p-2.5 rounded-lg border border-accent bg-surface/90 flex items-center justify-between gap-3 text-xs font-sans animate-in fade-in">
          <div className="flex items-center gap-2 text-ink-100 min-w-0">
            <Swords className="w-4 h-4 text-accent shrink-0" />
            <span className="font-medium">Ghost Challenge Active</span>
            <span className="text-ink-400 hidden sm:inline">• Beat target ghost of {activeChallenge.fromWpm} WPM!</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveChallenge(null);
              loadNewText();
            }}
            className="text-xs font-mono text-accent hover:underline cursor-pointer shrink-0"
          >
            Exit race
          </button>
        </div>
      ) : null}

      {/* Custom Drill Banner if active */}
      {customDrillText && !isZenActive ? (
        <div className="p-2.5 rounded-lg border border-accent/40 bg-surface/80 flex items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2 text-ink-100 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-medium truncate">Active adaptive drill</span>
            <span className="text-ink-400 hidden sm:inline">• Targeting diagnosed error clusters</span>
          </div>
          {onClearCustomDrill ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearCustomDrill();
                loadNewText('Words', difficulty, isMobileDevice() ? 10 : 25);
              }}
              className="text-xs font-mono text-accent hover:underline cursor-pointer shrink-0"
            >
              Exit drill
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Sudden Death Banner if failed */}
      {suddenDeathFailed ? (
        <div className="p-2.5 rounded-lg border border-incorrect/40 bg-surface flex items-center justify-between gap-3 text-xs font-sans animate-in fade-in">
          <div className="flex items-center gap-2 text-incorrect min-w-0">
            <Skull className="w-4 h-4 text-incorrect shrink-0" />
            <span className="font-medium">Sudden Death Failed (1 mistake allowed)</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              repeatCurrentPassage();
            }}
            className="text-xs font-mono text-ink-100 hover:underline cursor-pointer shrink-0 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Retry (Tab)
          </button>
        </div>
      ) : null}

      {/* Single Unified Minimalist Mode Ribbon */}
      {!isFinished && !isZenActive ? (
        <ModeSelector
          mode={mode}
          difficulty={difficulty}
          sprintDuration={sprintDuration}
          wordCount={wordCount}
          soundProfile={soundProfile}
          zenMode={zenMode}
          showKeyboard={showKeyboard}
          showGhost={showGhost}
          isBlindMode={isBlindMode}
          isSuddenDeath={isSuddenDeath}
          isMetronome={isMetronome}
          metronomePace={metronomePace}
          onModeChange={(m) => {
            if (customDrillText && onClearCustomDrill) {
              onClearCustomDrill();
            }
            setMode(m);
            try { localStorage.setItem(STORAGE_KEYS.MODE, m); } catch {}
            loadNewText(m, difficulty, wordCount);
          }}
          onDifficultyChange={(d) => {
            if (customDrillText && onClearCustomDrill) {
              onClearCustomDrill();
            }
            setDifficulty(d);
            try { localStorage.setItem(STORAGE_KEYS.DIFFICULTY, d); } catch {}
            loadNewText('Passage', d, wordCount);
          }}
          onSprintDurationChange={(dur) => {
            if (customDrillText && onClearCustomDrill) {
              onClearCustomDrill();
            }
            setSprintDuration(dur);
            try { localStorage.setItem(STORAGE_KEYS.SPRINT_DURATION, String(dur)); } catch {}
            loadNewText('Time', difficulty, wordCount);
          }}
          onWordCountChange={(count) => {
            if (customDrillText && onClearCustomDrill) {
              onClearCustomDrill();
            }
            setWordCount(count);
            try { localStorage.setItem(STORAGE_KEYS.WORD_COUNT, String(count)); } catch {}
            loadNewText('Words', difficulty, count);
          }}
          onSoundProfileChange={(sp) => {
            setSoundProfile(sp);
            try { localStorage.setItem(STORAGE_KEYS.SOUND_PROFILE, sp); } catch {}
          }}
          onToggleZen={() => setZenMode(prev => !prev)}
          onToggleKeyboard={() => setShowKeyboard(prev => !prev)}
          onToggleGhost={() => setShowGhost(prev => !prev)}
          onToggleBlindMode={() => setIsBlindMode(prev => !prev)}
          onToggleSuddenDeath={() => setIsSuddenDeath(prev => !prev)}
          onToggleMetronome={() => setIsMetronome(prev => !prev)}
          onChangeMetronomePace={setMetronomePace}
          onOpenCustomModal={() => setIsCustomModalOpen(true)}
        />
      ) : null}

      {/* Whisper-Light Ambient Telemetry */}
      {!isZenActive ? (
        <TelemetryHUD
          netWpm={startTime ? smoothedNetWpm : 0}
          grossWpm={startTime ? smoothedGrossWpm : 0}
          accuracy={liveAccuracy}
          streak={streak}
          isTyping={Boolean(startTime && !isFinished)}
          mode={mode}
          sprintRemainingSeconds={sprintRemainingSeconds}
          progressPercent={progressPercent}
        />
      ) : null}

      {/* Main Minimalist Typing Canvas */}
      {!isFinished ? (
        <div
          className={`relative w-full rounded-lg border border-ink-400/10 bg-surface/50 backdrop-blur-sm cursor-text group flex flex-col justify-between transition-all duration-300 ${
            isZenActive ? 'p-8 sm:p-14 min-h-[280px]' : 'p-6 sm:p-10 min-h-[220px]'
          }`}
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasClick}
        >
          {/* Floating Fire Streak Indicator (Always visible during Blind & Zen modes) */}
          {streak >= 5 && (
            <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface/90 border border-accent/40 shadow-lg text-xs font-mono text-accent animate-in fade-in zoom-in-95 z-20 pointer-events-none">
              <Flame className="w-3.5 h-3.5 fill-accent animate-pulse" />
              <span className="font-semibold">{streak} streak</span>
            </div>
          )}

          {/* Transparent Input Overlay (z-10 ensures direct tap/click delivery on mobile & desktop) */}
          <input
            ref={inputRef}
            type="text"
            className="absolute inset-0 opacity-0 cursor-text w-full h-full z-10"
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
            inputMode="text"
            autoFocus
            aria-label="Touch typing input arena"
          />

          {/* Typing Text Block: Word-Buffered Engine */}
          <div className="pointer-events-none">
            <div
              className="font-mono text-lg sm:text-2xl leading-relaxed tracking-normal select-none flex flex-wrap items-baseline font-normal"
              style={{ fontVariantLigatures: 'none', fontFeatureSettings: '"calt" 0, "liga" 0' }}
            >
              {words.map((targetWord, idx) => {
                const isCurrent = idx === wordIndex;
                const typedWord = idx < wordIndex ? typedWords[idx] : undefined;
                const isGhostWord = ghostPosition.wordIdx === idx;
                const ghostOffset = isGhostWord ? ghostPosition.charOffset : -1;

                return (
                  <WordSpan
                    key={idx}
                    targetWord={targetWord}
                    typedWord={typedWord}
                    isCurrentWord={isCurrent}
                    currentInput={isCurrent ? currentInput : ''}
                    isGhost={isGhostWord}
                    ghostCharOffset={ghostOffset}
                    isBlindMode={isBlindMode}
                    isBursting={streak >= 15}
                  />
                );
              })}
            </div>

            {/* Elegant Quote Author Attribution (Only shown in Quotes mode) */}
            {quoteAuthor && (
              <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-sans text-ink-400 select-none animate-in fade-in duration-200">
                <span className="w-4 h-[1px] bg-ink-400/40 inline-block" />
                <span>{quoteAuthor}</span>
              </div>
            )}
          </div>

          {/* Subtle Bottom Restart Trigger / Sound / Shortcuts Bar */}
          <div className="flex items-center justify-between pt-4 text-xs font-mono text-ink-400 select-none relative z-20">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadNewText();
                }}
                className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer"
                title="Restart test (Tab)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>restart test</span>
              </button>

              {previousRun && !isFinished ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    repeatCurrentPassage();
                  }}
                  className="flex items-center gap-1 text-ink-400 hover:text-accent transition-colors cursor-pointer"
                  title="Repeat with ghost racer"
                >
                  <Ghost className="w-3.5 h-3.5" />
                  <span>race ghost ({previousRun.netWpm} wpm)</span>
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-ink-400/50">tab to restart • shift+enter to repeat</span>
              {zenMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZenMode(false);
                  }}
                  className="flex items-center gap-1 text-accent hover:underline cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>exit zen</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <SessionResultsCard
          record={{
            id: `${Date.now()}`,
            timestamp: new Date().toISOString(),
            mode: mode === 'Time' ? `Time (${sprintDuration}s)` : mode === 'Words' ? `Words (${wordCount}w)` : mode,
            difficulty: mode === 'Passage' ? difficulty : 'Medium',
            passageLength: targetText.length,
            charactersTyped: totalKeystrokes,
            timeSeconds: Math.round(elapsedSeconds * 10) / 10,
            grossWpm: calculateGrossWpm(totalKeystrokes, elapsedSeconds),
            netWpm: calculateNetWpm(correctKeystrokes, incorrectKeystrokes, elapsedSeconds / 60),
            accuracy: calculateAccuracy(correctKeystrokes, totalKeystrokes),
            totalErrors: incorrectKeystrokes,
            mistypedKeys: Object.entries(mistypedKeysMap).map(([k, c]) => `${k}:${c}`).join(';') || 'None'
          }}
          snapshots={snapshots}
          onRestart={loadNewText}
          onRepeatPassage={repeatCurrentPassage}
          onOpenCoach={onOpenCoach}
        />
      )}

      {/* Real-Time Virtual Keyboard HUD */}
      {showKeyboard && !isFinished && !isZenActive ? (
        <VirtualKeyboardHUD
          activeKey={activeExpectedChar}
          lastPressedKey={lastPressedKey}
          lastMistakeKey={lastMistakeKey}
        />
      ) : null}
    </div>
  );
};
