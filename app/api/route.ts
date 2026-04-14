import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { concept, profile, excludeDomain } = await req.json();

  if (!concept || concept.trim().length < 2) {
    return new Response('Concept required', { status: 400 });
  }

  const domainsStr = profile?.domains?.length
    ? profile.domains.join(', ')
    : 'everyday life, cooking, stories';

  const toneStr = profile?.tone === 'playful'
    ? 'warm, playful, and full of vivid imagery'
    : profile?.tone === 'rigorous'
    ? 'precise and intellectually sharp, but still human'
    : 'clear, intelligent, and engaging';

  const backgroundStr = profile?.background || 'a general curious adult';
  const excludeStr = excludeDomain
    ? `Do NOT use the domain "${excludeDomain}" — the user found it unhelpful.`
    : '';

  const systemPrompt = `You are Allegory, a master explanation engine. Your gift is translating complex concepts into felt understanding through analogy, metaphor, and the user's own world.

User profile:
- Interests/domains they love: ${domainsStr}
- Academic background: ${backgroundStr}
- Preferred tone: ${toneStr}
${excludeStr}

Your task: explain the concept in exactly THREE layers, each separated by "---LEVEL---".

LAYER 1 — INTUITIVE ANALOGY (label this "The Analogy")
Pick the SINGLE BEST domain from their interests that structurally mirrors this concept. Write 3–5 sentences of pure felt intuition. Use vivid, concrete imagery. No jargon. Make the person feel the concept before they understand it. Start with "Think of..." or "Imagine..." or another grounding phrase.

LAYER 2 — STRUCTURAL BRIDGE (label this "The Bridge")
Now show HOW the analogy maps onto the real concept. Name the correspondences explicitly. Point out ONE place where the analogy breaks down to prevent misconceptions. Write 4–6 sentences.

LAYER 3 — THE REAL THING (label this "The Real Thing")
Give the precise, accurate definition or explanation. Include a formula or technical detail if relevant. 2–4 sentences.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
DOMAIN: [the analogy domain you chose, e.g. "cooking"]
EMOJI: [one emoji for that domain]
---LEVEL---
**The Analogy**
[layer 1 text]
---LEVEL---
**The Bridge**
[layer 2 text]
---LEVEL---
**The Real Thing**
[layer 3 text]

Rules:
- Never sacrifice accuracy for elegance
- Be warm, not academic
- The analogy must be structurally accurate, not just superficially similar
- Write as a brilliant friend, not a textbook`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: 'user', content: `Explain this concept: "${concept}"` }],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error('Stream error:', err);
        controller.enqueue(encoder.encode('\n\nError generating explanation. Please check your API key.'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
