"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveMasterBrainDocument } from "@/lib/master-brain";
import { getActionUser } from "@/lib/auth-user";
import { truncateInput } from "@/lib/dashboard-utils";
import { createNotification } from "@/app/notifications/actions";

export async function saveMasterBrainAction(formData: FormData) {
  const user = await getActionUser();
  const documentTitle = String(formData.get("documentTitle") ?? "MASTER BRAIN");
  const titles = formData.getAll("sectionTitle").map((s) => truncateInput(String(s), 200));
  const contents = formData.getAll("sectionContent").map((s) => truncateInput(String(s), 50000));

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

