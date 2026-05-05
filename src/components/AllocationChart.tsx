import { AllocationResult } from '../types';

const AGENT_COLORS: Record<string, string> = {
  Hospital: '#10b981',
  'Water Supply': '#38bdf8',
  'Emergency Services': '#f97316',
  Residential: '#a3e635',
  Industry: '#94a3b8',
};

interface Props {
  allocations: AllocationResult[];
  totalAvailable: number;
}

export default function AllocationChart({ allocations, totalAvailable }: Props) {
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  const unallocated = Math.max(0, totalAvailable - totalAllocated);

  const segments = [
    ...allocations.map(a => ({ name: a.agentName, value: a.allocated, color: AGENT_COLORS[a.agentName] || '#64748b' })),
    ...(unallocated > 0.5 ? [{ name: 'Reserve', value: unallocated, color: '#1e293b' }] : []),
  ];

  // Compute SVG donut
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const innerR = 48;

  let cumAngle = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const fraction = seg.value / totalAvailable;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;

    return { ...seg, path, fraction };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.path}
            fill={arc.color}
            opacity={arc.name === 'Reserve' ? 0.3 : 0.9}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#f1f5f9" fontSize="16" fontWeight="bold">
          {totalAllocated.toFixed(0)}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#64748b" fontSize="9">
          of {totalAvailable} MW
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="#64748b" fontSize="8">
          allocated
        </text>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full px-2">
        {allocations.map(a => (
          <div key={a.agentId} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: AGENT_COLORS[a.agentName] || '#64748b' }}
            />
            <span className="text-xs text-slate-400 truncate">{a.agentName}</span>
            <span className="text-xs text-slate-500 ml-auto">{a.allocated.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
