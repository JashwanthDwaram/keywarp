import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RotateCcw, Sparkles, Minimize2, X, FileText, Check, Ghost, Skull, Flame, Swords, Zap, Upload, Code2, Clock } from 'lucide-react';
import { TypingRecord } from '../../types';
import { SPRINT_WORDS, getRandomPassage, getRandomQuote } from '../../data/passages';
import { generateRandomPassage } from '../../utils/sentenceGenerator';
import { soundEngine, SoundProfile, AmbientSoundscape } from '../../utils/soundEngine';
import { CodeLanguage, WordFrequencyPack, getRandomCodeSnippet, getRandomVocabWords } from '../../data/codingPresets';
import { parseCodeForTyping } from '../../utils/codeParser';
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
  onOpenTour?: () => void;
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

const getInitialTargetText = (
  initMode: ArenaMode,
  initDiff: DifficultyLevel,
  initWords: number,
  lang: CodeLanguage = 'typescript',
  pack: WordFrequencyPack = '1k'
): { text: string; author: string | null } => {
  if (initMode === 'Words') {
    return { text: getRandomVocabWords(pack, initWords), author: null };
  } else if (initMode === 'Code') {
    return { text: getRandomCodeSnippet(lang), author: null };
  } else if (initMode === 'Time') {
    const stream = Array.from({ length: 36 }, () =>
      SPRINT_WORDS[Math.floor(Math.random() * SPRINT_WORDS.length)]
    ).join(' ');
    return { text: stream, author: null };
  } else if (initMode === 'Quotes') {
    const q = getRandomQuote();
    return { text: q.text, author: q.author };
  }
  return {
    text: getRandomPassage(initDiff === 'Easy' ? 'Easy' : initDiff === 'Hard' ? 'Hard' : 'Medium'),
    author: null
  };
};

