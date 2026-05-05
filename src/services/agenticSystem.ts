import { SimulationState } from "../types";
import { generateAgents } from "./agentGenerator";
import { runAgent } from "./agentExecutor";
import { resolveAllocations } from "./arbitrator";

export async function runAgenticSystem(state: SimulationState) {
  // 1. Generate agents dynamically
  const agents = await generateAgents(state);

  // 2. Each agent proposes
  const proposals = await Promise.all(
    agents.map(agent => runAgent(agent, state))
  );

  // 3. Final arbitration
  const result = await resolveAllocations(
    proposals,
    state.totalAvailable
  );

  return result;
}