import React from 'react';

export type CharacterStatus = 'correct' | 'incorrect' | 'pending';

export interface CharacterSpanProps {
  char: string;
  status: CharacterStatus;
  isActive: boolean;
  isGhost?: boolean;
  isBlindMode?: boolean;
  isBursting?: boolean;
  typedChar?: string;
}

export const CharacterSpan: React.FC<CharacterSpanProps> = React.memo(({
  char,
  status,
  isActive,
  isGhost = false,
  isBlindMode = false,
  isBursting = false,
  typedChar
}) => {
  const isSpace = char === ' ';
  const isNewline = char === '\n';

  let colorClasses = 'text-ink-400/50';

  if (status === 'correct') {
    // In Blind/Confidence mode, correctly typed characters fade out behind cursor
    colorClasses = isBlindMode ? 'opacity-0 select-none' : 'text-ink-100';
  } else if (status === 'incorrect') {
    colorClasses = 'text-incorrect underline decoration-incorrect underline-offset-4';
  }

  const caretFlameClasses = isBursting
    ? 'bg-accent shadow-[0_0_8px_rgba(216,90,48,0.95)] animate-pulse'
    : 'bg-accent animate-caret';

  const renderActiveCaret = () => (
    <span
      className={`absolute -left-[1px] top-0 bottom-0 w-[2px] rounded-none pointer-events-none ${caretFlameClasses}`}
      aria-hidden="true"
    />
  );

  // Handle Newline in Code Mode
  if (isNewline) {
    return (
      <span
        className={`relative inline select-none ${colorClasses}`}
        style={{ fontVariantLigatures: 'none', fontFeatureSettings: '"calt" 0, "liga" 0' }}
      >
        {/* Active Caret */}
        {isActive ? renderActiveCaret() : isGhost ? (
          <span
            className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-accent/40 rounded-none pointer-events-none transition-all duration-75"
            aria-hidden="true"
            title="Ghost pace"
          />
        ) : null}
        <span className="text-[0.75em] opacity-35 font-mono select-none px-0.5">↵</span>
        <br />
      </span>
    );
  }

  // Handle Spaces: use standard regular space ' ' so native browser word wrapping breaks lines naturally at word boundaries
  if (isSpace) {
    return (
      <span
        className={`relative inline select-none ${colorClasses}`}
        style={{ fontVariantLigatures: 'none', fontFeatureSettings: '"calt" 0, "liga" 0' }}
      >
        {/* Active Caret on Space */}
        {isActive ? renderActiveCaret() : isGhost ? (
          <span
            className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-accent/40 rounded-none pointer-events-none transition-all duration-75"
            aria-hidden="true"
            title="Ghost pace"
          />
        ) : null}

        {status === 'incorrect' ? (
          <span className="text-incorrect underline decoration-incorrect underline-offset-4">
            {typedChar ? typedChar : '␣'}
          </span>
        ) : (
          ' '
        )}
      </span>
    );
  }

  // Regular Character
  return (
    <span
      className={`relative inline select-none ${colorClasses}`}
      style={{ fontVariantLigatures: 'none', fontFeatureSettings: '"calt" 0, "liga" 0' }}
    >
      {/* Active Caret or Ghost Caret */}
      {isActive ? renderActiveCaret() : isGhost ? (
        <span
          className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-accent/40 rounded-none pointer-events-none transition-all duration-75"
          aria-hidden="true"
          title="Ghost pace"
        />
      ) : null}

      {char}
    </span>
  );
});

CharacterSpan.displayName = 'CharacterSpan';
