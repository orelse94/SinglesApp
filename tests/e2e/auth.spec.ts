import { expect, test } from "@playwright/test";
import { loadSeedData, loginAs, resetE2EState } from "./helpers";

test.beforeEach(() => {
  resetE2EState();
});

test("credentials sign-in reaches the authenticated home page", async ({ page }) => {
  const seed = loadSeedData();

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(seed.users.member.email);
  await page.getByPlaceholder("Password").fill(seed.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: `Welcome back, ${seed.users.member.displayName}` })).toBeVisible();
});

test("protected routes redirect anonymous visitors to sign in", async ({ page }) => {
  await page.goto("/home");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
