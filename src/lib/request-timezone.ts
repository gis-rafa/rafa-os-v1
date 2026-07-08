import { cookies, headers } from "next/headers";

export async function getRequestTimezone(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get("__tz")?.value;
    if (fromCookie) return fromCookie;
  } catch {
    // cookies() may fail in some contexts
  }

  try {
    const headersList = await headers();
    const fromVercel = headersList.get("x-vercel-ip-timezone");
    if (fromVercel) return fromVercel;
  } catch {
    // headers() may fail in some contexts
  }

  return undefined;
}
