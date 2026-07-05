import { BrainEditor } from "@/components/brain-editor";
import { BrainPageView } from "@/components/brain-page";
import {
  getMasterBrainDocument,
  getMasterBrainSections
} from "@/lib/master-brain";

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
