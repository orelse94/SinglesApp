import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { markAllNotificationsReadAction, markNotificationReadAction } from "../actions";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

function payloadField(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }

  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function notificationCopy(type: NotificationType, payload: unknown) {
  switch (type) {
    case NotificationType.CHAT_REQUEST_INCOMING:
      return {
        title: "New chat request",
        body: `${payloadField(payload, "fromDisplayName") ?? "A member"} wants to start a conversation with you.`,
        href: "/chats",
      };
    case NotificationType.CHAT_REQUEST_ACCEPTED:
      return {
        title: "Chat request accepted",
        body: `${payloadField(payload, "byDisplayName") ?? "A member"} accepted your chat request.`,
        href: "/chats",
      };
    case NotificationType.PHOTO_ACCESS_REQUEST_INCOMING:
      return {
        title: "New photo access request",
        body: `${payloadField(payload, "requesterDisplayName") ?? "A member"} asked to see your approved gallery.`,
        href: "/me",
      };
    case NotificationType.PHOTO_ACCESS_APPROVED:
      return {
        title: "Photo access approved",
        body: `${payloadField(payload, "ownerDisplayName") ?? "A member"} approved your gallery request.`,
        href: payloadField(payload, "ownerUserId") ? `/users/${payloadField(payload, "ownerUserId")}` : "/me",
      };
    case NotificationType.GROUP_JOIN_APPROVED:
      return {
        title: "Group request approved",
        body: `You can now access ${payloadField(payload, "groupName") ?? "your group"}.`,
        href: payloadField(payload, "groupId") ? `/groups/${payloadField(payload, "groupId")}` : "/groups",
      };
    case NotificationType.COMMENT_RECEIVED:
      return {
        title: "New comment on your post",
        body: `${payloadField(payload, "actorDisplayName") ?? "A member"} commented: ${payloadField(payload, "contentPreview") ?? "Open the post to read it."}`,
        href: payloadField(payload, "groupId") ? `/groups/${payloadField(payload, "groupId")}` : "/home",
      };
    default:
      return {
        title: "Notification",
        body: "There is an update waiting for you.",
        href: "/home",
      };
  }
}

export default async function NotificationsPage() {
  const viewer = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: viewer.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      payloadJson: true,
      isRead: true,
      createdAt: true,
    },
  });

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Milestone 3</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Notifications</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Track request activity, approvals, and comment alerts in one inbox.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border px-3 py-1.5">Unread: {unreadCount}</span>
            <form action={markAllNotificationsReadAction}>
              <button className="rounded-full border px-3 py-1.5 font-medium" type="submit">
                Mark all read
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((notification) => {
              const copy = notificationCopy(notification.type, notification.payloadJson);
              return (
                <div key={notification.id} className={`rounded-3xl border p-4 text-sm shadow-sm ${notification.isRead ? "bg-card" : "bg-muted/30"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{copy.title}</p>
                        {!notification.isRead ? (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">Unread</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-muted-foreground">{copy.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link className="rounded-full border px-3 py-1.5 text-xs font-medium" href={copy.href}>
                        Open
                      </Link>
                      {!notification.isRead ? (
                        <form action={markNotificationReadAction}>
                          <input name="notificationId" type="hidden" value={notification.id} />
                          <button className="rounded-full border px-3 py-1.5 text-xs font-medium" type="submit">
                            Mark read
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