export const TypingArena: React.FC<TypingArenaProps> = ({
  onSessionComplete,
  onOpenCoach,
  onOpenTour,
  onZenModeChange,
  customDrillText,
  onClearCustomDrill
}) => {
  const [mode, setMode] = useState<ArenaMode>(getSavedMode);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(getSavedDifficulty);
  const [sprintDuration, setSprintDuration] = useState<number>(getSavedSprintDuration);
  const [wordCount, setWordCount] = useState<number>(getSavedWordCount);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>(getSavedSoundProfile);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('typescript');
  const [wordFrequencyPack, setWordFrequencyPack] = useState<WordFrequencyPack>('1k');
  const [ambientSoundscape, setAmbientSoundscape] = useState<AmbientSoundscape>('Off');
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

  // Initial text is generated synchronously on render 1 (never empty string)
  const [targetText, setTargetText] = useState<string>(() => {
    return getInitialTargetText(getSavedMode(), getSavedDifficulty(), getSavedWordCount()).text;
  });
  const [quoteAuthor, setQuoteAuthor] = useState<string | null>(() => {
    return getInitialTargetText(getSavedMode(), getSavedDifficulty(), getSavedWordCount()).author;
  });

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
  const [lastCompletedRecord, setLastCompletedRecord] = useState<TypingRecord | null>(null);

  // Stabilized smoothed live metrics
  const [smoothedNetWpm, setSmoothedNetWpm] = useState<number>(0);
  const [smoothedGrossWpm, setSmoothedGrossWpm] = useState<number>(0);
  const lastKeyTimeRef = useRef<number>(0);

  const [now, setNow] = useState<number>(Date.now());
  const [snapshots, setSnapshots] = useState<SecondSnapshot[]>([]);
  const [lastSnapshotSec, setLastSnapshotSec] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Version-scoped calibration flag: shows once for any user on 1.2.8, then permanently retires
  const [hasDoneVersionTest, setHasDoneVersionTest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('typepulse_1_2_8_test_completed') === 'true';
    } catch {
      return false;
    }
  });

  // Auto-zen active when typing is in progress or when manually toggled
  const isZenActive = (zenMode || Boolean(startTime && !isFinished));

  // Word list parsed from targetText
  const words = useMemo(() => {
    return targetText.trim().split(/\s+/).filter(Boolean);
  }, [targetText]);

  // Smoothly keep the active word line visible in the 3-line focus window
  useEffect(() => {
    if (!wordsContainerRef.current) return;
    const activeEl = document.getElementById(`word-${wordIndex}`);
    if (activeEl && wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const wordTop = activeEl.offsetTop;
      const lineHeight = activeEl.offsetHeight || 38;
      if (wordTop > lineHeight * 0.9) {
        container.scrollTo({ top: wordTop - lineHeight, behavior: 'smooth' });
      } else {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [wordIndex]);

  // Initial focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update sound engine profile
  useEffect(() => {
    soundEngine.setProfile(soundProfile);
  }, [soundProfile]);

  // Notify parent of Zen focus mode immediately
  useEffect(() => {
    if (onZenModeChange) {
      onZenModeChange(isZenActive);
    }
  }, [isZenActive, onZenModeChange]);

  // Load new target text helper
  const loadNewText = useCallback((
    selectedMode = mode,
    selectedDiff = difficulty,
    selectedWords = wordCount,
    selectedLang = codeLanguage,
    selectedPack = wordFrequencyPack
  ) => {
    setPreviousRun(null);
    setSuddenDeathFailed(false);

    if (customDrillText) {
      setTargetText(customDrillText);
      setQuoteAuthor(null);
    } else if (selectedMode === 'Words') {
      const generated = getRandomVocabWords(selectedPack, selectedWords);
      setTargetText(generated);
      setQuoteAuthor(null);
    } else if (selectedMode === 'Code') {
      setTargetText(getRandomCodeSnippet(selectedLang));
      setQuoteAuthor(null);
    } else if (selectedMode === 'Time') {
      const poolSize = Math.max(30, Math.min(60, Math.round(sprintDuration * 1.2)));
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
      setTargetText(getRandomPassage(selectedDiff === 'Easy' ? 'Easy' : selectedDiff === 'Hard' ? 'Hard' : selectedMode === 'N-Grams' ? 'N-Grams' : 'Medium'));
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
  }, [mode, difficulty, wordCount, sprintDuration, codeLanguage, wordFrequencyPack, customDrillText]);

  const handleCodeLanguageChange = useCallback((lang: CodeLanguage) => {
    setCodeLanguage(lang);
    if (mode === 'Code') {
      setPreviousRun(null);
      setTargetText(getRandomCodeSnippet(lang));
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
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [mode]);

  const handleWordFrequencyPackChange = useCallback((pack: WordFrequencyPack) => {
    setWordFrequencyPack(pack);
    if (mode === 'Words') {
      setPreviousRun(null);
      setTargetText(getRandomVocabWords(pack, wordCount));
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
      setLastCompletedRecord(null);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [mode, wordCount]);

  const handleAmbientSoundscapeChange = useCallback((soundscape: AmbientSoundscape) => {
    setAmbientSoundscape(soundscape);
    soundEngine.setAmbientSoundscape(soundscape);
  }, []);

  // Initial challenge check
  useEffect(() => {
    const challenge = decodeChallengeUrl();
    if (challenge) {
      setActiveChallenge({ fromWpm: challenge.wpm, mode: challenge.mode });
      setTargetText(challenge.text);
      setQuoteAuthor(null);
      setWordIndex(0);
      setTypedWords([]);
      setCurrentInput('');
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

  // Live timer interval & cadence decay (if typing stops for >1.5s, streak fades out)
  useEffect(() => {
    if (!startTime || isFinished) return;
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      if (lastKeyTimeRef.current > 0 && currentNow - lastKeyTimeRef.current > 1500) {
        setStreak(0);
      }
    }, 100);
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
      const rawNet = calculateNetWpm(correctKeystrokes, incorrectKeystrokes, currentSec);
      const rawGross = calculateGrossWpm(totalKeystrokes, currentSec);
      const rawErrors = incorrectKeystrokes;
      setSnapshots(prev => [...prev, { second: currentSec, wpm: rawNet, raw: rawGross, errors: rawErrors }]);
    }
  }, [elapsedSeconds, lastSnapshotSec, startTime, isFinished, correctKeystrokes, incorrectKeystrokes, totalKeystrokes]);

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
  const finishSession = useCallback((overrides?: {
    totalKeystrokes?: number;
    correctKeystrokes?: number;
    incorrectKeystrokes?: number;
    mistypedMap?: Record<string, number>;
    isSuddenDeathFailed?: boolean;
  }) => {
    const end = Date.now();
    setEndTime(end);
    setIsFinished(true);

    const effectiveTotal = overrides?.totalKeystrokes !== undefined ? overrides.totalKeystrokes : totalKeystrokes;
    const effectiveCorrect = overrides?.correctKeystrokes !== undefined ? overrides.correctKeystrokes : correctKeystrokes;
    const effectiveIncorrect = overrides?.incorrectKeystrokes !== undefined ? overrides.incorrectKeystrokes : incorrectKeystrokes;
    const effectiveMistypedMap = overrides?.mistypedMap || mistypedKeysMap;
    const isFailedSD = overrides?.isSuddenDeathFailed || suddenDeathFailed;

    const durationSec = Math.max(0.5, (end - (startTime || end)) / 1000);
    const grossWpm = calculateGrossWpm(effectiveTotal, durationSec);
    const netWpm = calculateNetWpm(effectiveCorrect, effectiveIncorrect, durationSec);
    const accuracy = calculateAccuracy(effectiveCorrect, effectiveTotal);

    soundEngine.playComplete();

    // Store previous run for ghost racer replay (only if not an aborted sub-second test)
    if (!isFailedSD && durationSec >= 3) {
      setPreviousRun({
        targetText,
        netWpm
      });
    }

    const mistypedStr = Object.entries(effectiveMistypedMap)
      .map(([k, count]) => `${k}:${count}`)
      .join(';');

    const newRecord: TypingRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      mode: mode === 'Time' ? `Time (${sprintDuration}s)` : mode === 'Words' ? `Words (${wordCount}w)` : mode,
      difficulty: mode === 'Passage' ? difficulty : 'Medium',
      passageLength: targetText.length,
      charactersTyped: effectiveTotal,
      timeSeconds: Math.round(durationSec * 10) / 10,
      grossWpm,
      netWpm,
      accuracy,
      totalErrors: effectiveIncorrect,
      mistypedKeys: mistypedStr || (isFailedSD ? 'Fatal mistake:1' : 'None'),
      isDisqualified: isFailedSD || durationSec < 3 || effectiveTotal < 15,
      isSuddenDeathFailed: isFailedSD
    };

    try {
      localStorage.setItem('typepulse_1_2_8_test_completed', 'true');
    } catch {}
    setHasDoneVersionTest(true);
    setLastCompletedRecord(newRecord);
    onSessionComplete(newRecord);
  }, [
    startTime,
    totalKeystrokes,
    correctKeystrokes,
    incorrectKeystrokes,
    targetText,
    mistypedKeysMap,
    suddenDeathFailed,
    mode,
    sprintDuration,
    wordCount,
    difficulty,
    onSessionComplete
  ]);

  // Repeat current passage helper
  const repeatCurrentPassage = useCallback(() => {
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
    setLastCompletedRecord(null);
    setTimeout(() => inputRef.current?.focus(), 20);
  }, []);

  // Keystroke input processor
  const handleCharInput = useCallback((char: string) => {
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
      soundEngine.playKey(soundProfile, false, false);
      setCorrectKeystrokes(prev => prev + 1);
      setStreak(prev => {
        const nextStreak = prev + 1;
        if (nextStreak > 0 && nextStreak % 50 === 0) {
          soundEngine.playStreakChime(Math.floor(nextStreak / 50));
        }
        return nextStreak;
      });
    } else {
      soundEngine.playKey(soundProfile, false, true);
      setStreak(0);
      setLastMistakeKey(char);

      // Track weak word
      if (activeWord) {
        recordWeakWord(activeWord);
      }

      // Sudden death instant failure condition
      if (isSuddenDeath) {
        setSuddenDeathFailed(true);
        const finalIncorrect = incorrectKeystrokes + 1;
        const finalTotal = totalKeystrokes + 1;
        const fatalKey = expectedChar || '[space]';
        const finalMistypedMap = {
          ...mistypedKeysMap,
          [fatalKey]: (mistypedKeysMap[fatalKey] || 0) + 1
        };
        setMistypedKeysMap(finalMistypedMap);
        setIncorrectKeystrokes(finalIncorrect);
        setTotalKeystrokes(finalTotal);
        finishSession({
          totalKeystrokes: finalTotal,
          correctKeystrokes: correctKeystrokes,
          incorrectKeystrokes: finalIncorrect,
          mistypedMap: finalMistypedMap,
          isSuddenDeathFailed: true
        });
        return;
      }

      setIncorrectKeystrokes(prev => prev + 1);
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
    const rawNet = calculateNetWpm(correctKeystrokes + (isCorrect ? 1 : 0), incorrectKeystrokes + (!isCorrect ? 1 : 0), currentDurationSec);
    const rawGross = calculateGrossWpm(totalKeystrokes + 1, currentDurationSec);

    setSmoothedNetWpm(prev => calculateSmoothedWpm(prev, rawNet, currentDurationSec));
    setSmoothedGrossWpm(prev => calculateSmoothedWpm(prev, rawGross, currentDurationSec));

    lastKeyTimeRef.current = currentNow;

    // In Passage / Words / Code mode: auto finish on final character of final word
    if (mode !== 'Time' && wordIndex === words.length - 1 && updatedInput === activeWord) {
      setTypedWords(prev => [...prev, updatedInput]);
      setCurrentInput('');
      const finalTotal = totalKeystrokes + 1;
      const finalCorrect = correctKeystrokes + (isCorrect ? 1 : 0);
      const finalIncorrect = incorrectKeystrokes + (!isCorrect ? 1 : 0);
      finishSession({
        totalKeystrokes: finalTotal,
        correctKeystrokes: finalCorrect,
        incorrectKeystrokes: finalIncorrect,
        mistypedMap: isCorrect ? mistypedKeysMap : { ...mistypedKeysMap, [expectedChar || '[space]']: (mistypedKeysMap[expectedChar || '[space]'] || 0) + 1 }
      });
      return;
    }
  }, [
    isFinished,
    words,
    wordIndex,
    currentInput,
    startTime,
    isSuddenDeath,
    finishSession,
    mode,
    soundProfile,
    correctKeystrokes,
    incorrectKeystrokes,
    totalKeystrokes
  ]);

  // Spacebar word advance handler
  const handleSpace = useCallback(() => {
    if (isFinished || !currentInput) return;

    const activeWord = words[wordIndex] || '';
    const isWordCorrect = currentInput === activeWord;

    soundEngine.playKey(soundProfile, true, !isWordCorrect);

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
  }, [isFinished, currentInput, words, wordIndex, soundProfile, mode, finishSession]);

  // Handle Backspace: supports character backspace, Ctrl/Alt+Backspace word wipe, and jumping back to previous word
  const handleBackspace = useCallback((isCtrl = false) => {
    if (isFinished) return;

    // Ctrl / Alt / Meta + Backspace: wipe current word buffer or clear previous word
    if (isCtrl) {
      if (currentInput.length > 0) {
        setCurrentInput('');
      } else if (wordIndex > 0 && typedWords.length > 0) {
        setWordIndex(prev => prev - 1);
        setCurrentInput('');
        setTypedWords(prev => prev.slice(0, -1));
      }
      return;
    }

    // Standard character backspace within current word
    if (currentInput.length > 0) {
      setCurrentInput(prev => prev.slice(0, -1));
      return;
    }

    // Cross-word backspacing: jump back to previous word so user can fix mistakes
    if (wordIndex > 0 && typedWords.length > 0) {
      const prevTyped = typedWords[typedWords.length - 1];
      setWordIndex(prev => prev - 1);
      setCurrentInput(prevTyped);
      setTypedWords(prev => prev.slice(0, -1));
    }
  }, [isFinished, currentInput, wordIndex, typedWords]);

  // Global window listener: guarantees 100% reliable keystroke capture across entire browser
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target !== inputRef.current))) {
        return;
      }

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
        handleBackspace(Boolean(e.ctrlKey || e.altKey || e.metaKey));
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        handleSpace();
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        handleCharInput(e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [loadNewText, repeatCurrentPassage, isFinished, handleBackspace, handleSpace, handleCharInput]);

  // Mobile Touch Input Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    if (val.endsWith(' ')) {
      handleSpace();
    } else {
      const char = val.slice(-1);
      handleCharInput(char);
    }
    e.target.value = '';
  };

  const handleCanvasClick = () => {
    inputRef.current?.focus();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim()) return;
    const parsed = parseCodeForTyping(customInputText);
    setPreviousRun(null);
    setMode('Custom');
    try { localStorage.setItem(STORAGE_KEYS.MODE, 'Custom'); } catch {}
    setTargetText(parsed.cleanText);
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
  };

  const activeTargetWord = words[wordIndex] || '';
  const activeExpectedChar = activeTargetWord[currentInput.length] || 'space';

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto space-y-4 select-none transition-all duration-300 font-sans"
      onClick={handleCanvasClick}
    >
      {/* Custom Text / Code File Import Modal */}
      {isCustomModalOpen ? (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border border-ink-400/20 bg-surface p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b border-ink-400/10 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-medium text-ink-100 font-sans">
                  Custom Code & Text Practice
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
                Paste code, markdown, or text—or drop a source code file (`.ts`, `.py`, `.rs`, `.sql`, etc.) to generate instant typing drills.
              </p>
              <textarea
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="Paste code or custom passage here..."
                rows={5}
                required
                className="w-full rounded border border-ink-400/20 bg-bg p-3 text-xs font-mono text-ink-100 placeholder:text-ink-400/40 focus:outline-none focus:border-accent"
              />
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-ink-400/10">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ts,.tsx,.js,.jsx,.py,.rs,.sql,.html,.css,.go,.json,.md,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = evt.target?.result as string;
                        const parsed = parseCodeForTyping(content, file.name);
                        setCustomInputText(parsed.cleanText);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-mono text-ink-400 hover:text-accent flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-bg/50 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import code / text file</span>
                </button>

                <div className="flex items-center gap-2">
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
                    Start drill
                  </Button>
                </div>
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
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry (Tab)</span>
          </button>
        </div>
      ) : null}

      {/* Single Unified Minimalist Mode Ribbon */}
      {!isZenActive ? (
        <ModeSelector
          mode={mode}
          difficulty={difficulty}
          sprintDuration={sprintDuration}
          wordCount={wordCount}
          codeLanguage={codeLanguage}
          wordFrequencyPack={wordFrequencyPack}
          soundProfile={soundProfile}
          ambientSoundscape={ambientSoundscape}
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
          onCodeLanguageChange={handleCodeLanguageChange}
          onWordFrequencyPackChange={handleWordFrequencyPackChange}
          onSoundProfileChange={(sp) => {
            setSoundProfile(sp);
            try { localStorage.setItem(STORAGE_KEYS.SOUND_PROFILE, sp); } catch {}
          }}
          onAmbientSoundscapeChange={handleAmbientSoundscapeChange}
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

      {/* First-Time User Calibration Baseline - Subtle Ambient Glow Subtitle (Shows once on v1.2.8, then permanently retires) */}
      {!startTime && !isFinished && !isZenActive && !hasDoneVersionTest && !lastCompletedRecord ? (
        <div className="w-full flex items-center justify-center animate-in fade-in duration-300 py-1 text-xs font-mono select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/[0.08] border border-accent/25 shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.12)] transition-all">
            <span className="text-accent text-xs animate-pulse drop-shadow-[0_0_6px_rgba(var(--color-accent-rgb),0.9)]">✦</span>
            <span className="text-ink-400 font-normal">
              Complete <span className="text-ink-100 font-medium">1st test</span> to calibrate AI Coach & Biomechanical Heatmap
            </span>
          </div>
        </div>
      ) : null}

      {/* Whisper-Light Ambient Telemetry (Only when active typing) */}
      {!isFinished && !isZenActive ? (
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
        >
          {/* Zen Mode Live Countdown Timer (Top-Left of Canvas to avoid streak overlap) */}
          {isZenActive && mode === 'Time' && (
            <div
              className={`absolute top-4 left-6 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono z-20 pointer-events-none transition-all duration-200 ${
                sprintRemainingSeconds !== undefined && sprintRemainingSeconds <= 5 && startTime
                  ? 'bg-accent/20 border border-accent text-accent shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.5)] font-bold animate-pulse'
                  : 'bg-surface/70 border border-ink-400/15 text-ink-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-accent/80 shrink-0" />
              <span className="text-ink-100/90 font-medium tabular-nums text-xs">
                {sprintRemainingSeconds !== undefined ? Math.ceil(sprintRemainingSeconds) : sprintDuration}s
              </span>
            </div>
          )}

          {/* Escalating Tiered Streak Indicator (Starts at 15 letters, decays on pause) */}
          {streak >= 15 && (
            <div
              className={`absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono z-20 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95 ${
                streak >= 100
                  ? 'bg-accent border border-accent text-accent-contrast shadow-[0_0_22px_rgba(var(--color-accent-rgb),0.9)] font-bold'
                  : streak >= 50
                  ? 'bg-surface/95 border border-accent text-ink-100 shadow-[0_0_16px_rgba(var(--color-accent-rgb),0.6)] ring-1 ring-accent/60 font-semibold'
                  : streak >= 30
                  ? 'bg-surface/95 border border-accent text-accent shadow-[0_0_10px_rgba(var(--color-accent-rgb),0.4)] font-semibold'
                  : 'bg-surface/90 border border-accent/40 text-accent shadow-md'
              }`}
            >
              {streak >= 100 ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current animate-spin" />
                  <span>{streak} streak • GODSPEED</span>
                </>
              ) : streak >= 50 ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-accent fill-accent animate-pulse" />
                  <span>{streak} streak • hyperflow</span>
                </>
              ) : (
                <>
                  <Flame className={`w-3.5 h-3.5 fill-accent ${streak >= 30 ? 'animate-bounce' : 'animate-pulse'}`} />
                  <span>{streak} streak{streak >= 30 ? ' • flow' : ''}</span>
                </>
              )}
            </div>
          )}

          {/* Transparent Input Overlay with Elevated z-20 */}
          <input
            ref={inputRef}
            type="text"
            className="absolute inset-0 opacity-0 cursor-text w-full h-full z-20"
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
          <div className="pointer-events-none w-full py-1">
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
                    streak={streak}
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
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-ink-400/10 text-xs font-mono text-ink-400 select-none relative z-30 pointer-events-auto">
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
          record={lastCompletedRecord || {
            id: `${Date.now()}`,
            timestamp: new Date().toISOString(),
            mode: mode === 'Time' ? `Time (${sprintDuration}s)` : mode === 'Words' ? `Words (${wordCount}w)` : mode,
            difficulty: mode === 'Passage' ? difficulty : 'Medium',
            passageLength: targetText.length,
            charactersTyped: totalKeystrokes,
            timeSeconds: Math.round(elapsedSeconds * 10) / 10,
            grossWpm: calculateGrossWpm(totalKeystrokes, elapsedSeconds),
            netWpm: calculateNetWpm(correctKeystrokes, incorrectKeystrokes, elapsedSeconds),
            accuracy: calculateAccuracy(correctKeystrokes, totalKeystrokes),
            totalErrors: incorrectKeystrokes,
            mistypedKeys: Object.entries(mistypedKeysMap).map(([k, c]) => `${k}:${c}`).join(';') || 'None'
          }}
          snapshots={snapshots}
          targetText={targetText}
          onRestart={repeatCurrentPassage}
          onNextTest={() => loadNewText(mode, difficulty, wordCount)}
          onOpenCoach={onOpenCoach}
          onOpenTour={onOpenTour}
          onPracticeMistakes={(mistakeText) => {
            setPreviousRun(null);
            setTargetText(mistakeText);
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
            setLastCompletedRecord(null);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
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
