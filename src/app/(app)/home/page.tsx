import Link from "next/link";
import { MembershipStatus, PostContextType } from "@prisma/client";
import { createCommentAction, createPostAction } from "../actions";
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

export default async function HomePage() {
  const viewer = await requireUser();

  const memberships = await prisma.groupMembership.findMany({
    where: { userId: viewer.id, status: MembershipStatus.ACTIVE },
    select: { groupId: true },
  });

  const visibleGroupIds = memberships.map((membership) => membership.groupId);

  const [posts, recommendedGroups] = await Promise.all([
    prisma.post.findMany({
      where: {
        OR: [
          { contextType: PostContextType.GLOBAL_FEED },
          { contextType: PostContextType.GROUP, groupId: { in: visibleGroupIds.length > 0 ? visibleGroupIds : ["__none__"] } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        contentText: true,
        isAnonymous: true,
        createdAt: true,
        groupId: true,
        authorUserId: true,
        author: { select: { id: true, displayName: true } },
        group: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          take: 5,
          select: {
            id: true,
            contentText: true,
            createdAt: true,
            authorUserId: true,
            author: { select: { id: true, displayName: true } },
          },
        },
      },
    }),
    prisma.group.findMany({
      where: {
        status: "ACTIVE",
        memberships: { none: { userId: viewer.id, status: MembershipStatus.ACTIVE } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, description: true, groupType: true },
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Community feed</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {viewer.displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Share a short update, follow the latest community activity, and keep the conversation moving without exposing more than you want.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-3 py-1.5">Visible groups: {visibleGroupIds.length}</span>
            <span className="rounded-full border px-3 py-1.5">Recent posts: {posts.length}</span>
            <Link className="rounded-full border px-3 py-1.5" href="/groups">
              Browse groups
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Create a post</p>
              <h2 className="mt-1 text-xl font-semibold">Share with the community</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Anonymous posting is available only in the global feed.
              </p>
            </div>
            <form action={createPostAction} className="mt-5 flex flex-col gap-3">
              <textarea
                className="min-h-32 rounded-2xl border bg-background px-4 py-3 text-sm outline-none"
                name="contentText"
                placeholder="What would you like to share today?"
                required
              />
              <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
                <input name="isAnonymous" type="checkbox" />
                <span>Post anonymously in the global feed</span>
              </label>
              <div className="flex justify-end">
                <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
                  Publish post
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <h2 className="text-xl font-semibold">Latest activity</h2>
              </div>
            </div>
            {posts.length === 0 ? (
              <div className="rounded-3xl border border-dashed p-8 text-sm text-muted-foreground">
                No posts yet. Create the first one from the composer above.
              </div>
            ) : (
              posts.map((post) => {
                const isAnonymousToViewer = post.isAnonymous && post.authorUserId !== viewer.id;
                const isAnonymousAuthorView = post.isAnonymous && post.authorUserId === viewer.id;
                const authorLabel = isAnonymousToViewer ? "Anonymous member" : post.author.displayName;
                const canOpenAuthorProfile = !isAnonymousToViewer;
                const authorProfileHref = post.authorUserId === viewer.id ? "/me" : `/users/${post.author.id}`;

                return (
                  <article key={post.id} className="rounded-3xl border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {canOpenAuthorProfile ? (
                            <Link className="font-medium underline underline-offset-4" href={authorProfileHref}>
                              {authorLabel}
                            </Link>
                          ) : (
                            <p className="font-medium">{authorLabel}</p>
                          )}
                          {isAnonymousAuthorView ? (
                            <span className="text-xs text-muted-foreground">Shown only to you. Anonymous to everyone else.</span>
                          ) : null}
                          {post.group ? (
                            <Link className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground" href={`/groups/${post.group.id}`}>
                              {post.group.name}
                            </Link>
                          ) : (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Global feed</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(post.createdAt)}</p>
                      </div>
                      {canOpenAuthorProfile ? (
                        <div className="flex flex-wrap gap-2">
                          <Link className="rounded-full border px-3 py-1.5 text-xs font-medium" href={authorProfileHref}>
                            {post.authorUserId === viewer.id ? "Open my profile" : "View profile"}
                          </Link>
                          {post.authorUserId !== viewer.id ? (
                            <Link className="rounded-full border px-3 py-1.5 text-xs font-medium" href={`/users/${post.author.id}`}>
                              Chat
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{post.contentText}</p>

                    <div className="mt-5 space-y-3 rounded-3xl bg-muted/40 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Comments</p>
                      {post.comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                      ) : (
                        post.comments.map((comment) => {
                          const commentAuthorHref = comment.authorUserId === viewer.id ? "/me" : `/users/${comment.author.id}`;

                          return (
                            <div key={comment.id} className="rounded-2xl border bg-background px-3 py-3 text-sm">
                              <div className="flex items-center justify-between gap-3">
                                <Link className="font-medium underline underline-offset-4" href={commentAuthorHref}>
                                  {comment.author.displayName}
                                </Link>
                                <p className="text-[11px] text-muted-foreground">{formatDateTime(comment.createdAt)}</p>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{comment.contentText}</p>
                            </div>
                          );
                        })
                      )}
                      <form action={createCommentAction} className="flex flex-col gap-2">
                        <input name="postId" type="hidden" value={post.id} />
                        <textarea
                          className="min-h-20 rounded-2xl border bg-background px-3 py-2 text-sm outline-none"
                          name="contentText"
                          placeholder="Write a comment"
                          required
                        />
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
          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your spaces</p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Groups</p>
                <p className="mt-2 font-medium">{visibleGroupIds.length} active memberships</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile</p>
                <Link className="mt-2 inline-block font-medium underline" href="/me">
                  Manage profile and privacy
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Groups</p>
                <h2 className="mt-1 text-lg font-semibold">Recommended next</h2>
              </div>
              <Link className="text-sm underline" href="/groups">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recommendedGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have explored all current groups.</p>
              ) : (
                recommendedGroups.map((group) => (
                  <Link key={group.id} className="block rounded-3xl border p-4 transition-colors hover:bg-muted/30" href={`/groups/${group.id}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{group.name}</p>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{group.groupType}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{group.description ?? "No description yet."}</p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}


