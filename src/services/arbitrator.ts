import { client } from "./claudeClient";

export async function resolveAllocations(proposals: any[], total: number) {
  const prompt = `
You are a central crisis AI.

Proposals:
${JSON.stringify(proposals)}

Total power: ${total}

Return JSON:
{
  "allocations": [
    { "agentName": "Hospital", "allocated": number }
  ],
  "reasoning": "..."
}
`;

  const res = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(res.content[0].text);
}