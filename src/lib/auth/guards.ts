import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { LOCAL_SESSION_COOKIE, readLocalSession } from "@/lib/auth/local-session";
import { AccountStatus, ProfileVisibility, UserRole, VerificationStatus } from "@prisma/client";

export function isFullyVerifiedUser(user: {
  emailVerified: Date | null;
  phoneVerifiedAt: Date | null;
  ageVerified: boolean;
  verificationStatus: VerificationStatus;
}) {
  return Boolean(
    user.emailVerified &&
      user.phoneVerifiedAt &&
      user.ageVerified &&
      user.verificationStatus === VerificationStatus.APPROVED,
  );
}

export function hasMinimalProfileVisibility(targetProfileVisibility: ProfileVisibility, isOwner = false) {
  return isOwner || targetProfileVisibility !== ProfileVisibility.PRIVATE;
}

async function getSessionEmail() {
  const cookieStore = await cookies();

  const localPayload = readLocalSession(cookieStore.get(LOCAL_SESSION_COOKIE)?.value);
  if (localPayload?.email) {
    return localPayload.email;
  }

  const candidates = ["authjs.session-token", "__Secure-authjs.session-token"];

  for (const name of candidates) {
    const token = cookieStore.get(name)?.value;
    if (!token || !process.env.AUTH_SECRET) {
      continue;
    }

    const payload = await decode({
      token,
      secret: process.env.AUTH_SECRET,
      salt: name,
    });

    if (typeof payload?.email === "string") {
      return payload.email;
    }
  }

  return null;
}

export async function getCurrentUser() {
  const sessionEmail = await getSessionEmail();

  if (!sessionEmail) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: sessionEmail },
    select: {
      id: true,
      role: true,
      email: true,
      displayName: true,
      accountStatus: true,
      emailVerified: true,
      phoneVerifiedAt: true,
      ageVerified: true,
      verificationStatus: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireActiveUser() {
  const user = await requireUser();
  if (user.accountStatus !== AccountStatus.ACTIVE) {
    throw new Error("Your account is not active.");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    redirect("/home");
  }
  return user;
}
