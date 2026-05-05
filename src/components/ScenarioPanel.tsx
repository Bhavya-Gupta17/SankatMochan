import { AllocationStrategy, EventType } from '../types';

const EVENT_TYPES: EventType[] = ['Normal', 'Minor Outage', 'Major Outage', 'Emergency Surge', 'Recovery Phase'];
const EVENT_COLORS: Record<EventType, string> = {
  Normal: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Minor Outage': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Major Outage': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Emergency Surge': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Recovery Phase': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
};

const IMPACT: Record<EventType, number> = {
  Normal: 1.0,
  'Minor Outage': 0.8,
  'Major Outage': 0.5,
  'Emergency Surge': 1.3,
  'Recovery Phase': 1.1,
};

interface Props {
  totalAvailable: number;
  strategy: AllocationStrategy;
  currentEvent: EventType;
  demands: Record<number, number>;
  isRunning: boolean;
  showComparison: boolean;
  onTotalChange: (v: number) => void;
  onStrategyChange: (s: AllocationStrategy) => void;
  onEventChange: (e: EventType) => void;
  onDemandChange: (agentId: number, v: number) => void;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onToggleComparison: () => void;
}

const AGENT_LABELS = [
  { id: 1, name: 'Hospital' },
  { id: 2, name: 'Water Supply' },
  { id: 3, name: 'Emergency Services' },
  { id: 4, name: 'Residential' },
  { id: 5, name: 'Industry' },
];

export default function ScenarioPanel({
  totalAvailable,
  strategy,
  currentEvent,
  demands,
  isRunning,
  showComparison,
  onTotalChange,
  onStrategyChange,
  onEventChange,
  onDemandChange,
  onToggleRun,
  onStep,
  onReset,
  onToggleComparison,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Simulation Controls */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Simulation Controls</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onToggleRun}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            <span>{isRunning ? '⏸' : '▶'}</span>
            {isRunning ? 'Pause' : 'Run'}
          </button>
          <button
            onClick={onStep}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 border border-white/10 hover:bg-slate-700 disabled:opacity-40 transition-all"
          >
            ⏭ Step
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 border border-white/10 hover:bg-slate-700 transition-all"
          >
            ↺ Reset
          </button>
          <button
            onClick={onToggleComparison}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              showComparison
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                : 'bg-slate-700/50 text-slate-400 border-white/10 hover:bg-slate-700'
            }`}
          >
            ≈ Compare
          </button>
        </div>
      </div>

      {/* Strategy Toggle */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Strategy</p>
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          <button
            onClick={() => onStrategyChange('survival')}
            className={`flex-1 py-2 text-sm font-medium transition-all ${
              strategy === 'survival'
                ? 'bg-red-500/20 text-red-300'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Survival Mode
          </button>
          <button
            onClick={() => onStrategyChange('fairness')}
            className={`flex-1 py-2 text-sm font-medium transition-all ${
              strategy === 'fairness'
                ? 'bg-sky-500/20 text-sky-300'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Fairness Mode
          </button>
        </div>
      </div>

      {/* Event Trigger */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trigger Event</p>
        <div className="flex flex-col gap-1.5">
          {EVENT_TYPES.map(evt => (
            <button
              key={evt}
              onClick={() => onEventChange(evt)}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                currentEvent === evt ? EVENT_COLORS[evt] : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-700/50'
              }`}
            >
              <span className="font-medium">{evt}</span>
              <span className="ml-2 text-xs opacity-60">×{IMPACT[evt]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Total Available */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Power</p>
          <span className="text-xs text-amber-400 font-bold">{totalAvailable} MW</span>
        </div>
        <input
          type="range"
          min={50}
          max={250}
          value={totalAvailable}
          onChange={e => onTotalChange(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>50 MW</span>
          <span>250 MW</span>
        </div>
      </div>

      {/* Per-agent demand sliders */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Agent Demands</p>
        <div className="space-y-3">
          {AGENT_LABELS.map(agent => (
            <div key={agent.id}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-slate-400">{agent.name}</label>
                <span className="text-xs text-sky-400 font-medium">{demands[agent.id] ?? 0} MW</span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                value={demands[agent.id] ?? 0}
                onChange={e => onDemandChange(agent.id, Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
