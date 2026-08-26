import React, { useState } from 'react';
import { Terminal, Check, AlertCircle, Loader2, ChevronRight, ChevronDown, Cpu } from 'lucide-react';
import { ToolCall } from '../../types';

export interface ToolChipProps {
  tool: ToolCall;
  onExecute?: (toolId: string) => void;
  className?: string;
}

export const ToolChip: React.FC<ToolChipProps> = ({ tool, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    switch (tool.status) {
      case 'running':
        return <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" aria-hidden="true" />;
      case 'success':
        return <Check className="w-3.5 h-3.5 text-correct" aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-incorrect" aria-hidden="true" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-ink-400" aria-hidden="true" />;
    }
  };

  const getStatusBadge = () => {
    switch (tool.status) {
      case 'running':
        return 'border-accent/40 text-accent';
      case 'success':
        return 'border-correct/40 text-correct';
      case 'error':
        return 'border-incorrect/40 text-incorrect';
      default:
        return 'border-ink-400/30 text-ink-400';
    }
  };

  return (
    <div
      className={`rounded border border-ink-400/15 bg-surface overflow-hidden text-xs font-mono transition-colors ${className}`}
    >
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 bg-ink-400/5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center shrink-0">
            {getStatusIcon()}
          </div>
          <span className="text-xs font-medium text-ink-100 font-mono truncate">
            {tool.name}
          </span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getStatusBadge()}`}>
            {tool.status}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {tool.durationMs ? (
            <span className="text-[11px] text-ink-400 font-mono tabular-nums">
              {tool.durationMs}ms
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className="p-1 text-ink-400 hover:text-ink-100 rounded transition-colors cursor-pointer"
            aria-label={`Toggle ${tool.name} telemetry`}
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-3.5 py-2 text-xs text-ink-400 font-sans border-t border-ink-400/10 leading-relaxed">
        {tool.description}
      </div>

      {/* Expandable JSON Arguments & Diagnostics Drawer */}
      {isOpen ? (
        <div className="p-3.5 bg-bg/40 border-t border-ink-400/10 space-y-2.5 text-xs">
          {tool.inputArgs ? (
            <div>
              <div className="text-ink-400 text-[11px] mb-1 font-sans flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-accent" />
                Input telemetry parameters
              </div>
              <pre className="p-2.5 rounded bg-bg text-ink-100 overflow-x-auto border border-ink-400/15 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(tool.inputArgs, null, 2)}
              </pre>
            </div>
          ) : null}

          {tool.resultSummary ? (
            <div>
              <div className="text-ink-400 text-[11px] mb-1 font-sans flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-correct" />
                Diagnostic outcome
              </div>
              <div className="p-2.5 rounded bg-bg text-ink-100 font-mono text-[11px] border border-ink-400/15 leading-relaxed">
                {tool.resultSummary}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
