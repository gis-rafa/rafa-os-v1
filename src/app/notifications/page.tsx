import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  deleteNotification as deleteNotificationAction,
  getNotifications as getNotificationsAction,
  markAllNotificationsRead as markAllNotificationsReadAction,
  markNotificationRead as markNotificationReadAction
} from "@/app/notifications/actions";
import type { Metadata } from "next";
import { PaginationControls } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Notifications | RAFA OS",
  description: "System alerts, reminders, and updates."
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NotificationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 50;
  const offset = (page - 1) * limit;
  const { items: notifications, total } = await getNotificationsAction(limit, offset);

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-stone-500">
            Notifications
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
            Notifications
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            System alerts, reminders, and AI-generated notifications.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white">
          <Bell size={22} strokeWidth={2} />
        </div>
      </div>

      {notifications.length > 0 ? (
        <form action={markAllNotificationsReadAction} className="mb-4">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 text-sm font-medium text-stone-600 hover:bg-stone-100 active:scale-[0.97]"
            type="submit"
          >
            <CheckCheck size={16} strokeWidth={2} />
            Mark all as read
          </button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-stone-700">
              No notifications yet.
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Notifications will appear here when there are updates.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <article
              className={`rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 ${
                notification.read === 0
                  ? "border-stone-950"
                  : "border-stone-200/80"
              }`}
              key={notification.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <NotificationTypeBadge type={notification.type} />
                    {notification.read === 0 ? (
                      <span className="size-2 rounded-full bg-stone-950" />
                    ) : null}
                    <span className="text-xs text-stone-600">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-stone-950">
                    {notification.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {notification.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {notification.read === 0 ? (
                    <form action={markNotificationReadAction}>
                      <input name="id" type="hidden" value={notification.id} />
                      <button
                        aria-label="Mark as read"
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 active:scale-[0.97]"
                        type="submit"
                      >
                        <CheckCheck size={16} strokeWidth={2} />
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteNotificationAction}>
                    <input name="id" type="hidden" value={notification.id} />
                    <button
                      aria-label="Delete notification"
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 text-red-500 hover:bg-red-50 active:scale-[0.97]"
                      type="submit"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <PaginationControls
        basePath="/notifications"
        page={page}
        searchParams={{}}
        total={total}
        limit={50}
      />
    </section>
  );
}

function NotificationTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    info: "bg-stone-100 text-stone-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-800",
    error: "bg-red-50 text-red-700"
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-semibold ${styles[type] ?? styles.info}`}
    >
      {type}
    </span>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
