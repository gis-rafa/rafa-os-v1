"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveMasterBrainDocument } from "@/lib/master-brain";
import { getActionUser } from "@/lib/auth-user";
import { createNotification } from "@/app/notifications/actions";

export async function saveMasterBrainAction(formData: FormData) {
  const user = await getActionUser();
  const documentTitle = String(formData.get("documentTitle") ?? "MASTER BRAIN");
  const titles = formData.getAll("sectionTitle").map(String);
  const contents = formData.getAll("sectionContent").map(String);

  await saveMasterBrainDocument(user.id, {
    title: documentTitle,
    sections: titles.map((title, index) => ({
      title,
      content: contents[index] ?? "TODO"
    }))
  });

  await createNotification(user.id, {
    type: "success",
    title: "Master Brain Updated",
    message: `"${documentTitle}" has been saved.`
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/brain");
  redirect("/brain");
}

