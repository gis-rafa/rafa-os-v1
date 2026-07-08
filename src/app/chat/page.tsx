import { ChatInterface } from "@/components/chat-interface";
import { getActiveContextFields } from "@/lib/master-brain";
import { generateMorningBrief } from "@/lib/morning-brief";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { getRequestTimezone } from "@/lib/request-timezone";
import { TimezoneProvider } from "@/components/timezone-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat | RAFA OS",
  description: "Talk to your AI assistant."
};

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const timezone = await getRequestTimezone();
  const user = await requireCurrentDbUser();
  const activeContext = await getActiveContextFields(user.id);
  const morningBrief = await generateMorningBrief(activeContext, user.id, timezone);

  return (
    <>
      <TimezoneProvider />
      <ChatInterface morningBrief={morningBrief} />
    </>
  );
}
