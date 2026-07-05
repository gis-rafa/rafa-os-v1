import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, Notification } from "@/app/notifications/actions";
import { Button } from "@/components/ui/button";
import { Trash, CheckCircle } from "lucide-react";
// import Link from "next/link"; // Removed as it's not used
// import type { Notification } from "@/app/notifications/actions"; // Moved to direct import

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <section className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <form action={markAllNotificationsRead} className="mb-4">
        <Button type="submit" variant="outline">
          Mark all as read
        </Button>
      </form>
      <ul className="space-y-4">
        {notifications.map((n: Notification) => (
          <li key={n.id} className="border rounded-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{n.title}</h3>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!n.read && (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" variant="ghost" size="icon">
                      <CheckCircle size={16} />
                    </Button>
                  </form>
                )}
                <form action={deleteNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button type="submit" variant="ghost" size="icon">
                    <Trash size={16} />
                  </Button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
