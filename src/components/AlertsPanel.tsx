import { Alert } from '../types';

interface Props {
  alerts: Alert[];
}

const SEV_STYLE: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', icon: '🚨' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', icon: '⚠️' },
  info: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-300', icon: 'ℹ️' },
};

export default function AlertsPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        All systems nominal
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {alerts.map(alert => {
        const style = SEV_STYLE[alert.severity];
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${style.bg} ${style.border}`}
          >
            <span className="text-sm mt-0.5 flex-shrink-0">{style.icon}</span>
            <p className={`text-xs ${style.text} leading-relaxed`}>{alert.message}</p>
            <span className="ml-auto text-xs text-slate-600 flex-shrink-0">T{alert.timestamp}</span>
          </div>
        );
      })}
    </div>
  );
}
