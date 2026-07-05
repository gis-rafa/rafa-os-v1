import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  deleteNotification as deleteNotificationAction,
  getNotifications as getNotificationsAction,
  markAllNotificationsRead as markAllNotificationsReadAction,
  markNotificationRead as markNotificationReadAction
} from "@/app/notifications/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | RAFA OS",
  description: "System alerts, reminders, and updates."
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await getNotificationsAction();

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
            Notifications
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">
            Notifications
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            System alerts, reminders, and AI-generated notifications.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white">
          <Bell size={22} strokeWidth={1.8} />
        </div>
      </div>

      {notifications.length > 0 ? (
        <form action={markAllNotificationsReadAction} className="mb-4">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            type="submit"
          >
            <CheckCheck size={16} strokeWidth={1.8} />
            Mark all as read
          </button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {notifications.length === 0 ? (
          <div className="rounded-md border border-stone-200 bg-white p-8 text-center shadow-sm">
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
              className={`rounded-md border bg-white p-5 shadow-sm ${
                notification.read === 0
                  ? "border-stone-950"
                  : "border-stone-200"
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
                        className="inline-flex size-9 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition hover:bg-stone-50"
                        type="submit"
                      >
                        <CheckCheck size={16} strokeWidth={1.8} />
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteNotificationAction}>
                    <input name="id" type="hidden" value={notification.id} />
                    <button
                      aria-label="Delete notification"
                      className="inline-flex size-9 items-center justify-center rounded-md border border-stone-200 text-red-600 transition hover:bg-red-50"
                      type="submit"
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
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
      className={`rounded-md px-2 py-1 text-xs font-medium ${styles[type] ?? styles.info}`}
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
