import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { buildLocalSessionCookie } from "@/lib/auth/local-session";
import { AccountStatus } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = String(body?.email ?? "").toLowerCase();
  const password = String(body?.password ?? "");

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      passwordHash: true,
      accountStatus: true,
    },
  });

  if (!user || !user.passwordHash || user.accountStatus !== AccountStatus.ACTIVE) {
    return NextResponse.json({ error: "credentials" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirectTo: "/home" });
  const sessionCookie = buildLocalSessionCookie(user.email);
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  return response;
}
