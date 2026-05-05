import { AllocationResult, NegotiationRound, SimulationState } from '../types';

interface Props {
  state: SimulationState;
}

export default function ExplainPanel({ state }: Props) {
  const sorted = [...state.allocations].sort((a, b) => b.dynamicPriority - a.dynamicPriority);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Explainable AI — Why These Allocations?</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
          {state.event.eventType}
        </span>
      </div>

      {/* Negotiation bid table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-1.5 text-slate-500 font-medium">Agent</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Dynamic Priority</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Bid</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Got</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Needed</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(alloc => {
              const round = state.negotiationRounds.find(r => r.agentId === alloc.agentId);
              return (
                <tr key={alloc.agentId} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-1.5 text-white font-medium">{alloc.agentName}</td>
                  <td className="py-1.5 text-right text-sky-400">{alloc.dynamicPriority.toFixed(3)}</td>
                  <td className="py-1.5 text-right text-violet-400">{alloc.bid.toFixed(1)}</td>
                  <td className="py-1.5 text-right text-emerald-400">{alloc.allocated.toFixed(1)}</td>
                  <td className="py-1.5 text-right text-slate-400">{alloc.demanded.toFixed(1)}</td>
                  <td className="py-1.5 text-right">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      round?.won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {round?.won ? 'Won' : 'Partial'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per-agent reasoning */}
      <div className="space-y-2">
        {sorted.slice(0, 3).map(alloc => (
          <div key={alloc.agentId} className="rounded-lg bg-slate-800/50 border border-white/5 p-3">
            <p className="text-xs font-semibold text-white mb-1">{alloc.agentName}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{alloc.reason}</p>
          </div>
        ))}
      </div>

      {/* Strategy explanation */}
      <div className="rounded-lg bg-slate-800/50 border border-sky-500/20 p-3">
        <p className="text-xs font-semibold text-sky-400 mb-1">
          Active Strategy: {state.strategy === 'survival' ? 'Survival Mode' : 'Fairness Mode'}
        </p>
        <p className="text-xs text-slate-400">
          {state.strategy === 'survival'
            ? 'Life-critical agents (Hospital, Emergency Services) receive amplified priority weights. The auction bids heavily favor agents with high urgency during crisis events.'
            : 'Priority weights are flattened to ensure more equitable distribution. All agents receive closer to their proportional share of available resources.'}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-xs text-slate-500">Fairness Score</p>
            <p className="text-sm font-bold text-amber-400">{(state.fairnessScore * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Efficiency Score</p>
            <p className="text-sm font-bold text-emerald-400">{(state.efficiencyScore * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
