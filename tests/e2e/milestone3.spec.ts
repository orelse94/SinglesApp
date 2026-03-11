import { expect, test } from "@playwright/test";
import { loadSeedData, loginAs, resetE2EState } from "./helpers";

test.beforeEach(() => {
  resetE2EState();
});

test("closed group join request flow lets an owner approve access", async ({ browser }) => {
  const seed = loadSeedData();

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await loginAs(memberPage, seed.users.member.email, seed.password);
  await memberPage.goto(`/groups/${seed.groups.closedGroup.id}`);
  await memberPage.getByPlaceholder("Optional request note").fill("Please let me in.");
  await memberPage.getByRole("button", { name: "Request to join" }).click();
  await expect(memberPage.getByText("Request pending")).toBeVisible();

  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  await loginAs(ownerPage, seed.users.owner.email, seed.password);
  await ownerPage.goto(`/groups/${seed.groups.closedGroup.id}`);
  await expect(ownerPage.getByRole("link", { name: seed.users.member.displayName })).toBeVisible();
  await ownerPage.getByRole("button", { name: "Approve" }).click();
  await expect(ownerPage.getByText("No pending join requests.")).toBeVisible();

  await memberPage.goto(`/groups/${seed.groups.closedGroup.id}`);
  await expect(memberPage.getByText("Member", { exact: true })).toBeVisible();
  await expect(memberPage.getByText("Hidden circle post for members only.")).toBeVisible();

  await ownerContext.close();
  await memberContext.close();
});

test("non-members cannot view closed group content", async ({ page }) => {
  const seed = loadSeedData();

  await loginAs(page, seed.users.member.email, seed.password);
  await page.goto(`/groups/${seed.groups.closedGroup.id}`);

  await expect(page.getByText("Join this group to view its internal posts and comments.")).toBeVisible();
  await expect(page.getByText("Hidden circle post for members only.")).toHaveCount(0);
});

test("non-verified users are blocked from requesting private photo access", async ({ page }) => {
  const seed = loadSeedData();

  await loginAs(page, seed.users.member.email, seed.password);
  await page.goto(`/users/${seed.users.owner.id}`);

  await expect(page.getByText("You must be fully verified before requesting access to approved gallery media.")).toBeVisible();
  await expect(page.getByText("Request unavailable")).toBeVisible();
  await expect(page.getByRole("button", { name: "Request photo access" })).toHaveCount(0);
});

test("verified users can request private photo access", async ({ page }) => {
  const seed = loadSeedData();

  await loginAs(page, seed.users.verified.email, seed.password);
  await page.goto(`/users/${seed.users.owner.id}`);
  await page.getByRole("button", { name: "Request photo access" }).click();

  await expect(page).toHaveURL(new RegExp(`/users/${seed.users.owner.id}\\?saved=photo-request$`));
  await expect(page.getByText("Photo access request sent.")).toBeVisible();
  await expect(page.getByText("Photo request pending")).toBeVisible();
});

test("blocked users cannot send chat or photo requests", async ({ page }) => {
  const seed = loadSeedData();

  await loginAs(page, seed.users.blockedRequester.email, seed.password);
  await page.goto(`/users/${seed.users.blockedTarget.id}`);

  await expect(page.getByText("Chat unavailable")).toBeVisible();
  await expect(page.getByText("Request unavailable")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send chat request" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Request photo access" })).toHaveCount(0);
});

