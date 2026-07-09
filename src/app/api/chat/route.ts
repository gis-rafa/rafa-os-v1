import { getAIProviderConfig } from "@/lib/ai-provider";

export const runtime = "nodejs";

type ChatRequest = {
  prompt?: string;
};

export async function POST(request: Request) {
  let config;

  try {
    config = getAIProviderConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI provider configuration error.";
    return new Response(message, { status: 500 });
  }

  const body = (await request.json()) as ChatRequest;
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return new Response("Prompt is missing.", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const completion = await config.client.chat.completions.create({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          stream: true,
        });

        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : `Unknown ${config.provider} error.`;
        controller.enqueue(encoder.encode(`${config.provider} error: ${message}`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}