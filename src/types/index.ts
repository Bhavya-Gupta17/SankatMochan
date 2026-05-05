export type AgentType = 'critical' | 'essential' | 'normal' | 'low';
export type AllocationStrategy = 'survival' | 'fairness';
export type EventType = 'Normal' | 'Minor Outage' | 'Major Outage' | 'Emergency Surge' | 'Recovery Phase';

export interface Agent {
  id: number;
  name: string;
  type: AgentType;
  demand: number;
  priority: number;
  urgency: number;
  minRequired: number;
  maxCapacity: number;
  failureThreshold: number;
  icon: string;
}

export interface Dependency {
  source: string;
  target: string;
  weight: number;
}

export interface Resource {
  id: number;
  name: string;
  totalAvailable: number;
  unit: string;
}

export interface SimEvent {
  time: number;
  eventType: EventType;
  impactFactor: number;
}

export interface AllocationResult {
  agentId: number;
  agentName: string;
  allocated: number;
  demanded: number;
  satisfactionRatio: number;
  status: 'healthy' | 'warning' | 'critical' | 'failed';
  reason: string;
  bid: number;
  dynamicPriority: number;
}

export interface NegotiationRound {
  agentId: number;
  agentName: string;
  bid: number;
  dynamicPriority: number;
  won: boolean;
  allocatedShare: number;
}

export interface CascadeRisk {
  agentId: number;
  agentName: string;
  riskScore: number;
  affectedAgents: string[];
  trigger: string;
}

export interface SimulationState {
  tick: number;
  event: SimEvent;
  totalAvailable: number;
  allocations: AllocationResult[];
  negotiationRounds: NegotiationRound[];
  cascadeRisks: CascadeRisk[];
  alerts: Alert[];
  withoutAI: AllocationResult[];
  strategy: AllocationStrategy;
  fairnessScore: number;
  efficiencyScore: number;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  agentName?: string;
  timestamp: number;
}

export interface HistoryPoint {
  tick: number;
  eventType: string;
  allocations: Record<string, number>;
  totalAvailable: number;
  fairness: number;
  efficiency: number;
}
export interface AIAllocation {
  agentName: string;
  allocated: number;
}

export interface SimulationState {
  ...
  aiAllocations?: AIAllocation[];
  aiReasoning?: string;
}