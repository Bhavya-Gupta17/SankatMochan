import { client } from "./claudeClient";
import { SimulationState } from "../types";

export async function runAgent(agent: any, state: SimulationState) {
  const prompt = `
You are ${agent.name}
Role: ${agent.role}
Goal: ${agent.goal}

Current system:
${JSON.stringify(state.allocations)}

Return JSON:
{
  "agent": "${agent.name}",
  "requested": number,
  "priority": number,
  "reason": "..."
}
`;

  const res = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(res.content[0].text);
}