import Link from "next/link";
import { GroupRole, GroupType, MembershipStatus, PlacementType, PostContextType, PostVisibilityStatus } from "@prisma/client";
import { createCommentAction, createPostAction, joinGroupAction, removeGroupMemberAction, reviewGroupJoinRequestAction, updateGroupAction } from "../../actions";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { getPromotedPlacement } from "@/lib/promotions";
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

export default async function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const viewer = await requireUser();
  const { groupId } = await params;

  const [group, promotedPlacement] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        description: true,
        groupType: true,
        isSmallPrivateGroup: true,
        status: true,
        createdByUserId: true,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          orderBy: { joinedAt: "asc" },
          select: {
            userId: true,
            role: true,
            user: { select: { id: true, displayName: true } },
          },
        },
        joinRequests: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            requestMessage: true,
            createdAt: true,
            applicant: { select: { id: true, displayName: true } },
          },
        },
        posts: {
          where: { contextType: PostContextType.GROUP, visibilityStatus: PostVisibilityStatus.VISIBLE },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            contentText: true,
            isAnonymous: true,
            createdAt: true,
            authorUserId: true,
            author: { select: { displayName: true } },
            comments: {
              where: { moderationStatus: { not: "REMOVED" } },
              orderBy: { createdAt: "asc" },
              take: 5,
              select: {
                id: true,
                contentText: true,
                createdAt: true,
                author: { select: { displayName: true } },
              },
            },
          },
        },
      },
    }),
    getPromotedPlacement(PlacementType.GROUP_DETAIL_BANNER, groupId),
  ]);

  if (!group || group.status !== "ACTIVE") {
    notFound();
  }

  const membership = group.memberships.find((item) => item.userId === viewer.id);
  const isOwner = group.createdByUserId === viewer.id;
  const isManager = isOwner || membership?.role === GroupRole.MANAGER || membership?.role === GroupRole.OWNER;
  const isMember = isOwner || Boolean(membership);
  const hasPendingRequest = group.joinRequests.some((request) => request.applicant.id === viewer.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Group space</p>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{group.groupType}</span>
              {group.isSmallPrivateGroup ? (
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Small private</span>
              ) : null}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{group.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{group.description ?? "No group description yet."}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-3 py-1.5">Members: {group.memberships.length}</span>
            <span className="rounded-full border px-3 py-1.5">Pending: {group.joinRequests.length}</span>
            <span className="rounded-full border px-3 py-1.5">Posts: {group.posts.length}</span>
          </div>
        </div>
      </section>

      {promotedPlacement ? (
        <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 shadow-sm" data-testid="group-promoted-event">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-rose-700">Promoted event</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{promotedPlacement.eventPromotion.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-rose-900/80">
                {promotedPlacement.eventPromotion.description ?? "A promoted event is highlighted for this group."}
              </p>
            </div>
            <a className="inline-flex rounded-full border border-rose-400 px-4 py-2 text-sm font-medium text-rose-900" href={promotedPlacement.eventPromotion.externalLink} rel="noreferrer" target="_blank">
              View promoted event
            </a>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Membership</p>
                <h2 className="mt-1 text-xl font-semibold">Your status in this group</h2>
              </div>
              <div>
                {isOwner ? (
                  <span className="rounded-full border px-3 py-1.5 text-xs font-medium">Owner</span>
                ) : isMember ? (
                  <span className="rounded-full border px-3 py-1.5 text-xs font-medium">Member</span>
                ) : hasPendingRequest ? (
                  <span className="rounded-full border px-3 py-1.5 text-xs font-medium">Request pending</span>
                ) : (
                  <form action={joinGroupAction} className="grid gap-2">
                    <input name="groupId" type="hidden" value={group.id} />
                    {group.groupType !== GroupType.OPEN ? (
                      <input className="rounded-2xl border px-3 py-2 text-sm" name="requestMessage" placeholder="Optional request note" />
                    ) : null}
                    <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
                      {group.groupType === GroupType.OPEN ? "Join group" : "Request to join"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {isOwner ? (
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="border-b pb-4">
                <p className="text-sm text-muted-foreground">Owner controls</p>
                <h2 className="mt-1 text-xl font-semibold">Edit group details</h2>
              </div>
              <form action={updateGroupAction} className="mt-5 grid gap-3 text-sm">
                <input name="groupId" type="hidden" value={group.id} />
                <label className="grid gap-2">
                  <span>Group name</span>
                  <input className="rounded-2xl border bg-background px-4 py-3" defaultValue={group.name} name="name" required />
                </label>
                <label className="grid gap-2">
                  <span>Description</span>
                  <textarea className="min-h-24 rounded-2xl border bg-background px-4 py-3" defaultValue={group.description ?? ""} name="description" />
                </label>
                <div className="flex justify-end">
                  <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
                    Save group details
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {isMember ? (
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Post to this group</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Posts inside groups are shown with your name here.
                </p>
              </div>
              <form action={createPostAction} className="mt-5 flex flex-col gap-3">
                <input name="groupId" type="hidden" value={group.id} />
                <textarea className="min-h-28 rounded-2xl border bg-background px-4 py-3 text-sm" name="contentText" placeholder="Share something relevant with this group" required />
                <div className="flex justify-end">
                  <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
                    Publish to group
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          <section className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Group feed</p>
              <h2 className="text-xl font-semibold">Latest posts</h2>
            </div>
            {!isMember ? (
              <div className="rounded-3xl border border-dashed p-8 text-sm text-muted-foreground">
                Join this group to view its internal posts and comments.
              </div>
            ) : group.posts.length === 0 ? (
              <div className="rounded-3xl border border-dashed p-8 text-sm text-muted-foreground">
                No group posts yet.
              </div>
            ) : (
              group.posts.map((post) => {
                const isAnonymousToViewer = post.isAnonymous && post.authorUserId !== viewer.id;
                const isAnonymousAuthorView = post.isAnonymous && post.authorUserId === viewer.id;
                const authorLabel = isAnonymousToViewer ? "Anonymous member" : post.author.displayName;

                return (
                  <article key={post.id} className="rounded-3xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{authorLabel}</p>
                          {isAnonymousAuthorView ? (
                            <span className="text-xs text-muted-foreground">Shown only to you. Anonymous to everyone else.</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{post.contentText}</p>
                    <div className="mt-5 space-y-3 rounded-3xl bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Comments</p>
                      {post.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="rounded-2xl border bg-background px-3 py-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium">{comment.author.displayName}</p>
                              <p className="text-[11px] text-muted-foreground">{formatDateTime(comment.createdAt)}</p>
                            </div>
                            <p className="mt-1 text-muted-foreground">{comment.contentText}</p>
                          </div>
                        ))
                      )}
                      <form action={createCommentAction} className="flex flex-col gap-2">
                        <input name="postId" type="hidden" value={post.id} />
                        <textarea className="min-h-20 rounded-2xl border bg-background px-3 py-2 text-sm" name="contentText" placeholder="Reply to this post" required />
                        <div className="flex justify-end">
                          <button className="rounded-full border px-3 py-1.5 text-sm" type="submit">
                            Add comment
                          </button>
                        </div>
                      </form>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b pb-4">
              <h2 className="text-lg font-semibold">Members</h2>
              <Link className="text-sm underline" href="/groups">
                All groups
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {group.memberships.map((item) => (
                <div key={item.user.id} className="rounded-2xl border px-4 py-3 text-sm transition-colors hover:bg-muted/30">
                  <div className="flex items-center justify-between gap-3">
                    <Link className="font-medium" href={`/users/${item.user.id}`}>
                      {item.user.displayName}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {item.userId === group.createdByUserId ? "OWNER" : item.role}
                      </span>
                      {isOwner && item.userId !== group.createdByUserId ? (
                        <form action={removeGroupMemberAction}>
                          <input name="groupId" type="hidden" value={group.id} />
                          <input name="memberUserId" type="hidden" value={item.userId} />
                          <button className="rounded-full border px-3 py-1 text-[11px] font-medium" type="submit">
                            Remove
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {isManager ? (
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold">Join requests</h2>
                <p className="mt-2 text-sm text-muted-foreground">Approve or reject members who want access to this space.</p>
              </div>
              <div className="mt-4 space-y-3">
                {group.joinRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending join requests.</p>
                ) : (
                  group.joinRequests.map((request) => (
                    <div key={request.id} className="rounded-3xl border p-4 text-sm">
                      <Link className="font-medium underline" href={`/users/${request.applicant.id}`}>
                        {request.applicant.displayName}
                      </Link>
                      <p className="mt-2 text-muted-foreground">{request.requestMessage ?? "No request note."}</p>
                      <div className="mt-4 flex gap-2">
                        <form action={reviewGroupJoinRequestAction}>
                          <input name="joinRequestId" type="hidden" value={request.id} />
                          <input name="decision" type="hidden" value="approve" />
                          <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" type="submit">
                            Approve
                          </button>
                        </form>
                        <form action={reviewGroupJoinRequestAction}>
                          <input name="joinRequestId" type="hidden" value={request.id} />
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
          ) : (
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">Access model</p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Type</p>
                  <p className="mt-1 text-muted-foreground">{group.groupType}</p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Posting rules</p>
                  <p className="mt-1 text-muted-foreground">Posts in groups are attributed to the member who created them.</p>
                </div>
              </div>
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}
