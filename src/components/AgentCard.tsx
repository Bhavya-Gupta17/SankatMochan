import { AllocationResult, CascadeRisk } from '../types';

const AGENT_ICONS: Record<string, string> = {
  Hospital: '🏥',
  'Water Supply': '💧',
  'Emergency Services': '🚑',
  Residential: '🏘️',
  Industry: '🏭',
};

const STATUS_STYLES: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  healthy: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/20 text-emerald-300', text: 'text-emerald-400' },
  warning: { border: 'border-amber-500/40', bg: 'bg-amber-500/5', badge: 'bg-amber-500/20 text-amber-300', text: 'text-amber-400' },
  critical: { border: 'border-red-500/60', bg: 'bg-red-500/10', badge: 'bg-red-500/20 text-red-300', text: 'text-red-400' },
  failed: { border: 'border-red-700/80', bg: 'bg-red-900/20', badge: 'bg-red-700/40 text-red-200', text: 'text-red-300' },
};

interface Props {
  allocation: AllocationResult;
  cascadeRisk?: CascadeRisk;
  showComparison?: boolean;
  withoutAI?: AllocationResult;
}

export default function AgentCard({ allocation, cascadeRisk, showComparison, withoutAI }: Props) {
  const style = STATUS_STYLES[allocation.status];
  const icon = AGENT_ICONS[allocation.agentName] || '⚡';
  const fillPct = Math.min((allocation.allocated / allocation.demanded) * 100, 100);
  const demandPct = Math.min(100, 100);

  const withoutPct = withoutAI ? Math.min((withoutAI.allocated / withoutAI.demanded) * 100, 100) : 0;

  return (
    <div className={`relative rounded-xl border ${style.border} ${style.bg} p-4 transition-all duration-500 hover:scale-[1.02]`}>
      {/* Pulse for critical/failed */}
      {(allocation.status === 'critical' || allocation.status === 'failed') && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-white text-sm">{allocation.agentName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`}>
              {allocation.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${style.text}`}>{allocation.allocated.toFixed(1)}</p>
          <p className="text-xs text-slate-500">/ {allocation.demanded.toFixed(1)} MW</p>
        </div>
      </div>

      {/* Allocation bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Allocation</span>
          <span>{Math.round(fillPct)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              allocation.status === 'failed' ? 'bg-red-600' :
              allocation.status === 'critical' ? 'bg-red-500' :
              allocation.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Before vs After comparison */}
      {showComparison && withoutAI && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span className="text-slate-500">Without AI</span>
            <span className="text-slate-500">{Math.round(withoutPct)}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-500 transition-all duration-700"
              style={{ width: `${withoutPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
        <div className="text-center">
          <p className="text-xs text-slate-500">Priority</p>
          <p className="text-xs font-semibold text-sky-400">{allocation.dynamicPriority.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Bid</p>
          <p className="text-xs font-semibold text-violet-400">{allocation.bid.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Satisfied</p>
          <p className={`text-xs font-semibold ${style.text}`}>{Math.round(allocation.satisfactionRatio * 100)}%</p>
        </div>
      </div>

      {/* Cascade risk */}
      {cascadeRisk && cascadeRisk.riskScore > 0.2 && (
        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-xs">⚠</span>
            <p className="text-xs text-amber-400">
              Cascade risk {Math.round(cascadeRisk.riskScore * 100)}% → {cascadeRisk.affectedAgents.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
