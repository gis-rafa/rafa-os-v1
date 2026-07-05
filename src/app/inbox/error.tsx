"use client";

import { RouteError } from "@/components/route-error";

export default function InboxError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} />;
}
