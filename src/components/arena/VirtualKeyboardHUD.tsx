import React from 'react';

export interface VirtualKeyboardHUDProps {
  activeKey?: string;
  expectedKey?: string;
  lastMistakeKey?: string;
  mistypedKeysMap?: Record<string, number>;
  className?: string;
}

export const VirtualKeyboardHUD: React.FC<VirtualKeyboardHUDProps> = ({
  activeKey,
  expectedKey,
  lastMistakeKey,
  mistypedKeysMap,
  className = ''
}) => {
  const norm = (k?: string) => {
    if (!k) return '';
    if (k === ' ') return 'space';
    return k.toLowerCase();
  };

  const currActive = norm(activeKey);
  const currExpected = norm(expectedKey);
  const currMistake = norm(lastMistakeKey);

  const getKeyClasses = (keyChar: string) => {
    const k = norm(keyChar);
    const isTarget = currExpected === k;
    const isPressed = currActive === k;
    const isMistake = currMistake === k;
    const mistakeCount = mistypedKeysMap?.[k] || mistypedKeysMap?.[keyChar] || 0;

    if (isMistake) {
      return 'bg-bg text-incorrect border-incorrect shadow-sm font-medium';
    }
    if (isPressed) {
      return 'bg-surface text-ink-100 border-ink-100/40 shadow-sm';
    }
    if (isTarget) {
      return 'bg-surface text-ink-100 border-accent/70 font-medium';
    }
    if (mistakeCount >= 3) {
      return 'bg-incorrect/15 text-incorrect border-incorrect/40';
    }
    if (mistakeCount > 0) {
      return 'bg-incorrect/5 text-ink-100 border-incorrect/20';
    }
    return 'bg-bg text-ink-400/70 border-ink-400/10';
  };

  return (
    <div
      className={`w-full max-w-3xl mx-auto rounded border border-ink-400/15 bg-surface p-3 select-none ${className}`}
    >
      <div
        className="grid gap-1 text-[11px] font-mono"
        style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}
      >
        {/* Row 1: Numbers (26 + 4 = 30 cols) */}
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('`')}`}>`</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('1')}`}>1</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('2')}`}>2</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('3')}`}>3</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('4')}`}>4</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('5')}`}>5</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('6')}`}>6</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('7')}`}>7</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('8')}`}>8</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('9')}`}>9</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('0')}`}>0</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('-')}`}>-</div>
        <div className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('=')}`}>=</div>
        <div className={`col-span-4 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('backspace')}`}>
          <span className="text-[10px] font-sans">bksp</span>
        </div>

        {/* Row 2: QWERTY (3 + 24 + 3 = 30 cols) */}
        <div className={`col-span-3 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('tab')}`}>
          <span className="text-[10px] font-sans">tab</span>
        </div>
        {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'].map(k => (
          <div key={k} className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses(k)}`}>
            {k}
          </div>
        ))}
        <div className={`col-span-3 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('\\')}`}>
          \
        </div>

        {/* Row 3: ASDF (4 + 22 + 4 = 30 cols) */}
        <div className={`col-span-4 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('caps')}`}>
          <span className="text-[10px] font-sans">caps</span>
        </div>
        {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"].map(k => (
          <div key={k} className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors relative ${getKeyClasses(k)}`}>
            {k}
            {(k === 'f' || k === 'j') ? (
              <span className="absolute bottom-1 w-1 h-0.5 rounded-full bg-ink-400/50 pointer-events-none" aria-hidden="true" />
            ) : null}
          </div>
        ))}
        <div className={`col-span-4 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('enter')}`}>
          <span className="text-[10px] font-sans text-ink-100">enter</span>
        </div>

        {/* Row 4: ZXCV (5 + 20 + 5 = 30 cols) */}
        <div className={`col-span-5 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('shift')}`}>
          <span className="text-[10px] font-sans">shift</span>
        </div>
        {['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'].map(k => (
          <div key={k} className={`col-span-2 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses(k)}`}>
            {k}
          </div>
        ))}
        <div className={`col-span-5 h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('shift')}`}>
          <span className="text-[10px] font-sans">shift</span>
        </div>

        {/* Row 5: Spacebar & Modifiers (4 + 3 + 16 + 3 + 4 = 30 cols) */}
        <div className="col-span-4 h-7 sm:h-8 rounded flex items-center justify-center border text-[10px] text-ink-400/70 font-sans border-ink-400/10 bg-bg">
          ctrl
        </div>
        <div className="col-span-3 h-7 sm:h-8 rounded flex items-center justify-center border text-[10px] text-ink-400/70 font-sans border-ink-400/10 bg-bg">
          alt
        </div>
        <div
          style={{ gridColumn: 'span 16 / span 16' }}
          className={`h-7 sm:h-8 rounded flex items-center justify-center border transition-colors ${getKeyClasses('space')}`}
        >
          <span className="text-[10px] text-ink-400 font-sans">space</span>
        </div>
        <div className="col-span-3 h-7 sm:h-8 rounded flex items-center justify-center border text-[10px] text-ink-400/70 font-sans border-ink-400/10 bg-bg">
          alt
        </div>
        <div className="col-span-4 h-7 sm:h-8 rounded flex items-center justify-center border text-[10px] text-ink-400/70 font-sans border-ink-400/10 bg-bg">
          ctrl
        </div>
      </div>
    </div>
  );
};
