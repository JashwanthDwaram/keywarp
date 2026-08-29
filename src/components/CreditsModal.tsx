import React from 'react';
import { X, Github, ExternalLink, Sparkles, Code2, ShieldCheck, Terminal } from 'lucide-react';

export interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCookieMode?: boolean;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen,
  onClose,
  isCookieMode = false
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface border border-ink-400/20 shadow-2xl p-5 space-y-4 font-sans select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink-400/10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold ${
                isCookieMode
                  ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-accent/10 border-accent text-accent'
              }`}
            >
              {isCookieMode ? '🍪' : 'kw'}
            </div>
            <div>
              <h2 id="credits-modal-title" className="text-sm font-semibold text-ink-100 flex items-center gap-1.5">
                <span>KeyWarp</span>
                <span className="text-[10px] font-mono text-ink-400 font-normal px-1.5 py-0.2 rounded bg-bg border border-ink-400/15">
                  v1.4.5
                </span>
              </h2>
              <p className="text-[11px] text-ink-400">High-velocity typing engine & kinesiology trainer</p>
            </div>
          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close credits modal"
            className="p-1 rounded-md text-ink-400 hover:text-ink-100 hover:bg-bg/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>


        {/* Author & Creator Card */}
        <div className="p-3.5 rounded-lg bg-bg/60 border border-ink-400/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-ink-400 uppercase tracking-wider">
              {isCookieMode ? 'Head Baker & Creator' : 'Creator & Lead Engineer'}
            </span>
            {isCookieMode ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold flex items-center gap-1">
                <span>🍪</span> Master Chocolatier
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Core Author
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-ink-100">
                Jashwanth Dwaram
              </div>
              <div className="text-xs text-ink-400 font-mono">
                @JashwanthDwaram
              </div>
            </div>


            <a
              href="https://github.com/JashwanthDwaram"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-surface hover:bg-bg border border-ink-400/20 text-ink-100 hover:text-accent text-xs font-mono transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-ink-400" />
            </a>
          </div>
        </div>


        {/* Project Links & Details */}
        <div className="space-y-1.5 text-xs font-mono">
          <a
            href="https://github.com/JashwanthDwaram/keywarp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 hover:bg-bg border border-ink-400/15 text-ink-100 hover:text-accent transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-accent" />
              <span>Open Source Repository</span>
            </div>
            <span className="text-ink-400 group-hover:text-accent text-[11px] flex items-center gap-1">
              JashwanthDwaram/keywarp <ExternalLink className="w-3 h-3" />
            </span>
          </a>


          <a
            href="https://keywarp.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 hover:bg-bg border border-ink-400/15 text-ink-100 hover:text-accent transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-accent" />
              <span>Official Web App</span>
            </div>
            <span className="text-ink-400 group-hover:text-accent text-[11px] flex items-center gap-1">
              keywarp.vercel.app <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>


        {/* License & Attribution Footer */}
        <div className="pt-2 border-t border-ink-400/10 flex items-center justify-between text-[11px] text-ink-400 font-sans">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-correct" />
            <span>MIT License • Free & Open Source</span>
          </span>
          <span className="font-mono text-[10px]">
            {isCookieMode ? 'baked with love 🍪 :)' : 'made with love :)'}
          </span>
        </div>
      </div>
    </div>
  );
};
