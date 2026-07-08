import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Database,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  NotebookPen,
  CalendarDays,
  Search,
  Settings
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brain", label: "Brain", icon: Brain },
  { href: "/chat", label: "Talk to Rafa", icon: MessageCircle },
  { href: "/study-plan", label: "Study Plan", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/memory", label: "Memory", icon: Database },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/search", label: "Search", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppSidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-950/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        role="presentation"
        tabIndex={-1}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,300px)] border-r border-stone-800 bg-stone-950 text-white transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link
            className="flex items-center gap-3"
            href="/dashboard"
            onClick={onClose}
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-stone-950">
              R
            </span>
            <span>
              <span className="block text-sm font-semibold">RAFA OS</span>
              <span className="block text-xs text-stone-400">V1 Workspace</span>
            </span>
          </Link>
        </div>
        <nav aria-label="Primary navigation" className="flex flex-col gap-0.5 p-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-stone-300 transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                href={item.href}
                key={item.href}
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}