"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const { getUnreadNotificationCount } = await import(
          "@/app/notifications/unread-count"
        );
        setCount(await getUnreadNotificationCount());
      } catch {
        // Ignore errors
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      aria-label="Notifications"
      className="relative flex size-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition hover:bg-stone-50"
      href="/notifications"
    >
      <Bell size={18} strokeWidth={1.8} />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-stone-950 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
