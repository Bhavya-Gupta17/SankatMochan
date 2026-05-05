import type {
  Agent,
  Dependency,
  SimEvent,
  AllocationResult,
  NegotiationRound,
  CascadeRisk,
  SimulationState,
  Alert,
  AllocationStrategy,
  HistoryPoint,
} from '../types';

const AGENTS: Agent[] = [
  { id: 1, name: 'Hospital', type: 'critical', demand: 80, priority: 0.95, urgency: 0.9, minRequired: 50, maxCapacity: 100, failureThreshold: 40, icon: '🏥' },
  { id: 2, name: 'Water Supply', type: 'essential', demand: 60, priority: 0.8, urgency: 0.7, minRequired: 40, maxCapacity: 80, failureThreshold: 30, icon: '💧' },
  { id: 3, name: 'Emergency Services', type: 'critical', demand: 50, priority: 0.9, urgency: 0.85, minRequired: 30, maxCapacity: 70, failureThreshold: 25, icon: '🚑' },
  { id: 4, name: 'Residential', type: 'normal', demand: 70, priority: 0.6, urgency: 0.6, minRequired: 30, maxCapacity: 90, failureThreshold: 20, icon: '🏘️' },
  { id: 5, name: 'Industry', type: 'low', demand: 65, priority: 0.4, urgency: 0.5, minRequired: 20, maxCapacity: 100, failureThreshold: 15, icon: '🏭' },
];

const DEPENDENCIES: Dependency[] = [
  { source: 'Power', target: 'Hospital', weight: 0.9 },
  { source: 'Power', target: 'Water Supply', weight: 0.8 },
  { source: 'Power', target: 'Emergency Services', weight: 0.85 },
  { source: 'Water Supply', target: 'Hospital', weight: 0.7 },
  { source: 'Emergency Services', target: 'Hospital', weight: 0.6 },
];

const EVENTS: SimEvent[] = [
  { time: 1, eventType: 'Normal', impactFactor: 1.0 },
  { time: 2, eventType: 'Minor Outage', impactFactor: 0.8 },
  { time: 3, eventType: 'Major Outage', impactFactor: 0.5 },
  { time: 4, eventType: 'Emergency Surge', impactFactor: 1.3 },
  { time: 5, eventType: 'Recovery Phase', impactFactor: 1.1 },
];

export function getAgents(): Agent[] {
  return AGENTS;
}

export function getDependencies(): Dependency[] {
  return DEPENDENCIES;
}

function computeDynamicPriority(agent: Agent, event: SimEvent, strategy: AllocationStrategy): number {
  const basePriority = agent.priority;
  const urgencyBoost = agent.urgency * event.impactFactor;
  const typeMultiplier = agent.type === 'critical' ? 1.3 : agent.type === 'essential' ? 1.1 : agent.type === 'normal' ? 0.9 : 0.7;

  if (strategy === 'survival') {
    return (basePriority * 0.5 + urgencyBoost * 0.5) * typeMultiplier;
  } else {
    // fairness: flatten priorities
    return (basePriority * 0.3 + urgencyBoost * 0.3 + 0.4) * typeMultiplier;
  }
}

function computeBid(agent: Agent, dynamicPriority: number, event: SimEvent): number {
  const effectiveDemand = agent.demand * event.impactFactor;
  return effectiveDemand * dynamicPriority;
}

function computeWithoutAI(agents: Agent[], totalAvailable: number, event: SimEvent): AllocationResult[] {
  // Without AI: naive equal split
  const perAgent = totalAvailable / agents.length;
  return agents.map(agent => {
    const effectiveDemand = agent.demand * event.impactFactor;
    const allocated = Math.min(perAgent, agent.maxCapacity);
    const satisfactionRatio = allocated / effectiveDemand;
    const status = allocated < agent.failureThreshold ? 'failed' :
      allocated < agent.minRequired ? 'critical' :
      satisfactionRatio < 0.7 ? 'warning' : 'healthy';
    return {
      agentId: agent.id,
      agentName: agent.name,
      allocated,
      demanded: effectiveDemand,
      satisfactionRatio,
      status,
      reason: 'Equal distribution (no AI)',
      bid: 0,
      dynamicPriority: agent.priority,
    };
  });
}

