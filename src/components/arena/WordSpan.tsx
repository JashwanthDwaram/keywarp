import React from 'react';

export interface WordSpanProps {
  targetWord: string;
  typedWord?: string;
  isCurrentWord: boolean;
  currentInput?: string;
  isGhost?: boolean;
  ghostCharOffset?: number; // 0-indexed char offset in this word for ghost
  isBlindMode?: boolean;
  isBursting?: boolean;
  hasSpaceError?: boolean;
}

const noLigatureStyle: React.CSSProperties = {
  fontVariantLigatures: 'none',
  WebkitFontVariantLigatures: 'none',
  fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0, "clig" 0',
  WebkitFontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0, "clig" 0'
};

export const WordSpan: React.FC<WordSpanProps> = React.memo(({
  targetWord,
  typedWord,
  isCurrentWord,
  currentInput = '',
  isGhost = false,
  ghostCharOffset = -1,
  isBlindMode = false,
  isBursting = false,
  hasSpaceError = false
}) => {
  const caretFlameClasses = isBursting
    ? 'bg-accent shadow-[0_0_8px_rgba(216,90,48,0.95)] animate-pulse'
    : 'bg-accent animate-caret';

  const renderActiveCaret = () => (
    <span
      className={`absolute -left-[1px] top-0 bottom-0 w-[2px] rounded-none pointer-events-none ${caretFlameClasses}`}
      aria-hidden="true"
    />
  );

  const renderGhostCaret = () => (
    <span
      className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-accent/40 rounded-none pointer-events-none transition-all duration-75"
      aria-hidden="true"
      title="Ghost pace"
    />
  );

  // 1. Current Active Word
  if (isCurrentWord) {
    const input = currentInput;
    const isOverlength = input.length > targetWord.length;
    const extraChars = isOverlength ? input.slice(targetWord.length) : '';

    return (
      <span
        style={noLigatureStyle}
        className="inline-block mr-[0.45em] select-none font-mono whitespace-nowrap"
      >
        {targetWord.split('').map((char, i) => {
          const isTyped = i < input.length;
          const isCorrect = isTyped && input[i] === char;
          const isIncorrect = isTyped && input[i] !== char;
          const isAtCaret = i === input.length;
          const isAtGhost = isGhost && i === ghostCharOffset;

          let colorClass = 'text-ink-400/50';
          if (isCorrect) {
            colorClass = isBlindMode ? 'opacity-0' : 'text-ink-100';
          } else if (isIncorrect) {
            colorClass = 'text-incorrect underline decoration-incorrect underline-offset-4';
          }

          return (
            <span
              key={i}
              style={noLigatureStyle}
              className={`relative inline ${colorClass}`}
            >
              {isAtCaret && renderActiveCaret()}
              {isAtGhost && renderGhostCaret()}
              {char}
            </span>
          );
        })}

        {/* Extra mistyped characters typed beyond word length */}
        {extraChars.split('').map((extraChar, idx) => {
          const charIndex = targetWord.length + idx;
          const isAtCaret = charIndex === input.length - 1 && isOverlength;
          return (
            <span
              key={`extra_${idx}`}
              style={noLigatureStyle}
              className="relative inline text-incorrect underline decoration-incorrect underline-offset-4 opacity-80"
            >
              {extraChar}
              {idx === extraChars.length - 1 && (
                <span
                  className={`absolute -right-[1px] top-0 bottom-0 w-[2px] rounded-none pointer-events-none ${caretFlameClasses}`}
                  aria-hidden="true"
                />
              )}
            </span>
          );
        })}

        {/* Caret at the exact boundary when input matches word length */}
        {input.length === targetWord.length && (
          <span className="relative inline" style={noLigatureStyle}>
            <span
              className={`absolute -left-[1px] top-0 bottom-0 w-[2px] rounded-none pointer-events-none ${caretFlameClasses}`}
              aria-hidden="true"
            />
          </span>
        )}
      </span>
    );
  }

  // 2. Past Completed Word
  if (typedWord !== undefined) {
    const isOverlength = typedWord.length > targetWord.length;
    const extraChars = isOverlength ? typedWord.slice(targetWord.length) : '';

    return (
      <span
        style={noLigatureStyle}
        className={`inline-block mr-[0.45em] select-none font-mono whitespace-nowrap ${
          hasSpaceError ? 'border-b border-dotted border-incorrect/60' : ''
        }`}
      >
        {targetWord.split('').map((char, i) => {
          const isTyped = i < typedWord.length;
          const isCorrect = isTyped && typedWord[i] === char;
          const isIncorrect = isTyped && typedWord[i] !== char;
          const isMissed = !isTyped;

          let colorClass = 'text-ink-100';
          if (isCorrect) {
            colorClass = isBlindMode ? 'opacity-0' : 'text-ink-100';
          } else if (isIncorrect) {
            colorClass = 'text-incorrect underline decoration-incorrect underline-offset-4';
          } else if (isMissed) {
            colorClass = 'text-incorrect/60 underline decoration-incorrect/40 underline-offset-4';
          }

          return (
            <span
              key={i}
              style={noLigatureStyle}
              className={`relative inline ${colorClass}`}
            >
              {char}
            </span>
          );
        })}

        {/* Extra characters typed in the past word */}
        {extraChars.split('').map((extraChar, idx) => (
          <span
            key={`extra_${idx}`}
            style={noLigatureStyle}
            className="relative inline text-incorrect underline decoration-incorrect underline-offset-4 opacity-70"
          >
            {extraChar}
          </span>
        ))}
      </span>
    );
  }

  // 3. Future Word
  return (
    <span
      style={noLigatureStyle}
      className="inline-block mr-[0.45em] select-none font-mono whitespace-nowrap text-ink-400/50"
    >
      {targetWord.split('').map((char, i) => {
        const isAtGhost = isGhost && i === ghostCharOffset;
        return (
          <span
            key={i}
            style={noLigatureStyle}
            className="relative inline"
          >
            {isAtGhost && renderGhostCaret()}
            {char}
          </span>
        );
      })}
    </span>
  );
});

WordSpan.displayName = 'WordSpan';
