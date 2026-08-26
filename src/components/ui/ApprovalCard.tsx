import React from 'react';
import { Check, X, ArrowRight, Code2, ShieldAlert } from 'lucide-react';
import { ApprovalAction } from '../../types';
import { Button } from './Button';

export interface ApprovalCardProps {
  action: ApprovalAction;
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
  className?: string;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  action,
  onApprove,
  onReject,
  className = ''
}) => {
  const getImpactBadge = () => {
    switch (action.impactLevel) {
      case 'high':
        return 'border-incorrect/40 text-incorrect';
      case 'medium':
        return 'border-accent/40 text-accent';
      default:
        return 'border-ink-400/30 text-ink-400';
    }
  };

  return (
    <div
      className={`w-full rounded border border-ink-400/15 bg-surface overflow-hidden transition-colors ${className}`}
    >
      {/* Top Banner */}
      <div className="px-4 py-3 bg-ink-400/5 flex items-center justify-between border-b border-ink-400/10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span className="text-xs font-medium text-ink-100 font-sans">
            Action approval required
          </span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getImpactBadge()}`}>
          {action.impactLevel} impact
        </span>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-ink-100 font-sans">
            {action.title}
          </h4>
          <p className="text-xs text-ink-400 mt-1 leading-relaxed font-sans">
            {action.description}
          </p>
        </div>

        {/* Diff Code Preview */}
        {action.diffCode ? (
          <div className="rounded bg-bg border border-ink-400/15 p-3 font-mono text-xs space-y-1.5 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-ink-400 pb-1.5 border-b border-ink-400/10 text-[11px] font-sans">
              <Code2 className="w-3 h-3 text-accent" aria-hidden="true" />
              <span>Targeted remediation passage</span>
            </div>
            <pre className="text-ink-100 whitespace-pre-wrap leading-relaxed">
              {action.diffCode}
            </pre>
          </div>
        ) : null}

        {/* Payload summary */}
        <div className="flex items-center gap-2 text-xs text-ink-400 bg-bg/50 p-2.5 rounded border border-ink-400/10">
          <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
          <span className="text-xs leading-relaxed font-sans">{action.payloadSummary}</span>
        </div>

        {/* Action Controls */}
        {action.status === 'pending' ? (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-400/10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReject(action.id)}
              icon={<X className="w-3.5 h-3.5 text-ink-400" />}
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(action.id)}
              icon={<Check className="w-3.5 h-3.5 text-correct" />}
            >
              Apply to arena
            </Button>
          </div>
        ) : (
          <div className="pt-2 border-t border-ink-400/10 flex items-center justify-end text-xs font-mono">
            {action.status === 'approved' ? (
              <span className="text-correct flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" aria-hidden="true" /> Drill active in arena
              </span>
            ) : (
              <span className="text-incorrect flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" aria-hidden="true" /> Action dismissed
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