function runAuctionNegotiation(
  agents: Agent[],
  totalAvailable: number,
  event: SimEvent,
  strategy: AllocationStrategy
): { allocations: AllocationResult[]; rounds: NegotiationRound[] } {
  const rounds: NegotiationRound[] = [];

  // Phase 1: Compute dynamic priorities and bids
  const agentData = agents.map(agent => {
    const dp = computeDynamicPriority(agent, event, strategy);
    const bid = computeBid(agent, dp, event);
    return { agent, dp, bid };
  });

  // Phase 2: Guarantee minimums first
  let remaining = totalAvailable;
  const guaranteed: Record<number, number> = {};
  for (const { agent } of agentData) {
    const effectiveDemand = agent.demand * event.impactFactor;
    const minGrant = Math.min(agent.minRequired, effectiveDemand, remaining);
    guaranteed[agent.id] = minGrant;
    remaining -= minGrant;
  }

  // Phase 3: Auction the remaining resources by bid weight
  const totalBid = agentData.reduce((sum, d) => sum + d.bid, 0);
  const auctionAlloc: Record<number, number> = {};
  for (const { agent, bid } of agentData) {
    const share = totalBid > 0 ? (bid / totalBid) * remaining : remaining / agents.length;
    const effectiveDemand = agent.demand * event.impactFactor;
    const maxExtra = Math.max(0, Math.min(agent.maxCapacity - guaranteed[agent.id], effectiveDemand - guaranteed[agent.id]));
    auctionAlloc[agent.id] = Math.min(share, maxExtra);
  }

  // Redistribute unclaimed auction resources
  const totalClaimed = Object.values(auctionAlloc).reduce((s, v) => s + v, 0);
  const unclaimed = remaining - totalClaimed;
  if (unclaimed > 0) {
    // Give unclaimed to critical agents proportionally
    const criticals = agentData.filter(d => d.agent.type === 'critical');
    if (criticals.length > 0) {
      const critBidSum = criticals.reduce((s, d) => s + d.bid, 0);
      for (const { agent, bid } of criticals) {
        const extra = critBidSum > 0 ? (bid / critBidSum) * unclaimed : unclaimed / criticals.length;
        const effectiveDemand = agent.demand * event.impactFactor;
        auctionAlloc[agent.id] = Math.min(
          auctionAlloc[agent.id] + extra,
          agent.maxCapacity - guaranteed[agent.id]
        );
        auctionAlloc[agent.id] = Math.max(0, auctionAlloc[agent.id]);
        const spare = effectiveDemand - guaranteed[agent.id] - auctionAlloc[agent.id];
        if (spare < 0) auctionAlloc[agent.id] += spare;
      }
    }
  }

  const allocations: AllocationResult[] = agentData.map(({ agent, dp, bid }) => {
    const effectiveDemand = agent.demand * event.impactFactor;
    const allocated = Math.min(
      (guaranteed[agent.id] || 0) + (auctionAlloc[agent.id] || 0),
      agent.maxCapacity,
      effectiveDemand
    );
    const satisfactionRatio = effectiveDemand > 0 ? allocated / effectiveDemand : 1;
    const status = allocated < agent.failureThreshold ? 'failed' :
      allocated < agent.minRequired ? 'critical' :
      satisfactionRatio < 0.75 ? 'warning' : 'healthy';

    const reason = buildReason(agent, allocated, effectiveDemand, satisfactionRatio, event, strategy);

    rounds.push({
      agentId: agent.id,
      agentName: agent.name,
      bid,
      dynamicPriority: dp,
      won: satisfactionRatio >= 0.8,
      allocatedShare: allocated,
    });

    return {
      agentId: agent.id,
      agentName: agent.name,
      allocated,
      demanded: effectiveDemand,
      satisfactionRatio,
      status,
      reason,
      bid,
      dynamicPriority: dp,
    };
  });

  return { allocations, rounds };
}

function buildReason(
  agent: Agent,
  allocated: number,
  demanded: number,
  satisfactionRatio: number,
  event: SimEvent,
  strategy: AllocationStrategy
): string {
  const pct = Math.round(satisfactionRatio * 100);
  const parts: string[] = [];

  if (agent.type === 'critical') parts.push(`Critical infrastructure — high mortality risk`);
  if (agent.type === 'essential') parts.push(`Essential service — cascade risk to dependents`);
  if (event.eventType !== 'Normal') parts.push(`${event.eventType} event (impact ×${event.impactFactor})`);
  if (strategy === 'survival') parts.push(`Survival mode prioritizes life-critical systems`);
  else parts.push(`Fairness mode balances equal distribution`);
  parts.push(`${pct}% demand satisfied (${allocated.toFixed(1)} of ${demanded.toFixed(1)} MW)`);

  return parts.join('. ');
}

