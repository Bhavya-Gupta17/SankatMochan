import { useState, useEffect, useRef, useCallback } from 'react';
import { AllocationStrategy, EventType, SimulationState, HistoryPoint, Alert } from './types';
import { runSimulationTick, buildHistoryPoint, getDependencies } from './engine/simulator';
import { runAgenticSystem } from "./services/agenticSystem"; // 🔥 ADDED

import AgentCard from './components/AgentCard';
import AllocationChart from './components/AllocationChart';
import DependencyGraph from './components/DependencyGraph';
import HistoryChart from './components/HistoryChart';
import AlertsPanel from './components/AlertsPanel';
import ExplainPanel from './components/ExplainPanel';
import ScenarioPanel from './components/ScenarioPanel';

const INITIAL_DEMANDS: Record<number, number> = { 1: 80, 2: 60, 3: 50, 4: 70, 5: 65 };
const INITIAL_TOTAL = 150;
const TICK_INTERVAL = 2000;

const EVENT_IMPACT: Record<EventType, number> = {
  Normal: 1.0, 'Minor Outage': 0.8, 'Major Outage': 0.5, 'Emergency Surge': 1.3, 'Recovery Phase': 1.1,
};

type Tab = 'dashboard' | 'dependency' | 'history' | 'explain';

export default function App() {
  const [tick, setTick] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [strategy, setStrategy] = useState<AllocationStrategy>('survival');
  const [totalAvailable, setTotalAvailable] = useState(INITIAL_TOTAL);
  const [demands, setDemands] = useState<Record<number, number>>(INITIAL_DEMANDS);
  const [currentEvent, setCurrentEvent] = useState<EventType>('Normal');
  const [showComparison, setShowComparison] = useState(false);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);

  const currentEventRef = useRef(currentEvent);
  const totalAvailableRef = useRef(totalAvailable);
  const demandsRef = useRef(demands);
  const strategyRef = useRef(strategy);

  useEffect(() => { currentEventRef.current = currentEvent; }, [currentEvent]);
  useEffect(() => { totalAvailableRef.current = totalAvailable; }, [totalAvailable]);
  useEffect(() => { demandsRef.current = demands; }, [demands]);
  useEffect(() => { strategyRef.current = strategy; }, [strategy]);

  // 🔥 UPDATED runTick WITH CLAUDE
  const runTick = useCallback((nextTick: number, overrides?: Partial<{
    event: EventType; total: number; dem: Record<number, number>; strat: AllocationStrategy;
  }>) => {

    const evt = overrides?.event ?? currentEventRef.current;
    const tot = overrides?.total ?? totalAvailableRef.current;
    const dem = overrides?.dem ?? demandsRef.current;
    const strat = overrides?.strat ?? strategyRef.current;

    const customEvent = { time: nextTick, eventType: evt, impactFactor: EVENT_IMPACT[evt] };

    // ✅ 1. RUN ENGINE (FAST)
    const state = runSimulationTick(nextTick, tot, dem, strat, customEvent);

    // ✅ 2. UPDATE UI IMMEDIATELY
    setSimState(state);

    // ✅ 3. HISTORY
    setHistory(prev => [...prev.slice(-49), buildHistoryPoint(state)]);

    // ✅ 4. ALERTS
    setAllAlerts(prev => {
      const combined = [...state.alerts, ...prev];
      const seen = new Set<string>();
      return combined.filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      }).slice(0, 30);
    });

    // 🚀 5. CLAUDE AGENT SYSTEM (NON-BLOCKING)
    if (nextTick % 2 !== 0) return; // performance control

    runAgenticSystem(state)
      .then(aiResult => {
        setSimState(prev => {
          if (!prev) return prev;

          return {
            ...prev,
            aiAllocations: aiResult.allocations,
            aiReasoning: aiResult.reasoning,
          };
        });
      })
      .catch(err => {
        console.log("Claude failed:", err);
      });

  }, []);

  // Auto-run loop
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        runTick(next);
        return next;
      });
    }, TICK_INTERVAL);
    return () => clearInterval(id);
  }, [isRunning, runTick]);

  useEffect(() => {
    if (tick > 0) runTick(tick, { event: currentEvent });
  }, [currentEvent]);

  useEffect(() => {
    if (tick > 0) runTick(tick, { total: totalAvailable });
  }, [totalAvailable]);

  useEffect(() => {
    if (tick > 0) runTick(tick, { strat: strategy });
  }, [strategy]);

  useEffect(() => {
    if (tick > 0) runTick(tick, { dem: demands });
  }, [demands]);

  const handleStep = () => {
    const next = tick + 1;
    setTick(next);
    runTick(next);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTick(0);
    setSimState(null);
    setHistory([]);
    setAllAlerts([]);
    setDemands(INITIAL_DEMANDS);
    setTotalAvailable(INITIAL_TOTAL);
    setCurrentEvent('Normal');
    setStrategy('survival');
  };

  const handleDemandChange = (agentId: number, v: number) => {
    setDemands(prev => ({ ...prev, [agentId]: v }));
  };

  const criticalCount = simState?.allocations.filter(a => a.status === 'failed' || a.status === 'critical').length ?? 0;
  const systemHealth = simState
    ? Math.round(simState.allocations.reduce((s, a) => s + a.satisfactionRatio, 0) / simState.allocations.length * 100)
    : 100;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'dependency', label: 'Dependency Graph' },
    { id: 'history', label: 'History' },
    { id: 'explain', label: 'Explain AI' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5 bg-slate-900/80 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 flex justify-between h-14 items-center">
          <h1 className="text-sm font-bold">⚡ Crisis Resource Allocator</h1>
          <span className="text-xs text-slate-400">T{tick}</span>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 flex gap-6">
        <aside className="w-72">
          <ScenarioPanel
            totalAvailable={totalAvailable}
            strategy={strategy}
            currentEvent={currentEvent}
            demands={demands}
            isRunning={isRunning}
            showComparison={showComparison}
            onTotalChange={setTotalAvailable}
            onStrategyChange={setStrategy}
            onEventChange={setCurrentEvent}
            onDemandChange={handleDemandChange}
            onToggleRun={() => setIsRunning(r => !r)}
            onStep={handleStep}
            onReset={handleReset}
            onToggleComparison={() => setShowComparison(s => !s)}
          />
        </aside>

        <main className="flex-1 space-y-5">
          {simState && (
            <>
              <AllocationChart allocations={simState.allocations} totalAvailable={simState.totalAvailable} />
              <ExplainPanel state={simState} />

              {/* 🔥 Claude Output */}
              {simState.aiReasoning && (
                <div className="p-3 bg-purple-900/20 border border-purple-500/20 rounded">
                  <p className="text-xs text-purple-300 font-semibold">Claude AI Decision</p>
                  <p className="text-xs text-slate-300 mt-1">{simState.aiReasoning}</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}