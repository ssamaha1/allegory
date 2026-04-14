import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { concept, domain, analogy } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `You are Allegory, a quiz generator. The user just learned about "${concept}" through a ${domain} analogy.

The analogy used: "${analogy}"

Generate ONE quiz question that tests whether they truly understood the concept — NOT by asking them to define it, but by applying the analogy logic to a new scenario. The question should feel like a puzzle within the ${domain} domain.

Format:
QUESTION: [the question]
ANSWER: [the model answer in 2-3 sentences]

Keep it clever, not trivial.`
          }],
        });

        for await (const chunk of anthropicStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode('Error generating quiz.'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