function computeCascadeRisks(allocations: AllocationResult[]): CascadeRisk[] {
  const risks: CascadeRisk[] = [];

  for (const alloc of allocations) {
    if (alloc.satisfactionRatio < 0.7 || alloc.status === 'failed' || alloc.status === 'critical') {
      const affected = DEPENDENCIES
        .filter(d => d.source === alloc.agentName || d.source === 'Power' && alloc.agentName === 'Power')
        .map(d => d.target);

      // Also check secondary cascade
      const deps = DEPENDENCIES.filter(d => d.source === alloc.agentName);
      const directTargets = deps.map(d => d.target);
      const secondaryTargets: string[] = [];
      for (const target of directTargets) {
        const secondary = DEPENDENCIES.filter(d => d.source === target).map(d => d.target);
        secondaryTargets.push(...secondary);
      }

      const allAffected = [...new Set([...directTargets, ...secondaryTargets])];
      const maxWeight = deps.reduce((max, d) => Math.max(max, d.weight), 0);

      if (allAffected.length > 0 || alloc.status === 'failed') {
        const riskScore = (1 - alloc.satisfactionRatio) * (alloc.dynamicPriority || 0.5) * (maxWeight || 0.5);
        risks.push({
          agentId: alloc.agentId,
          agentName: alloc.agentName,
          riskScore: Math.min(riskScore, 1),
          affectedAgents: allAffected,
          trigger: alloc.status === 'failed' ? 'System failure imminent' :
            alloc.status === 'critical' ? 'Below minimum threshold' : 'Degraded performance',
        });
      }
    }
  }

  return risks.sort((a, b) => b.riskScore - a.riskScore);
}

function computeFairness(allocations: AllocationResult[]): number {
  const ratios = allocations.map(a => a.satisfactionRatio);
  const mean = ratios.reduce((s, r) => s + r, 0) / ratios.length;
  const variance = ratios.reduce((s, r) => s + (r - mean) ** 2, 0) / ratios.length;
  return Math.max(0, 1 - Math.sqrt(variance));
}

function computeEfficiency(allocations: AllocationResult[], totalAvailable: number): number {
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  return Math.min(totalAllocated / totalAvailable, 1);
}

function generateAlerts(allocations: AllocationResult[], cascadeRisks: CascadeRisk[], tick: number): Alert[] {
  const alerts: Alert[] = [];
  for (const alloc of allocations) {
    if (alloc.status === 'failed') {
      alerts.push({
        id: `${tick}-${alloc.agentId}-failed`,
        severity: 'critical',
        message: `${alloc.agentName} has FAILED — allocation below failure threshold`,
        agentName: alloc.agentName,
        timestamp: tick,
      });
    } else if (alloc.status === 'critical') {
      alerts.push({
        id: `${tick}-${alloc.agentId}-critical`,
        severity: 'critical',
        message: `${alloc.agentName} below minimum required — service disruption likely`,
        agentName: alloc.agentName,
        timestamp: tick,
      });
    } else if (alloc.status === 'warning') {
      alerts.push({
        id: `${tick}-${alloc.agentId}-warning`,
        severity: 'warning',
        message: `${alloc.agentName} operating at reduced capacity (${Math.round(alloc.satisfactionRatio * 100)}%)`,
        agentName: alloc.agentName,
        timestamp: tick,
      });
    }
  }
  for (const risk of cascadeRisks.filter(r => r.riskScore > 0.4)) {
    alerts.push({
      id: `${tick}-cascade-${risk.agentId}`,
      severity: risk.riskScore > 0.7 ? 'critical' : 'warning',
      message: `Cascade risk: ${risk.agentName} failure may affect ${risk.affectedAgents.join(', ')}`,
      agentName: risk.agentName,
      timestamp: tick,
    });
  }
  return alerts;
}

export function runSimulationTick(
  tick: number,
  totalAvailable: number,
  manualDemands: Record<number, number> | null,
  strategy: AllocationStrategy,
  customEvent: SimEvent | null
): SimulationState {
  const eventIndex = (tick - 1) % EVENTS.length;
  const event = customEvent || EVENTS[eventIndex];

  const agents = AGENTS.map(a => ({
    ...a,
    demand: manualDemands && manualDemands[a.id] !== undefined ? manualDemands[a.id] : a.demand,
  }));

  const { allocations, rounds } = runAuctionNegotiation(agents, totalAvailable, event, strategy);
  const withoutAI = computeWithoutAI(agents, totalAvailable, event);
  const cascadeRisks = computeCascadeRisks(allocations);
  const alerts = generateAlerts(allocations, cascadeRisks, tick);
  const fairnessScore = computeFairness(allocations);
  const efficiencyScore = computeEfficiency(allocations, totalAvailable);

  return {
    tick,
    event,
    totalAvailable,
    allocations,
    negotiationRounds: rounds,
    cascadeRisks,
    alerts,
    withoutAI,
    strategy,
    fairnessScore,
    efficiencyScore,
  };
}

export function buildHistoryPoint(state: SimulationState): HistoryPoint {
  const allocations: Record<string, number> = {};
  for (const a of state.allocations) {
    allocations[a.agentName] = a.allocated;
  }
  return {
    tick: state.tick,
    eventType: state.event.eventType,
    allocations,
    totalAvailable: state.totalAvailable,
    fairness: state.fairnessScore,
    efficiency: state.efficiencyScore,
  };
}
