"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveMasterBrainDocument } from "@/lib/master-brain";

export async function saveMasterBrainAction(formData: FormData) {
  const documentTitle = String(formData.get("documentTitle") ?? "MASTER BRAIN");
  const titles = formData.getAll("sectionTitle").map(String);
  const contents = formData.getAll("sectionContent").map(String);

  await saveMasterBrainDocument({
    title: documentTitle,
    sections: titles.map((title, index) => ({
      title,
      content: contents[index] ?? "TODO"
    }))
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/brain");
  redirect("/brain");
}

