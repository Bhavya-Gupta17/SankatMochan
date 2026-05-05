import { client } from "./claudeClient";
import { SimulationState } from "../types";

export async function generateAgents(state: SimulationState) {
  const prompt = `
Create agents for crisis resource allocation.

System:
${JSON.stringify(state.allocations)}

Return JSON:
[
  {
    "name": "Hospital",
    "role": "life-critical system",
    "goal": "maximize survival"
  }
]
`;

  const res = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(res.content[0].text);
}