import Link from "next/link";
import { VerificationStatus } from "@prisma/client";
import { reviewChatRequestAction } from "../actions";
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

export default async function ChatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const viewer = await requireUser();
  const resolvedSearchParams = await searchParams;

  const [conversations, incomingRequests, outgoingRequests] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        OR: [{ userOneId: viewer.id }, { userTwoId: viewer.id }],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        updatedAt: true,
        userOneId: true,
        userTwo: {
          select: {
            id: true,
            displayName: true,
            verificationStatus: true,
            verifiedBadgeVisible: true,
          },
        },
        userOne: {
          select: {
            id: true,
            displayName: true,
            verificationStatus: true,
            verifiedBadgeVisible: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            body: true,
            createdAt: true,
            senderUserId: true,
          },
        },
      },
    }),
    prisma.chatRequest.findMany({
      where: { toUserId: viewer.id, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        fromUser: {
          select: {
            id: true,
            displayName: true,
            verificationStatus: true,
            verifiedBadgeVisible: true,
          },
        },
      },
    }),
    prisma.chatRequest.findMany({
      where: { fromUserId: viewer.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        toUser: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    }),
  ]);

  const savedMessage = resolvedSearchParams?.saved === "incoming-chat" ? "You already have an incoming request from this member." : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      {savedMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {savedMessage}
        </div>
      ) : null}

      <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Milestone 3</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Chats and requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review incoming requests, track outgoing ones, and continue active conversations from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-3 py-1.5">Conversations: {conversations.length}</span>
            <span className="rounded-full border px-3 py-1.5">Incoming requests: {incomingRequests.length}</span>
            <span className="rounded-full border px-3 py-1.5">Outgoing requests: {outgoingRequests.length}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="border-b pb-4">
            <p className="text-sm text-muted-foreground">Conversations</p>
            <h2 className="mt-1 text-xl font-semibold">Active chats</h2>
          </div>
          <div className="mt-5 space-y-3">
            {conversations.length === 0 ? (
              <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">
                No conversations yet. Send a chat request from a member profile to start one.
              </p>
            ) : (
              conversations.map((conversation) => {
                const otherUser = conversation.userOne.id === viewer.id ? conversation.userTwo : conversation.userOne;
                const lastMessage = conversation.messages[0];

                return (
                  <Link key={conversation.id} className="block rounded-3xl border p-4 transition-colors hover:bg-muted/30" href={`/chats/${conversation.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{otherUser.displayName}</p>
                          {otherUser.verificationStatus === VerificationStatus.APPROVED && otherUser.verifiedBadgeVisible ? (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">Verified</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {lastMessage ? formatDateTime(lastMessage.createdAt) : formatDateTime(conversation.updatedAt)}
                        </p>
                      </div>
                      <span className="rounded-full border px-3 py-1 text-[11px] font-medium">Open chat</span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {lastMessage ? lastMessage.body : "No messages yet. Open the conversation to say hello."}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Incoming</p>
              <h2 className="mt-1 text-xl font-semibold">Chat requests to review</h2>
            </div>
            <div className="mt-5 space-y-3">
              {incomingRequests.length === 0 ? (
                <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">No pending chat requests.</p>
              ) : (
                incomingRequests.map((request) => (
                  <div key={request.id} className="rounded-3xl border p-4 text-sm shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link className="font-medium underline" href={`/users/${request.fromUser.id}`}>
                          {request.fromUser.displayName}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">Requested on {formatDateTime(request.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {request.fromUser.verificationStatus}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link className="rounded-full border px-3 py-1.5 text-xs font-medium" href={`/users/${request.fromUser.id}`}>
                        View profile
                      </Link>
                      <form action={reviewChatRequestAction}>
                        <input name="chatRequestId" type="hidden" value={request.id} />
                        <input name="decision" type="hidden" value="accept" />
                        <input name="redirectToConversation" type="hidden" value="true" />
                        <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" type="submit">
                          Accept and open chat
                        </button>
                      </form>
                      <form action={reviewChatRequestAction}>
                        <input name="chatRequestId" type="hidden" value={request.id} />
                        <input name="decision" type="hidden" value="reject" />
                        <button className="rounded-full border px-3 py-1.5 text-xs font-medium" type="submit">
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Outgoing</p>
              <h2 className="mt-1 text-xl font-semibold">Requests you already sent</h2>
            </div>
            <div className="mt-5 space-y-3">
              {outgoingRequests.length === 0 ? (
                <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">No outgoing chat requests.</p>
              ) : (
                outgoingRequests.map((request) => (
                  <div key={request.id} className="rounded-3xl border p-4 text-sm shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <Link className="font-medium underline" href={`/users/${request.toUser.id}`}>
                        {request.toUser.displayName}
                      </Link>
                      <span className="text-xs text-muted-foreground">Sent {formatDateTime(request.createdAt)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link className="rounded-full border px-3 py-1.5 text-xs font-medium" href={`/users/${request.toUser.id}`}>
                        Open profile
                      </Link>
                      <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        Waiting for response
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

