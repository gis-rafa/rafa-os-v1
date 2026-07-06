import { getLocalDevelopmentUser } from "@/lib/local-dev-user";

export async function getActionUser() {
  return getLocalDevelopmentUser();
}

export async function requireCurrentDbUser() {
  return getLocalDevelopmentUser();
}
