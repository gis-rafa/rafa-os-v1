import { Brain } from "lucide-react";
import { BrainEditor } from "@/components/brain-editor";
import { BrainPageView } from "@/components/brain-page";
import { PageHeader } from "@/components/ui";
import {
  getMasterBrainDocument,
  getMasterBrainSections
} from "@/lib/master-brain";
import { requireCurrentDbUser } from "@/lib/auth-user";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brain | RAFA OS",
  description: "Master Brain document with identity, mission rules, and active context."
};

const brainSections = [
  "Identity",
  "Mission",
  "Decision Rules",
  "Current Focus",
  "Active Context"
];

export const dynamic = "force-dynamic";

export default async function BrainPage({
  searchParams
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const user = await requireCurrentDbUser();

  if (params?.mode === "edit") {
    const document = await getMasterBrainDocument(user.id);

    return <BrainEditor document={document} />;
  }

  const sections = await getMasterBrainSections(user.id, brainSections);

  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader
        icon={<Brain size={22} strokeWidth={2} />}
        title="Brain"
        description="Master Brain document with identity, mission rules, and active context."
      />
      <BrainPageView sections={sections} />
    </section>
  );
}