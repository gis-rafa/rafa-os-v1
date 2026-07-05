"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveProject,
  createProject,
  deleteProject,
  projectPriorities,
  projectStatuses,
  updateProject,
  type ProjectFormValues,
  type ProjectPriority,
  type ProjectStatus
} from "@/lib/projects";
import { createExecutionTask } from "@/lib/execution-dashboard";
import { getActionUser } from "@/lib/auth-user";
import { clampPercentage } from "@/lib/dashboard-utils";
import { createNotification } from "@/app/notifications/actions";

export async function createProjectAction(formData: FormData) {
  const user = await getActionUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect("/projects");
  }

  await createProject(user.id, parseProjectForm(formData));

  await createNotification(user.id, {
    type: "success",
    title: "Project Created",
    message: `"${formData.get("name")}" has been created.`
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}

export async function updateProjectAction(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!id || !name) {
    redirect("/projects");
  }

  await updateProject({
    id,
    userId: user.id,
    values: parseProjectForm(formData)
  });

  await createNotification(user.id, {
    type: "info",
    title: "Project Updated",
    message: `"${name}" has been updated.`
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}

export async function archiveProjectAction(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/projects");
  }

  await archiveProject(id, user.id);

  await createNotification(user.id, {
    type: "warning",
    title: "Project Archived",
    message: "The project has been archived."
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteProjectAction(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/projects");
  }

  await deleteProject(id, user.id);

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function createTaskAction(formData: FormData) {
  const user = await getActionUser();
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "Medium");
  const estimatedMinutes = Number(formData.get("estimatedMinutes") ?? 30);

  if (!projectId || !title) {
    redirect(`/projects`);
  }

  await createExecutionTask({
    userId: user.id,
    projectId,
    title,
    priority,
    estimatedMinutes: Math.max(5, Math.round(estimatedMinutes))
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

function parseProjectForm(formData: FormData): ProjectFormValues {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = parseStatus(String(formData.get("status") ?? "Active"));
  const priority = parsePriority(String(formData.get("priority") ?? "Medium"));
  const currentPhase = String(formData.get("currentPhase") ?? "").trim();
  const progress = clampPercentage(Number(formData.get("progress") ?? 0));
  const targetDateValue = String(formData.get("targetDate") ?? "").trim();
  const color = String(formData.get("color") ?? "stone").trim() || "stone";
  const icon = String(formData.get("icon") ?? "folder").trim() || "folder";

  return {
    color,
    currentPhase: currentPhase || "Planning",
    description,
    icon,
    name,
    priority,
    progress,
    status,
    targetDate: targetDateValue ? new Date(`${targetDateValue}T00:00:00`) : null
  };
}

function parseStatus(value: string): ProjectStatus {
  return projectStatuses.includes(value as ProjectStatus)
    ? (value as ProjectStatus)
    : "Active";
}

function parsePriority(value: string): ProjectPriority {
  return projectPriorities.includes(value as ProjectPriority)
    ? (value as ProjectPriority)
    : "Medium";
}
