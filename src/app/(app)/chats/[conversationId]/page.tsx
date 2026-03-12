import Link from "next/link";
import { VerificationStatus } from "@prisma/client";
import { sendMessageAction } from "../../actions";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

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

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const viewer = await requireUser();
  const { conversationId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      userOneId: true,
      userTwoId: true,
      userOne: {
        select: {
          id: true,
          displayName: true,
          verificationStatus: true,
          verifiedBadgeVisible: true,
        },
      },
      userTwo: {
        select: {
          id: true,
          displayName: true,
          verificationStatus: true,
          verifiedBadgeVisible: true,
        },
      },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        take: 100,
        select: {
          id: true,
          body: true,
          createdAt: true,
          senderUserId: true,
        },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const isParticipant = conversation.userOneId === viewer.id || conversation.userTwoId === viewer.id;
  if (!isParticipant) {
    notFound();
  }

  const otherUser = conversation.userOne.id === viewer.id ? conversation.userTwo : conversation.userOne;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Conversation</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">{otherUser.displayName}</h1>
              {otherUser.verificationStatus === VerificationStatus.APPROVED && otherUser.verifiedBadgeVisible ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Verified</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue the direct conversation here. Times are shown in 24-hour format.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link className="rounded-full border px-3 py-1.5" href="/chats">
              Back to chats
            </Link>
            <Link className="rounded-full border px-3 py-1.5" href={`/users/${otherUser.id}`}>
              View profile
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          {conversation.messages.length === 0 ? (
            <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">
              No messages yet. Send the first one below.
            </p>
          ) : (
            conversation.messages.map((message) => {
              const isMine = message.senderUserId === viewer.id;
              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${isMine ? "bg-primary text-primary-foreground" : "border bg-muted/40"}`}>
                    <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                    <p className={`mt-2 text-[11px] ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form action={sendMessageAction} className="mt-6 flex flex-col gap-3 border-t pt-5">
          <input name="conversationId" type="hidden" value={conversation.id} />
          <textarea
            className="min-h-24 rounded-2xl border bg-background px-4 py-3 text-sm"
            name="body"
            placeholder={`Write a message to ${otherUser.displayName}`}
            required
          />
          <div className="flex justify-end">
            <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
              Send message
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

