import OpenAI from "openai";

export const runtime = "nodejs";

type ChatRequest = {
  prompt?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      "OpenAI API key is missing. Set OPENAI_API_KEY in the app environment.",
      { status: 500 }
    );
  }

  const body = (await request.json()) as ChatRequest;
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return new Response("Prompt is missing.", { status: 400 });
  }

  const client = new OpenAI({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const responseStream = await client.responses.create({
          model: process.env.OPENAI_MODEL ?? "gpt-5.5",
          input: prompt,
          stream: true,
          stream_options: {
            include_obfuscation: false
          }
        });

        for await (const event of responseStream) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(event.delta));
          }

          if (event.type === "error") {
            controller.enqueue(
              encoder.encode(`\n\nOpenAI API error: ${event.message}`)
            );
          }

          if (event.type === "response.failed") {
            const message =
              event.response.error?.message ?? "Response failed.";

            controller.enqueue(
              encoder.encode(`\n\nOpenAI API error: ${message}`)
            );
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown OpenAI API error.";

        controller.enqueue(encoder.encode(`OpenAI API error: ${message}`));
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
