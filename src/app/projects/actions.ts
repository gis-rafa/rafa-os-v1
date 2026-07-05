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

export async function createProjectAction(formData: FormData) {
  const user = await getActionUser();

  await createProject(user.id, parseProjectForm(formData));

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}

export async function updateProjectAction(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/projects");
  }

  await updateProject({
    id,
    userId: user.id,
    values: parseProjectForm(formData)
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

  if (!name) {
    throw new Error("Project name is required.");
  }

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

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(value), 0), 100);
}
