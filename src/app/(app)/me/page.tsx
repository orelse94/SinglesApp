import Link from "next/link";
import {
  ActivityVisibility,
  ChatRequestPolicy,
  MediaType,
  MembershipStatus,
  PhotoRequestPolicy,
  ProfileVisibility,
  ThemePreference,
  VerificationStatus,
} from "@prisma/client";
import {
  addProfileMediaAction,
  deleteProfileMediaAction,
  reviewPhotoAccessRequestAction,
  submitVerificationRequestAction,
  updatePrivacyAction,
  updateProfileAction,
} from "../actions";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

const saveMessages: Record<string, string> = {
  media: "Media updated.",
  photoReview: "Photo access request reviewed.",
  "photo-review": "Photo access request reviewed.",
  privacy: "Privacy and theme preferences saved.",
  profile: "Profile saved.",
  verification: "Verification request submitted.",
};

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

function mediaLabel(mediaType: MediaType) {
  return mediaType === MediaType.PROFILE ? "Profile" : "Gallery";
}

function verificationCopy(status: VerificationStatus) {
  if (status === VerificationStatus.APPROVED) {
    return "Your profile is approved. Your verified badge will appear wherever you choose to show it.";
  }
  if (status === VerificationStatus.PENDING) {
    return "Your verification request is pending review. No extra action is needed right now.";
  }
  if (status === VerificationStatus.REJECTED) {
    return "Your last verification request was rejected. You can submit a new request when you are ready.";
  }
  return "You have not submitted a verification request yet.";
}

