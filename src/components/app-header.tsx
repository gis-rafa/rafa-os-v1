import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { NotificationBadge } from "@/components/notification-badge";

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Open navigation"
          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-stone-200 text-stone-700 transition hover:bg-stone-50 lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu size={19} strokeWidth={1.8} />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-600">RAFA OS</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          aria-label="Search"
          className="flex size-10 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition hover:bg-stone-50"
          href="/search"
        >
          <Search size={18} strokeWidth={1.8} />
        </Link>
        <NotificationBadge />
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-950 text-sm font-semibold text-white">
          R
        </div>
      </div>
    </header>
  );
}
