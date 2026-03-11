import Link from "next/link";
import { GroupType, MembershipStatus } from "@prisma/client";
import { createGroupAction, joinGroupAction } from "../actions";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function GroupsPage() {
  const viewer = await requireUser();

  const groups = await prisma.group.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      groupType: true,
      isSmallPrivateGroup: true,
      createdByUserId: true,
      _count: { select: { memberships: { where: { status: MembershipStatus.ACTIVE } } } },
      memberships: {
        where: { userId: viewer.id },
        select: { status: true, role: true },
      },
      joinRequests: {
        where: { applicantUserId: viewer.id, status: "PENDING" },
        select: { id: true },
      },
    },
  });

  const joinedCount = groups.filter((group) => group.memberships[0]?.status === MembershipStatus.ACTIVE).length;
  const pendingCount = groups.filter((group) => group.joinRequests.length > 0).length;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Groups</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Find your spaces</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Open groups can be joined immediately. Closed and invite-only groups stay intentional through a request flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-3 py-1.5">Joined: {joinedCount}</span>
            <span className="rounded-full border px-3 py-1.5">Pending: {pendingCount}</span>
            <span className="rounded-full border px-3 py-1.5">Available: {groups.length}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Browse and join</p>
            <h2 className="text-xl font-semibold">Current groups</h2>
          </div>
          {groups.map((group) => {
            const membership = group.memberships[0];
            const hasPendingRequest = group.joinRequests.length > 0;
            const isOwner = group.createdByUserId === viewer.id;

            return (
              <article key={group.id} className="rounded-3xl border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link className="text-lg font-semibold underline-offset-4 hover:underline" href={`/groups/${group.id}`}>
                        {group.name}
                      </Link>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {group.groupType}
                      </span>
                      {group.isSmallPrivateGroup ? (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          Small private
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{group.description ?? "No description yet."}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span>{group._count.memberships} active member{group._count.memberships === 1 ? "" : "s"}</span>
                      {isOwner ? <span>You created this group</span> : null}
                    </div>
                  </div>
                  <div className="min-w-[180px]">
                    {isOwner ? (
                      <span className="inline-flex rounded-full border px-3 py-1.5 text-xs font-medium">Owner</span>
                    ) : membership?.status === MembershipStatus.ACTIVE ? (
                      <span className="inline-flex rounded-full border px-3 py-1.5 text-xs font-medium">Joined</span>
                    ) : hasPendingRequest ? (
                      <span className="inline-flex rounded-full border px-3 py-1.5 text-xs font-medium">Request pending</span>
                    ) : (
                      <form action={joinGroupAction} className="grid gap-2">
                        <input name="groupId" type="hidden" value={group.id} />
                        {group.groupType !== GroupType.OPEN ? (
                          <input className="rounded-2xl border px-3 py-2 text-sm" name="requestMessage" placeholder="Optional request note" />
                        ) : null}
                        <button className="rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" type="submit">
                          {group.groupType === GroupType.OPEN ? "Join group" : "Request to join"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Create a group</p>
              <h2 className="mt-1 text-xl font-semibold">Start a niche space</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep it minimal: name it clearly, define the tone, and choose the right access model.
              </p>
            </div>
            <form action={createGroupAction} className="mt-5 grid gap-3 text-sm">
              <label className="grid gap-2">
                <span>Name</span>
                <input className="rounded-2xl border bg-background px-4 py-3" name="name" required />
              </label>
              <label className="grid gap-2">
                <span>Description</span>
                <textarea className="min-h-24 rounded-2xl border bg-background px-4 py-3" name="description" />
              </label>
              <label className="grid gap-2">
                <span>Group type</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue={GroupType.OPEN} name="groupType">
                  {Object.values(GroupType).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-2xl border px-4 py-3">
                <input name="isSmallPrivateGroup" type="checkbox" />
                <span>Small private group</span>
              </label>
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
                Create group
              </button>
            </form>
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Quick guide</p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl border p-4">
                <p className="font-medium">Open</p>
                <p className="mt-1 text-muted-foreground">Anyone can join immediately.</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="font-medium">Closed</p>
                <p className="mt-1 text-muted-foreground">Users request access and wait for approval.</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="font-medium">Invite only</p>
                <p className="mt-1 text-muted-foreground">Use for the most curated spaces.</p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