export default async function MePage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const viewer = await requireUser();
  const resolvedSearchParams = await searchParams;

  const [user, interests, memberships, pendingPhotoRequests, activePhotoGrants] = await Promise.all([
    prisma.user.findUnique({
      where: { id: viewer.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        bio: true,
        region: true,
        ageVerified: true,
        emailVerified: true,
        phoneVerifiedAt: true,
        verificationStatus: true,
        verifiedBadgeVisible: true,
        profileVisibility: true,
        chatRequestPolicy: true,
        photoRequestPolicy: true,
        activityVisibility: true,
        settings: { select: { themePreference: true } },
        interests: { select: { interestId: true } },
        media: {
          where: { isActive: true },
          orderBy: [{ mediaType: "asc" }, { sortOrder: "asc" }],
          select: {
            id: true,
            mediaType: true,
            storageKey: true,
            visibilityLevel: true,
          },
        },
      },
    }),
    prisma.interest.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.groupMembership.findMany({
      where: { userId: viewer.id, status: MembershipStatus.ACTIVE },
      select: { group: { select: { id: true, name: true } } },
      take: 5,
    }),
    prisma.photoAccessRequest.findMany({
      where: { ownerUserId: viewer.id, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        requester: {
          select: {
            id: true,
            displayName: true,
            verificationStatus: true,
          },
        },
      },
    }),
    prisma.photoAccessGrant.findMany({
      where: { ownerUserId: viewer.id, revokedAt: null },
      orderBy: { grantedAt: "desc" },
      select: {
        id: true,
        grantedAt: true,
        grantee: { select: { id: true, displayName: true } },
      },
      take: 6,
    }),
  ]);

  if (!user) {
    return null;
  }

  const selectedInterestIds = new Set(user.interests.map((interest) => interest.interestId));
  const profileMedia = user.media.filter((item) => item.mediaType === MediaType.PROFILE);
  const galleryMedia = user.media.filter((item) => item.mediaType === MediaType.GALLERY);
  const savedMessage = resolvedSearchParams?.saved ? saveMessages[resolvedSearchParams.saved] : null;
  const totalMediaCount = profileMedia.length + galleryMedia.length;

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
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Profile workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{user.displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Update the details other members rely on before they join your groups, request your private gallery, or move into a direct conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border px-3 py-1.5">Theme: {user.settings?.themePreference ?? ThemePreference.LIGHT}</span>
            <span className="rounded-full border px-3 py-1.5">Groups: {memberships.length}</span>
            <span className="rounded-full border px-3 py-1.5">Media items: {totalMediaCount}</span>
            <span className="rounded-full border px-3 py-1.5">Verification: {user.verificationStatus}</span>
            <Link className="rounded-full border px-3 py-1.5" href={`/users/${user.id}`}>
              Public profile view
            </Link>
          </div>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <section className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="border-b pb-4">
            <p className="text-sm text-muted-foreground">Profile details</p>
            <h2 className="mt-1 text-xl font-semibold">How you appear to the community</h2>
          </div>
          <form action={updateProfileAction} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span>Display name</span>
              <input className="rounded-2xl border bg-background px-4 py-3" defaultValue={user.displayName} name="displayName" required />
            </label>
            <label className="grid gap-2 text-sm">
              <span>Short bio</span>
              <textarea
                className="min-h-32 rounded-2xl border bg-background px-4 py-3"
                defaultValue={user.bio ?? ""}
                maxLength={3000}
                name="bio"
              />
              <span className="text-xs text-muted-foreground">Up to 3000 characters.</span>
            </label>
            <label className="grid gap-2 text-sm">
              <span>Region</span>
              <input className="rounded-2xl border bg-background px-4 py-3" defaultValue={user.region ?? ""} maxLength={100} name="region" />
              <span className="text-xs text-muted-foreground">Up to 100 characters.</span>
            </label>
            <fieldset className="grid gap-3 text-sm">
              <legend className="font-medium">Interests</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {interests.map((interest) => (
                  <label key={interest.id} className="flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors hover:bg-muted/40">
                    <input defaultChecked={selectedInterestIds.has(interest.id)} name="interestIds" type="checkbox" value={interest.id} />
                    <span>{interest.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end">
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
                Save profile
              </button>
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Verification</p>
              <h2 className="mt-1 text-xl font-semibold">Current verification state</h2>
            </div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                <p className="mt-2 font-medium">{user.emailVerified ? "Verified" : "Not verified"}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</p>
                <p className="mt-2 font-medium">{user.phoneVerifiedAt ? "Verified" : "Not verified"}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">18+</p>
                <p className="mt-2 font-medium">{user.ageVerified ? "Verified" : "Not verified"}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border bg-muted/30 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Status: {user.verificationStatus}</p>
                  <p className="mt-1 text-muted-foreground">{verificationCopy(user.verificationStatus)}</p>
                </div>
                {user.verificationStatus === VerificationStatus.APPROVED ? null : (
                  <form action={submitVerificationRequestAction}>
                    <button className="rounded-full border px-4 py-2 text-sm font-medium" type="submit">
                      {user.verificationStatus === VerificationStatus.PENDING ? "Refresh status" : "Request verification"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Privacy and settings</p>
              <h2 className="mt-1 text-xl font-semibold">Control your visibility</h2>
            </div>
            <form action={updatePrivacyAction} className="mt-5 grid gap-4 text-sm">
              <label className="grid gap-2">
                <span>Who can view my profile</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue={user.profileVisibility} name="profileVisibility">
                  {Object.values(ProfileVisibility).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span>Who can send chat requests</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue={user.chatRequestPolicy} name="chatRequestPolicy">
                  {Object.values(ChatRequestPolicy).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span>Photo request policy</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue={user.photoRequestPolicy} name="photoRequestPolicy">
                  {Object.values(PhotoRequestPolicy).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span>Activity visibility</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue={user.activityVisibility} name="activityVisibility">
                  {Object.values(ActivityVisibility).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span>Theme preference</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue={user.settings?.themePreference ?? ThemePreference.LIGHT} name="themePreference">
                  {Object.values(ThemePreference).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-2xl border px-4 py-3">
                <input defaultChecked={user.verifiedBadgeVisible} name="verifiedBadgeVisible" type="checkbox" />
                <span>Show my verified badge when approved</span>
              </label>
              <div className="flex justify-end">
                <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">
                  Save privacy
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">At a glance</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Verification</p>
                <p className="mt-2 font-medium">{user.verificationStatus}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Theme</p>
                <p className="mt-2 font-medium">{user.settings?.themePreference ?? ThemePreference.LIGHT}</p>
              </div>
            </div>
            {memberships.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent groups</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {memberships.map((membership) => (
                    <Link key={membership.group.id} className="rounded-full border px-3 py-1.5 text-xs" href={`/groups/${membership.group.id}`}>
                      {membership.group.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Media management</p>
            <h2 className="mt-1 text-xl font-semibold">Profile photo and gallery</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Add storage keys or hosted URLs now. Upload integrations can plug into the same records later.
            </p>
          </div>
          <div className="grid min-w-[180px] gap-2 text-xs text-muted-foreground sm:text-right">
            <span>Profile items: {profileMedia.length}</span>
            <span>Gallery items: {galleryMedia.length}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <form action={addProfileMediaAction} className="rounded-3xl border bg-muted/30 p-4">
            <div className="grid gap-3 text-sm">
              <div>
                <p className="font-medium">Add a media record</p>
                <p className="mt-1 text-xs text-muted-foreground">Use a URL or storage key and decide who can see it.</p>
              </div>
              <label className="grid gap-2">
                <span>Media URL or storage key</span>
                <input className="rounded-2xl border bg-background px-4 py-3" name="storageKey" placeholder="https://... or object key" required />
              </label>
              <label className="grid gap-2">
                <span>Type</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue={MediaType.GALLERY} name="mediaType">
                  <option value={MediaType.PROFILE}>Profile</option>
                  <option value={MediaType.GALLERY}>Gallery</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span>Visibility</span>
                <select className="rounded-2xl border bg-background px-4 py-3" defaultValue="PUBLIC" name="visibilityLevel">
                  <option value="PUBLIC">Public to members</option>
                  <option value="APPROVED">Approved viewers only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </label>
              <button className="rounded-full border px-4 py-3 text-sm font-medium" type="submit">
                Add media
              </button>
            </div>
          </form>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Profile media</h3>
              {profileMedia.length === 0 ? (
                <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">No profile media yet.</p>
              ) : (
                profileMedia.map((item) => (
                  <div key={item.id} className="rounded-3xl border p-4 text-sm shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{mediaLabel(item.mediaType)}</p>
                        <p className="mt-2 break-all font-medium">{item.storageKey}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {item.visibilityLevel}
                      </span>
                    </div>
                    <form action={deleteProfileMediaAction} className="mt-4">
                      <input name="mediaId" type="hidden" value={item.id} />
                      <button className="rounded-full border px-3 py-1.5 text-xs" type="submit">
                        Remove
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Gallery media</h3>
              {galleryMedia.length === 0 ? (
                <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">No gallery media yet.</p>
              ) : (
                galleryMedia.map((item) => (
                  <div key={item.id} className="rounded-3xl border p-4 text-sm shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{mediaLabel(item.mediaType)}</p>
                        <p className="mt-2 break-all font-medium">{item.storageKey}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {item.visibilityLevel}
                      </span>
                    </div>
                    <form action={deleteProfileMediaAction} className="mt-4">
                      <input name="mediaId" type="hidden" value={item.id} />
                      <button className="rounded-full border px-3 py-1.5 text-xs" type="submit">
                        Remove
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="border-b pb-4">
            <p className="text-sm text-muted-foreground">Photo access</p>
            <h2 className="mt-1 text-xl font-semibold">Incoming private gallery requests</h2>
          </div>
          <div className="mt-5 space-y-3">
            {pendingPhotoRequests.length === 0 ? (
              <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">No pending photo access requests right now.</p>
            ) : (
              pendingPhotoRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border p-4 text-sm shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link className="font-medium underline" href={`/users/${request.requester.id}`}>
                        {request.requester.displayName}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">Requested on {formatDateTime(request.createdAt)}</p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {request.requester.verificationStatus}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <form action={reviewPhotoAccessRequestAction}>
                      <input name="requestId" type="hidden" value={request.id} />
                      <input name="decision" type="hidden" value="approve" />
                      <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={reviewPhotoAccessRequestAction}>
                      <input name="requestId" type="hidden" value={request.id} />
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

        <section className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="border-b pb-4">
            <p className="text-sm text-muted-foreground">Approved viewers</p>
            <h2 className="mt-1 text-xl font-semibold">Members with current gallery access</h2>
          </div>
          <div className="mt-5 space-y-3">
            {activePhotoGrants.length === 0 ? (
              <p className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">No approved viewers yet.</p>
            ) : (
              activePhotoGrants.map((grant) => (
                <div key={grant.id} className="rounded-3xl border p-4 text-sm shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <Link className="font-medium underline" href={`/users/${grant.grantee.id}`}>
                      {grant.grantee.displayName}
                    </Link>
                    <span className="text-xs text-muted-foreground">Granted {formatDateTime(grant.grantedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
