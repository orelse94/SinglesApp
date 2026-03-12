import { Fragment } from "react";
import {
  AccountStatus,
  EventPromotionStatus,
  PlacementType,
  UserRole,
} from "@prisma/client";
import {
  createAdminUserAction,
  resolveReportAdminAction,
  reviewVerificationRequestAdminAction,
  savePromotedEventAction,
  updateAdminUserAction,
} from "./actions";
import {
  formatDateTime,
  formatDateTimeInput,
  getActiveGroups,
  getOpenReports,
  getPendingVerificationRequests,
  getPromotedEvents,
  getRecentAuditLogs,
  getUsersByTab,
  moderationOptionsForTarget,
  reportTargetCopy,
} from "./lib";

const adminRoleOptions = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export async function AdminUsersSection({
  tab,
  expandedUserId,
}: {
  tab: "members" | "operators";
  expandedUserId?: string;
}) {
  const users = await getUsersByTab(tab);
  const currentSection = tab === "operators" ? "operators" : "users";

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm" data-testid="admin-users">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-sm text-slate-400">User management</p>
        <h2 className="mt-1 text-xl font-semibold text-white">{tab === "members" ? "Member accounts" : "Admin accounts"}</h2>
        <p className="mt-2 text-sm text-slate-400">
          {tab === "members"
            ? "Browse all regular member accounts and expand a row to manage status, role, and test-user labeling."
            : "Browse operational admin accounts separately and create new admin users with the role you need."}
        </p>
      </div>

      {tab === "operators" ? (
        <form action={createAdminUserAction} className="mt-5 grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/40 p-5 text-sm shadow-sm" data-testid="admin-create-user-form">
          <div>
            <p className="font-medium text-white">Create admin user</p>
            <p className="mt-1 text-slate-400">Operational admin accounts sign directly into the admin shell and do not use the member-facing app.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-slate-300">Display name</span>
              <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" maxLength={80} name="displayName" required />
            </label>
            <label className="grid gap-2">
              <span className="text-slate-300">Email</span>
              <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="email" required type="email" />
            </label>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-slate-300">Temporary password</span>
              <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" minLength={8} name="password" required type="password" />
            </label>
            <label className="grid gap-2">
              <span className="text-slate-300">Role</span>
              <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={UserRole.ADMIN} name="role">
                {adminRoleOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-slate-300">Account status</span>
              <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={AccountStatus.ACTIVE} name="accountStatus">
                {Object.values(AccountStatus).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            <input aria-label="Test user" className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-white" name="isTestUser" type="checkbox" />
            Mark this account as a test user
          </label>
          <div className="flex justify-end">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950" type="submit">
              Create admin user
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/80 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Verification</th>
              <th className="px-4 py-3 font-medium">Test user</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/30">
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={8}>
                  No users in this section yet.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isExpanded = expandedUserId === user.id;
                const toggleHref = isExpanded ? `/admin/${currentSection}` : `/admin/${currentSection}?expanded=${user.id}`;

                return (
                  <Fragment key={user.id}>
                    <tr className="align-top" data-testid={`admin-user-row-${user.id}`}>
                      <td className="px-4 py-4 font-medium text-white">{user.displayName}</td>
                      <td className="px-4 py-4 text-slate-300">{user.email}</td>
                      <td className="px-4 py-4 text-slate-300">{user.role}</td>
                      <td className="px-4 py-4 text-slate-300">{user.accountStatus}</td>
                      <td className="px-4 py-4 text-slate-300">{user.verificationStatus}</td>
                      <td className="px-4 py-4 text-slate-300">{user.isTestUser ? "Yes" : "No"}</td>
                      <td className="px-4 py-4 text-slate-400">{formatDateTime(user.createdAt)}</td>
                      <td className="px-4 py-4 text-right">
                        <a className="inline-flex rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-white" data-testid={`admin-user-toggle-${user.id}`} href={toggleHref}>
                          {isExpanded ? "Hide details" : "View details"}
                        </a>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr data-testid={`admin-user-${user.id}`}>
                        <td className="bg-slate-900/80 px-4 py-4" colSpan={8}>
                          <form action={updateAdminUserAction} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
                            <input name="targetUserId" type="hidden" value={user.id} />
                            <input name="currentSection" type="hidden" value={currentSection} />
                            <label className="grid gap-2">
                              <span className="text-sm text-slate-300">Account status</span>
                              <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={user.accountStatus} name="accountStatus">
                                {Object.values(AccountStatus).map((value) => (
                                  <option key={value} value={value}>{value}</option>
                                ))}
                              </select>
                            </label>
                            <label className="grid gap-2">
                              <span className="text-sm text-slate-300">Role</span>
                              <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={user.role} name="role">
                                {Object.values(UserRole).map((value) => (
                                  <option key={value} value={value}>{value}</option>
                                ))}
                              </select>
                            </label>
                            <label className="grid gap-2">
                              <span className="text-sm text-slate-300">Test user</span>
                              <span className="inline-flex min-h-[54px] items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
                                <input aria-label="Test user" className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-white" defaultChecked={user.isTestUser} name="isTestUser" type="checkbox" />
                                Mark as test user
                              </span>
                            </label>
                            <div className="flex justify-end">
                              <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950" type="submit">
                                Save user
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export async function AdminVerificationsSection() {
  const pendingVerificationRequests = await getPendingVerificationRequests();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm" data-testid="admin-verification">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-sm text-slate-400">Verifications</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Pending review queue</h2>
      </div>
      <div className="mt-5 space-y-3">
        {pendingVerificationRequests.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">No pending verification requests.</p>
        ) : (
          pendingVerificationRequests.map((request) => {
            const hasPrerequisites = Boolean(request.user.emailVerified && request.user.phoneVerifiedAt && request.user.ageVerified);

            return (
              <div key={request.id} className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 text-sm shadow-sm" data-testid={`admin-verification-${request.userId}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{request.user.displayName}</p>
                    <p className="text-slate-400">{request.user.email}</p>
                    <p className="mt-1 text-xs text-slate-500">Submitted {formatDateTime(request.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${hasPrerequisites ? "bg-emerald-950 text-emerald-200" : "bg-amber-950 text-amber-200"}`}>
                    {hasPrerequisites ? "Ready to approve" : "Missing prerequisites"}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                  <span className="rounded-2xl border border-slate-800 px-3 py-2">Email: {request.user.emailVerified ? "Verified" : "Missing"}</span>
                  <span className="rounded-2xl border border-slate-800 px-3 py-2">Phone: {request.user.phoneVerifiedAt ? "Verified" : "Missing"}</span>
                  <span className="rounded-2xl border border-slate-800 px-3 py-2">18+: {request.user.ageVerified ? "Verified" : "Missing"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={reviewVerificationRequestAdminAction}>
                    <input name="requestId" type="hidden" value={request.id} />
                    <input name="decision" type="hidden" value="approve" />
                    <button className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-950 disabled:opacity-50" disabled={!hasPrerequisites} type="submit">
                      Approve verification
                    </button>
                  </form>
                  <form action={reviewVerificationRequestAdminAction}>
                    <input name="requestId" type="hidden" value={request.id} />
                    <input name="decision" type="hidden" value="reject" />
                    <button className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-white" type="submit">
                      Reject verification
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export async function AdminReportsSection() {
  const openReports = await getOpenReports();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm" data-testid="admin-reports">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-sm text-slate-400">Reports and moderation</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Open reports</h2>
      </div>
      <div className="mt-5 space-y-3">
        {openReports.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">No open reports right now.</p>
        ) : (
          openReports.map((report) => {
            const moderationOptions = moderationOptionsForTarget(report.targetType);

            return (
              <form key={report.id} action={resolveReportAdminAction} className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 text-sm shadow-sm" data-testid={`admin-report-${report.id}`}>
                <input name="reportId" type="hidden" value={report.id} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{report.targetType} report</p>
                    <p className="text-slate-400">Filed by {report.filedBy.displayName} ({report.filedBy.email})</p>
                    <p className="mt-1 text-xs text-slate-500">Opened {formatDateTime(report.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-300">{report.reasonCode}</span>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Target preview</p>
                  <p className="mt-2 whitespace-pre-wrap">{reportTargetCopy(report)}</p>
                  {report.details ? <p className="mt-2 text-slate-400">Reporter note: {report.details}</p> : null}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
                  <label className="grid gap-2">
                    <span className="text-slate-300">Moderation action</span>
                    <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={moderationOptions[0]?.value ?? "NONE"} name="moderationAction">
                      <option value="NONE">No direct moderation</option>
                      {moderationOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950" name="decision" type="submit" value="resolve">
                    Resolve report
                  </button>
                  <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-white" name="decision" type="submit" value="reject">
                    Reject report
                  </button>
                </div>
              </form>
            );
          })
        )}
      </div>
    </section>
  );
}

export async function AdminEventsSection() {
  const [promotedEvents, activeGroups] = await Promise.all([getPromotedEvents(), getActiveGroups()]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm" data-testid="admin-events">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-sm text-slate-400">Promoted events</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Create and update placements</h2>
      </div>
      <form action={savePromotedEventAction} className="mt-5 grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/40 p-4 text-sm" data-testid="admin-event-create">
        <div>
          <p className="font-medium text-white">Create promoted event</p>
          <p className="mt-1 text-xs text-slate-400">Each event uses one primary placement in this MVP admin flow.</p>
        </div>
        <label className="grid gap-2">
          <span className="text-slate-300">Title</span>
          <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="title" required />
        </label>
        <label className="grid gap-2">
          <span className="text-slate-300">Description</span>
          <textarea className="min-h-20 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="description" />
        </label>
        <label className="grid gap-2">
          <span className="text-slate-300">External link</span>
          <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="externalLink" placeholder="https://..." required />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-slate-300">Coupon code</span>
            <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="couponCode" />
          </label>
          <label className="grid gap-2">
            <span className="text-slate-300">Image URL</span>
            <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="imageUrl" />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-slate-300">Status</span>
            <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={EventPromotionStatus.DRAFT} name="status">
              {Object.values(EventPromotionStatus).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-slate-300">Placement</span>
            <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={PlacementType.HOME_FEED_CARD} name="placementType">
              {Object.values(PlacementType).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-slate-300">Starts at</span>
            <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="startsAt" type="datetime-local" />
          </label>
          <label className="grid gap-2">
            <span className="text-slate-300">Ends at</span>
            <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" name="endsAt" type="datetime-local" />
          </label>
          <label className="grid gap-2">
            <span className="text-slate-300">Priority</span>
            <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue="0" name="priority" type="number" />
          </label>
        </div>
        <label className="grid gap-2">
          <span className="text-slate-300">Group detail placement target</span>
          <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue="" name="groupId">
            <option value="">No specific group</option>
            {activeGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </label>
        <div className="flex justify-end">
          <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950" type="submit">
            Save event
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {promotedEvents.map((event) => {
          const placement = event.placements[0];
          return (
            <form key={event.id} action={savePromotedEventAction} className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 text-sm shadow-sm" data-testid={`admin-event-${event.id}`}>
              <input name="eventPromotionId" type="hidden" value={event.id} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{event.title}</p>
                  <p className="mt-1 text-slate-400">{placement?.placementType ?? "No placement"}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-300">{event.status}</span>
              </div>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-2">
                  <span className="text-slate-300">Title</span>
                  <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={event.title} name="title" required />
                </label>
                <label className="grid gap-2">
                  <span className="text-slate-300">Description</span>
                  <textarea className="min-h-20 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={event.description ?? ""} name="description" />
                </label>
                <label className="grid gap-2">
                  <span className="text-slate-300">External link</span>
                  <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={event.externalLink} name="externalLink" required />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-slate-300">Status</span>
                    <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={event.status} name="status">
                      {Object.values(EventPromotionStatus).map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-slate-300">Placement</span>
                    <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={placement?.placementType ?? PlacementType.HOME_FEED_CARD} name="placementType">
                      {Object.values(PlacementType).map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-slate-300">Starts at</span>
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={formatDateTimeInput(event.startsAt)} name="startsAt" type="datetime-local" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-slate-300">Ends at</span>
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={formatDateTimeInput(event.endsAt)} name="endsAt" type="datetime-local" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-slate-300">Priority</span>
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={String(placement?.priority ?? 0)} name="priority" type="number" />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-slate-300">Coupon code</span>
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={event.couponCode ?? ""} name="couponCode" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-slate-300">Image URL</span>
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={event.imageUrl ?? ""} name="imageUrl" />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-slate-300">Group detail placement target</span>
                  <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" defaultValue={placement?.groupId ?? ""} name="groupId">
                    <option value="">No specific group</option>
                    {activeGroups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </label>
                <div className="flex justify-between gap-3 text-xs text-slate-500">
                  <span>Starts {formatDateTime(event.startsAt)}</span>
                  <span>Ends {formatDateTime(event.endsAt)}</span>
                </div>
                <div className="flex justify-end">
                  <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-white" type="submit">
                    Update event
                  </button>
                </div>
              </div>
            </form>
          );
        })}
      </div>
    </section>
  );
}

export async function AdminAuditLogsSection() {
  const recentAuditLogs = await getRecentAuditLogs();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm" data-testid="admin-audit-log">
      <div className="border-b border-slate-800 pb-4">
        <p className="text-sm text-slate-400">Audit log</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Recent sensitive admin actions</h2>
      </div>
      <div className="mt-5 space-y-3">
        {recentAuditLogs.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">No audit entries yet.</p>
        ) : (
          recentAuditLogs.map((entry) => (
            <div key={entry.id} className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 text-sm shadow-sm" data-testid={`audit-log-${entry.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{entry.action}</p>
                  <p className="text-slate-400">{entry.targetType} {entry.targetId ? `- ${entry.targetId}` : ""}</p>
                </div>
                <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Actor: {entry.actor?.email ?? "Unknown"}</p>
              {entry.metadataJson ? (
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-900 p-3 text-[11px] text-slate-400">
                  {JSON.stringify(entry.metadataJson, null, 2)}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
