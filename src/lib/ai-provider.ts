import OpenAI from "openai";

export type AIProvider = "openrouter" | "openai";

export type AIProviderConfig = {
  provider: AIProvider;
  model: string;
  client: OpenAI;
};

function env(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[name];
}

export function getAIProviderConfig(): AIProviderConfig {
  const providerOverride = env("AI_PROVIDER") as AIProvider | undefined;
  const modelOverride = env("AI_MODEL");
  const openRouterKey = env("OPENROUTER_API_KEY");
  const openAIKey = env("OPENAI_API_KEY");

  if (providerOverride === "openai") {
    if (!openAIKey) {
      throw new Error("AI_PROVIDER is set to 'openai' but OPENAI_API_KEY is missing. Set OPENAI_API_KEY in the app environment.");
    }
    return {
      provider: "openai",
      model: modelOverride ?? "gpt-4o",
      client: new OpenAI({ apiKey: openAIKey }),
    };
  }

  if (providerOverride === "openrouter" || openRouterKey) {
    if (!openRouterKey) {
      throw new Error("AI_PROVIDER is set to 'openrouter' but OPENROUTER_API_KEY is missing. Set OPENROUTER_API_KEY in the app environment.");
    }
    return {
      provider: "openrouter",
      model: modelOverride ?? "deepseek/deepseek-chat-v3-0324",
      client: new OpenAI({
        apiKey: openRouterKey,
        baseURL: "https://openrouter.ai/api/v1",
      }),
    };
  }

  if (openAIKey) {
    return {
      provider: "openai",
      model: modelOverride ?? "gpt-4o",
      client: new OpenAI({ apiKey: openAIKey }),
    };
  }

  throw new Error("No AI provider configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY in the app environment.");
}

export function getAIProviderStatus(): { provider: AIProvider | null; model: string | null; configured: boolean } {
  try {
    const config = getAIProviderConfig();
    return { provider: config.provider, model: config.model, configured: true };
  } catch {
    return { provider: null, model: null, configured: false };
  }
}