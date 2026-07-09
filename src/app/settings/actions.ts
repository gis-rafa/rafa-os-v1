"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, isDatabaseConfigured, users } from "@/db";
import { getActionUser } from "@/lib/auth-user";
import { updateNotificationPreferences } from "@/lib/notification-preferences";
import { getAIProviderConfig } from "@/lib/ai-provider";

export type ConnectionTestResult = {
  provider: string;
  model: string;
  success: boolean;
  responseTimeMs: number;
  error?: string;
};

export async function testAIConnectionAction(): Promise<ConnectionTestResult> {
  const config = getAIProviderConfig();
  const start = performance.now();

  try {
    const completion = await config.client.chat.completions.create({
      model: config.model,
      messages: [{ role: "user", content: "Respond with exactly: ok" }],
      max_tokens: 10,
      stream: false,
    });

    const elapsed = Math.round(performance.now() - start);
    const content = completion.choices?.[0]?.message?.content ?? "";

    return {
      provider: config.provider,
      model: config.model,
      success: content.toLowerCase().includes("ok"),
      responseTimeMs: elapsed,
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    return {
      provider: config.provider,
      model: config.model,
      success: false,
      responseTimeMs: elapsed,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateProfileAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;

  const user = await getActionUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    redirect("/settings");
  }

  await getDb()
    .update(users)
    .set({
      name,
      email,
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  revalidatePath("/settings");
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const user = await getActionUser();

  await updateNotificationPreferences(user.id, {
    emailNotifications: formData.get("emailNotifications") === "on",
    pushNotifications: formData.get("pushNotifications") === "on",
    dailyDigest: formData.get("dailyDigest") === "on",
    notifyOnMemorySuggestions: formData.get("notifyOnMemorySuggestions") === "on",
    notifyOnTaskReminders: formData.get("notifyOnTaskReminders") === "on",
    notifyOnProjectUpdates: formData.get("notifyOnProjectUpdates") === "on"
  });

  revalidatePath("/settings");
}
