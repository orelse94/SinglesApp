import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const seedDataPath = path.join(process.cwd(), "tests", "e2e", ".seed-data.json");

export type SeedData = {
  password: string;
  users: {
    owner: { id: string; email: string; displayName: string };
    member: { id: string; email: string; displayName: string };
    verified: { id: string; email: string; displayName: string };
    blockedRequester: { id: string; email: string; displayName: string };
    blockedTarget: { id: string; email: string; displayName: string };
  };
  groups: {
    closedGroup: { id: string; name: string };
  };
};

function runSeed() {
  execSync("npm run test:e2e:seed", {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
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
    const hasCoreUsers = Boolean(current.users?.owner?.email && current.users?.member?.email && current.users?.verified?.email);
    const hasClosedGroup = Boolean(current.groups?.closedGroup?.id);

    if (!hasCoreUsers || !hasClosedGroup) {
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
