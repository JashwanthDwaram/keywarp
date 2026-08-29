import React, { useMemo } from 'react';
import { Trophy, Zap, Target, Flame, Code, ShieldCheck, Lock, Ghost, Sparkles, BookOpen, Award, Compass } from 'lucide-react';
import { TypingRecord } from '../../types';

export interface AchievementsGridProps {
  records: TypingRecord[];
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: string;
  isSecret?: boolean;
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ records }) => {
  const isCookieUnlocked = useMemo(() => {
    try {
      return (
        localStorage.getItem('keywarp_cookie_unlocked') === 'true' ||
        localStorage.getItem('keywarp_cookie_mode') === 'true'
      );
    } catch {
      return false;
    }
  }, []);

  const achievements = useMemo(() => {
    const totalSessions = records.length;
    const maxWpm = records.length > 0 ? Math.max(...records.map(r => r.netWpm)) : 0;
    const totalWords = records.reduce((acc, r) => acc + Math.floor(r.charactersTyped / 5), 0);
    const perfect100Tests = records.filter(r => r.accuracy === 100 && (r.charactersTyped || 0) >= 75).length;
    const highAccTests = records.filter(r => r.accuracy >= 98 && (r.charactersTyped || 0) >= 100).length;
    const codeTests = records.filter(r => (r.mode || '').toLowerCase().includes('code')).length;
    const quoteTests = records.filter(r => (r.mode || '').toLowerCase().includes('quote')).length;
    const zeroErrorTests = records.filter(r => (r.totalErrors || 0) === 0).length;

    const list: Achievement[] = [
      {
        id: 'century',
        title: 'Century Club',
        desc: 'Reach 100+ Net WPM in any session',
        icon: <Zap className="w-4 h-4 text-accent" />,
        unlocked: maxWpm >= 100,
        progress: `${maxWpm}/100 wpm`
      },
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        desc: 'Reach 80+ Net WPM in any session',
        icon: <Flame className="w-4 h-4 text-accent" />,
        unlocked: maxWpm >= 80,
        progress: `${maxWpm}/80 wpm`
      },
      {
        id: 'marksman',
        title: 'Marksman',
        desc: 'Score 100% accuracy on a full passage',
        icon: <Target className="w-4 h-4 text-correct" />,
        unlocked: perfect100Tests >= 1,
        progress: `${perfect100Tests}/1 tests`
      },
      {
        id: 'zen_flow',
        title: 'Zen Master',
        desc: 'Complete 3 sessions with 98%+ accuracy',
        icon: <Sparkles className="w-4 h-4 text-accent" />,
        unlocked: highAccTests >= 3,
        progress: `${highAccTests}/3 tests`
      },
      {
        id: 'grand_marathon',
        title: 'Grand Marathon',
        desc: 'Type 1,000+ total words across practice tests',
        icon: <Award className="w-4 h-4 text-accent" />,
        unlocked: totalWords >= 1000,
        progress: `${totalWords}/1,000 words`
      },
      {
        id: 'veteran',
        title: 'Flow Master',
        desc: 'Complete 25 typing sessions',
        icon: <Trophy className="w-4 h-4 text-accent" />,
        unlocked: totalSessions >= 25,
        progress: `${totalSessions}/25 tests`
      },
      {
        id: 'compiler',
        title: 'Compiler',
        desc: 'Complete 5 Code mode challenges',
        icon: <Code className="w-4 h-4 text-ink-100" />,
        unlocked: codeTests >= 5,
        progress: `${codeTests}/5 code tests`
      },
      {
        id: 'quote_scholar',
        title: 'Quote Scholar',
        desc: 'Complete 3 Famous Quotes passages',
        icon: <BookOpen className="w-4 h-4 text-correct" />,
        unlocked: quoteTests >= 3,
        progress: `${quoteTests}/3 quote tests`
      },
      {
        id: 'flawless',
        title: 'Zero Friction',
        desc: 'Complete 5 tests with 0 recorded errors',
        icon: <ShieldCheck className="w-4 h-4 text-correct" />,
        unlocked: zeroErrorTests >= 5,
        progress: `${zeroErrorTests}/5 flawless tests`
      },
      {
        id: 'cookie_master',
        title: isCookieUnlocked ? 'Master Chocolatier 🍪' : '??? (Secret Achievement)',
        desc: isCookieUnlocked
          ? 'Discovered the secret Cookie Bakery & Warm Cookie theme'
          : 'A secret recipe is hidden somewhere in the engine...',
        icon: isCookieUnlocked ? (
          <span className="text-sm leading-none" role="img" aria-label="Cookie">
            🍪
          </span>
        ) : (
          <Lock className="w-4 h-4 text-amber-500/60" />
        ),
        unlocked: isCookieUnlocked,
        progress: isCookieUnlocked ? 'Baked!' : 'Locked',
        isSecret: true
      }
    ];

    return list;
  }, [records, isCookieUnlocked]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="rounded border border-ink-400/15 bg-surface p-4 space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-400/10 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-accent" />
          <h3 className="text-xs font-medium text-ink-100 font-sans uppercase tracking-wider">
            Milestones & Achievements
          </h3>
        </div>
        <div className="text-xs font-mono text-ink-400">
          <span className="text-accent font-medium">{unlockedCount}</span> of {achievements.length} unlocked
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {achievements.map(a => (
          <div
            key={a.id}
            className={`p-3 rounded border transition-all flex items-start gap-3 ${
              a.unlocked
                ? a.isSecret
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                  : 'bg-bg/80 border-accent/40 shadow-sm'
                : a.isSecret
                ? 'bg-amber-500/5 border-amber-500/20 border-dashed opacity-75'
                : 'bg-bg/40 border-ink-400/10 opacity-60'
            }`}
          >
            <div className={`p-2 rounded border shrink-0 flex items-center justify-center ${
              a.unlocked
                ? a.isSecret
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-surface border-accent/50'
                : 'bg-surface border-ink-400/15 text-ink-400/50'
            }`}>
              {a.unlocked ? a.icon : <Lock className="w-4 h-4 text-ink-400/40" />}
            </div>

            <div className="min-w-0 space-y-0.5 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs font-medium font-sans truncate ${
                  a.unlocked ? (a.isSecret ? 'text-amber-400 font-semibold' : 'text-ink-100') : 'text-ink-400'
                }`}>
                  {a.title}
                </span>
                <span className={`text-[10px] font-mono shrink-0 ${
                  a.unlocked ? (a.isSecret ? 'text-amber-400 font-semibold' : 'text-accent') : 'text-ink-400'
                }`}>
                  {a.progress}
                </span>
              </div>
              <p className="text-[11px] text-ink-400 font-sans line-clamp-2">
                {a.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
