import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const seedDataPath = path.join(process.cwd(), "tests", "e2e", ".seed-data.json");

export type SeedData = {
  password: string;
  users: {
    admin: { id: string; email: string; displayName: string };
    owner: { id: string; email: string; displayName: string };
    member: { id: string; email: string; displayName: string };
    verified: { id: string; email: string; displayName: string };
    blockedRequester: { id: string; email: string; displayName: string };
    blockedTarget: { id: string; email: string; displayName: string };
    verificationApproveUser: { id: string; email: string; displayName: string };
    verificationRejectUser: { id: string; email: string; displayName: string };
  };
  groups: {
    closedGroup: { id: string; name: string };
  };
  posts: {
    reportedPost: { id: string; contentText: string };
  };
  reports: {
    postReport: { id: string };
  };
};

function runSeed() {
  execSync("npm run test:e2e:seed", {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: "powershell.exe",
    env: {
      ...process.env,
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL,
    },
  });
}

export function ensureE2ESeed() {
  if (!existsSync(seedDataPath)) {
    runSeed();
    return;
  }

  try {
    const current = JSON.parse(readFileSync(seedDataPath, "utf8")) as Partial<SeedData>;
    const hasCoreUsers = Boolean(
      current.users?.admin?.email &&
        current.users?.owner?.email &&
        current.users?.member?.email &&
        current.users?.verified?.email,
    );
    const hasClosedGroup = Boolean(current.groups?.closedGroup?.id);
    const hasReport = Boolean(current.reports?.postReport?.id && current.posts?.reportedPost?.id);

    if (!hasCoreUsers || !hasClosedGroup || !hasReport) {
      runSeed();
    }
  } catch {
    runSeed();
  }
}

export function resetE2EState() {
  runSeed();
}

export function loadSeedData(): SeedData {
  ensureE2ESeed();
  return JSON.parse(readFileSync(seedDataPath, "utf8")) as SeedData;
}


