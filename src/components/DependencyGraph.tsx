import { AllocationResult, Dependency } from '../types';

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  Power: { x: 300, y: 50 },
  Hospital: { x: 100, y: 220 },
  'Water Supply': { x: 300, y: 280 },
  'Emergency Services': { x: 500, y: 220 },
  Residential: { x: 150, y: 380 },
  Industry: { x: 450, y: 380 },
};

const STATUS_COLORS: Record<string, string> = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  failed: '#7f1d1d',
};

interface Props {
  allocations: AllocationResult[];
  dependencies: Dependency[];
}

export default function DependencyGraph({ allocations, dependencies }: Props) {
  const statusMap: Record<string, string> = {};
  for (const a of allocations) {
    statusMap[a.agentName] = a.status;
  }
  statusMap['Power'] = 'healthy';

  const agentNames = ['Hospital', 'Water Supply', 'Emergency Services', 'Residential', 'Industry'];

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox="0 0 600 450" className="w-full h-auto">
        {/* Edges */}
        {dependencies.map((dep, i) => {
          const from = NODE_POSITIONS[dep.source];
          const to = NODE_POSITIONS[dep.target];
          if (!from || !to) return null;
          const targetStatus = statusMap[dep.target] || 'healthy';
          const color = targetStatus === 'failed' ? '#7f1d1d' :
            targetStatus === 'critical' ? '#ef4444' :
            targetStatus === 'warning' ? '#f59e0b' : '#334155';
          return (
            <g key={i}>
              <line
                x1={from.x} y1={from.y + 20}
                x2={to.x} y2={to.y - 20}
                stroke={color}
                strokeWidth={dep.weight * 3}
                strokeOpacity={0.6}
                strokeDasharray={targetStatus === 'failed' ? '4 3' : undefined}
              />
              {/* Arrow head */}
              <polygon
                points={`${to.x},${to.y - 20} ${to.x - 5},${to.y - 30} ${to.x + 5},${to.y - 30}`}
                fill={color}
                opacity={0.7}
              />
              {/* Weight label */}
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2}
                textAnchor="middle"
                fill="#475569"
                fontSize="9"
              >
                {dep.weight}
              </text>
            </g>
          );
        })}

        {/* Power node */}
        {(() => {
          const pos = NODE_POSITIONS['Power'];
          return (
            <g key="power">
              <circle cx={pos.x} cy={pos.y} r={28} fill="#1e293b" stroke="#f59e0b" strokeWidth={2} />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle" fill="#fbbf24" fontSize="14">⚡</text>
              <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill="#94a3b8" fontSize="9">Power Grid</text>
            </g>
          );
        })()}

        {/* Agent nodes */}
        {agentNames.map(name => {
          const pos = NODE_POSITIONS[name];
          if (!pos) return null;
          const status = statusMap[name] || 'healthy';
          const color = STATUS_COLORS[status] || '#10b981';
          const alloc = allocations.find(a => a.agentName === name);

          return (
            <g key={name}>
              {status === 'critical' || status === 'failed' ? (
                <circle cx={pos.x} cy={pos.y} r={34} fill={color} opacity={0.15}>
                  <animate attributeName="r" values="30;36;30" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0.25;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
              ) : null}
              <circle cx={pos.x} cy={pos.y} r={30} fill="#0f172a" stroke={color} strokeWidth={2.5} />
              <text x={pos.x} y={pos.y - 5} textAnchor="middle" fill={color} fontSize="13">
                {name === 'Hospital' ? '🏥' : name === 'Water Supply' ? '💧' : name === 'Emergency Services' ? '🚑' : name === 'Residential' ? '🏘️' : '🏭'}
              </text>
              <text x={pos.x} y={pos.y + 8} textAnchor="middle" fill="#94a3b8" fontSize="8">
                {name.split(' ')[0]}
              </text>
              {alloc && (
                <text x={pos.x} y={pos.y + 18} textAnchor="middle" fill={color} fontSize="8" fontWeight="bold">
                  {alloc.allocated.toFixed(0)}MW
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 mt-1 justify-center flex-wrap">
        {[
          { label: 'Healthy', color: '#10b981' },
          { label: 'Warning', color: '#f59e0b' },
          { label: 'Critical', color: '#ef4444' },
          { label: 'Failed', color: '#7f1d1d' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
