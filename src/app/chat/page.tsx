import { ChatInterface } from "@/components/chat-interface";
import { getActiveContextFields } from "@/lib/master-brain";
import { generateMorningBrief } from "@/lib/morning-brief";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const activeContext = await getActiveContextFields();
  const morningBrief = await generateMorningBrief(activeContext);

  return <ChatInterface morningBrief={morningBrief} />;
}
