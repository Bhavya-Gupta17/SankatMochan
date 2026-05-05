import { useState, useEffect } from 'react';
import { SimulationState, Agent } from '../types';
import { analyzeAllocationWithAI, generateDetailedExplanation } from '../services/claudeAI';

interface Props {
  state: SimulationState;
  agents: Agent[];
  previousStates: SimulationState[];
  isActive: boolean;
}

interface Analysis {
  loading: boolean;
  data: any;
  error: string | null;
}

export default function AIAnalyticsPanel({ state, agents, previousStates, isActive }: Props) {
  const [analysis, setAnalysis] = useState<Analysis>({ loading: false, data: null, error: null });
  const [explanation, setExplanation] = useState<Analysis>({ loading: false, data: null, error: null });
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !state) return;

    const runAnalysis = async () => {
      setAnalysis({ loading: true, data: null, error: null });
      try {
        const result = await analyzeAllocationWithAI(state, agents, previousStates);
        setAnalysis({ loading: false, data: result, error: null });
      } catch (err) {
        setAnalysis({
          loading: false,
          data: null,
          error: err instanceof Error ? err.message : 'Analysis failed',
        });
      }
    };

    const runExplanation = async () => {
      setExplanation({ loading: true, data: null, error: null });
      try {
        const result = await generateDetailedExplanation(state, agents);
        setExplanation({ loading: false, data: result, error: null });
      } catch (err) {
        setExplanation({
          loading: false,
          data: null,
          error: err instanceof Error ? err.message : 'Explanation failed',
        });
      }
    };

    runAnalysis();
    if (Math.random() > 0.5) runExplanation();
  }, [state?.tick, isActive]);

  if (!isActive) return null;

  return (
    <div className="space-y-5">
      {/* AI Analysis Section */}
      <section className="bg-gradient-to-br from-sky-900/20 to-cyan-900/20 rounded-2xl border border-sky-500/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🤖</span>
          <h3 className="text-sm font-semibold text-sky-300">Claude AI Analysis</h3>
          {analysis.loading && (
            <span className="ml-auto text-xs text-slate-500 animate-pulse">Analyzing...</span>
          )}
        </div>

        {analysis.error && (
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3">
            {analysis.error}
          </div>
        )}

        {analysis.data && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
              <p className="text-sm text-slate-300">{analysis.data.summary}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      analysis.data.confidence > 0.7
                        ? 'bg-emerald-500'
                        : analysis.data.confidence > 0.5
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.data.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  {Math.round(analysis.data.confidence * 100)}% confidence
                </span>
              </div>
            </div>

            {/* Strategy recommendation */}
            {analysis.data.strategyAdjustment !== 'maintain' && (
              <div className={`rounded-lg p-3 border text-xs ${
                analysis.data.strategyAdjustment === 'shift_to_survival'
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
              }`}>
                <p className="font-semibold mb-1">Strategy Adjustment</p>
                <p>
                  Consider switching to{' '}
                  <span className="font-bold">
                    {analysis.data.strategyAdjustment === 'shift_to_survival' ? 'Survival' : 'Fairness'} mode
                  </span>
                </p>
              </div>
            )}

            {/* Risk assessment */}
            <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
              <p className="text-xs font-semibold text-red-400 mb-1">Risk Assessment</p>
              <p className="text-xs text-slate-300">{analysis.data.riskAssessment}</p>
            </div>

            {/* Recommendations */}
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-2">AI Recommendations</p>
              <ul className="space-y-1">
                {analysis.data.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 flex-shrink-0">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cascade prevention */}
            {analysis.data.cascadePreventionActions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2">Cascade Prevention Actions</p>
                <ul className="space-y-1">
                  {analysis.data.cascadePreventionActions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-amber-400 flex-shrink-0">⚠</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Claude thinking (if available) */}
            {analysis.data.thinking && (
              <details className="text-xs text-slate-500 border-t border-white/5 pt-2">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-300 font-medium">
                  Claude Extended Thinking
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600 max-h-24 overflow-y-auto">
                  {analysis.data.thinking}
                </p>
              </details>
            )}
          </div>
        )}
      </section>

      {/* AI Explanation Section */}
      {explanation.data && (
        <section className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-2xl border border-violet-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💡</span>
            <h3 className="text-sm font-semibold text-violet-300">Detailed Explanations</h3>
          </div>

          <div className="space-y-2">
            {/* System insights */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5 text-xs text-slate-300">
              {explanation.data.systemWideInsights}
            </div>

            {/* Per-agent explanations */}
            <div>
              <p className="text-xs font-semibold text-violet-400 mb-2">Per-Agent Analysis</p>
              <div className="space-y-1">
                {Object.entries(explanation.data.agentAnalysis).map(([agent, reasoning]: [string, any]) => (
                  <button
                    key={agent}
                    onClick={() => setExpandedAgent(expandedAgent === agent ? null : agent)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-white/5 transition-all text-xs font-medium text-slate-300"
                  >
                    <span className="flex items-center justify-between">
                      <span>{agent}</span>
                      <span className="text-slate-600">{expandedAgent === agent ? '−' : '+'}</span>
                    </span>
                    {expandedAgent === agent && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{reasoning}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Failure scenarios */}
            {explanation.data.failureScenarios && explanation.data.failureScenarios.length > 0 && (
              <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                <p className="text-xs font-semibold text-red-400 mb-2">Potential Failure Scenarios</p>
                <ul className="space-y-1">
                  {explanation.data.failureScenarios.map((scenario: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-red-400 flex-shrink-0">×</span>
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
