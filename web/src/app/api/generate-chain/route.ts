import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, agents } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json(
        { error: 'No agents available. Please start some agents first.' },
        { status: 400 }
      );
    }

    // Build context about available agents
    const agentContext = agents
      .map(
        (a: any) =>
          `- ${a.name} (ID: ${a.id}): ${a.capabilities.map((c: any) => `${c.name} (${c.description}) - ${c.price}`).join(', ')}`
      )
      .join('\n');

    const systemPrompt = `You are an AI agent chain builder. Given a user's request and a list of available agents, create an optimal chain of agents to fulfill the request.

Available agents:
${agentContext}

Return a JSON object with this structure:
{
  "chain": [
    {
      "agentId": "agent-id-here",
      "capability": "capability-name",
      "input": { key: "value" },
      "reasoning": "why this step is needed"
    }
  ],
  "limitations": "optional: mention if parts of the request cannot be fulfilled"
}

CRITICAL RULES:
1. ANALYZE THE REQUEST: List ALL tasks the user is asking for
2. CHECK AVAILABILITY: For each task, verify if an agent exists that can do it
3. IF ANY TASK IS IMPOSSIBLE:
   - Return: {"error": "missing_agents", "message": "Cannot complete full request. You asked for: [list all tasks]. Missing agents for: [tasks I can't do]. I can only: [tasks I can do]"}
4. IF YOU CAN DO PARTIAL WORK:
   - Include "limitations": "⚠️ Your request included: [missing tasks] - but I don't have agents for that. This chain only does: [what I can do]"
5. Examples:
   - Request: "generate image and animate" → If no animation agent exists, MUST mention it
   - Request: "translate and summarize" → If no translator exists, MUST mention it
6. Only use agents from the available list - never hallucinate
7. Chain agents so output flows from one to next
8. Be brutally honest - users need to know limitations`;

    // Use OpenAI to generate chain
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Check if AI says agents are missing
    if (result.error === 'missing_agents') {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Chain generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate chain' },
      { status: 500 }
    );
  }
}

