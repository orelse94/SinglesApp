import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const LOCAL_SESSION_COOKIE = "dc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type LocalSessionPayload = {
  email: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for local sessions.");
  }
  return secret;
}

function signValue(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodePayload(payload: LocalSessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string) {
  try {
    const raw = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(raw) as LocalSessionPayload;
  } catch {
    return null;
  }
}

export function buildLocalSessionCookie(email: string) {
  const payload: LocalSessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = encodePayload(payload);
  const signature = signValue(encoded);

  return {
    name: LOCAL_SESSION_COOKIE,
    value: `${encoded}.${signature}`,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

export async function createLocalSession(email: string) {
  const cookieStore = await cookies();
  const sessionCookie = buildLocalSessionCookie(email);
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
}

export async function clearLocalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_SESSION_COOKIE);
}

export function readLocalSession(rawValue: string | undefined) {
  if (!rawValue) {
    return null;
  }

  const [encoded, signature] = rawValue.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = signValue(encoded);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  const payload = decodePayload(encoded);
  if (!payload?.email || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
