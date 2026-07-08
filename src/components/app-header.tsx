import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { NotificationBadge } from "@/components/notification-badge";

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Open navigation"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-all duration-150 hover:bg-stone-100 active:scale-[0.97] lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu size={19} strokeWidth={2} />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-600">RAFA OS</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          aria-label="Search"
          className="flex size-10 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-all duration-150 hover:bg-stone-100 active:scale-[0.97]"
          href="/search"
        >
          <Search size={18} strokeWidth={2} />
        </Link>
        <NotificationBadge />
        <div className="flex size-10 items-center justify-center rounded-lg bg-stone-900 text-sm font-semibold text-white">
          R
        </div>
      </div>
    </header>
  );
}