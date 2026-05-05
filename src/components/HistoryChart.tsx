import { HistoryPoint } from '../types';

const AGENT_COLORS: Record<string, string> = {
  Hospital: '#10b981',
  'Water Supply': '#38bdf8',
  'Emergency Services': '#f97316',
  Residential: '#a3e635',
  Industry: '#94a3b8',
};

const AGENTS = ['Hospital', 'Water Supply', 'Emergency Services', 'Residential', 'Industry'];

interface Props {
  history: HistoryPoint[];
}

export default function HistoryChart({ history }: Props) {
  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Waiting for simulation data...
      </div>
    );
  }

  const W = 600;
  const H = 160;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...history.map(h => h.totalAvailable), 150);
  const xScale = (i: number) => padL + (i / Math.max(history.length - 1, 1)) * chartW;
  const yScale = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const pathForAgent = (agent: string) => {
    return history
      .map((h, i) => {
        const v = h.allocations[agent] || 0;
        return `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`;
      })
      .join(' ');
  };

  const yTicks = [0, 50, 100, 150].filter(v => v <= maxVal);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Grid */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={padL} y1={yScale(v)} x2={W - padR} y2={yScale(v)} stroke="#1e293b" strokeWidth={1} />
            <text x={padL - 4} y={yScale(v) + 3} textAnchor="end" fill="#475569" fontSize="9">{v}</text>
          </g>
        ))}

        {/* Total available line */}
        <polyline
          points={history.map((h, i) => `${xScale(i)},${yScale(h.totalAvailable)}`).join(' ')}
          fill="none"
          stroke="#334155"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Agent lines */}
        {AGENTS.map(agent => (
          <path
            key={agent}
            d={pathForAgent(agent)}
            fill="none"
            stroke={AGENT_COLORS[agent] || '#64748b'}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Event markers */}
        {history.map((h, i) => {
          if (h.eventType === 'Normal') return null;
          return (
            <g key={i}>
              <line x1={xScale(i)} y1={padT} x2={xScale(i)} y2={H - padB} stroke="#f59e0b" strokeWidth={1} strokeOpacity={0.4} />
              <text x={xScale(i)} y={padT + 8} textAnchor="middle" fill="#f59e0b" fontSize="7">
                {h.eventType.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* X-axis tick labels */}
        {history.map((h, i) => {
          if (i % Math.max(1, Math.floor(history.length / 8)) !== 0) return null;
          return (
            <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle" fill="#475569" fontSize="8">
              T{h.tick}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-1 px-2">
        {AGENTS.map(agent => (
          <div key={agent} className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ background: AGENT_COLORS[agent] || '#64748b', display: 'inline-block' }} />
            <span className="text-xs text-slate-500">{agent}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="w-3 h-0.5 rounded border-t border-dashed border-slate-500 inline-block" />
          <span className="text-xs text-slate-500">Available</span>
        </div>
      </div>
    </div>
  );
}
