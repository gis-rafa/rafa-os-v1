import { BrainEditor } from "@/components/brain-editor";
import { BrainPageView } from "@/components/brain-page";
import {
  getMasterBrainDocument,
  getMasterBrainSections
} from "@/lib/master-brain";
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

  if (params?.mode === "edit") {
    const document = await getMasterBrainDocument();

    return <BrainEditor document={document} />;
  }

  const sections = await getMasterBrainSections(brainSections);

  return <BrainPageView sections={sections} />;
}
