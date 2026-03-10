import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authRequiredPrefixes = ["/home", "/me", "/users", "/groups", "/chats", "/notifications", "/admin"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isProtected = authRequiredPrefixes.some((prefix) => nextUrl.pathname.startsWith(prefix));

  if (isProtected) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  if (nextUrl.pathname.startsWith("/users")) {
    // PUBLIC profile visibility is in-app member visibility, never open-web indexable.
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};