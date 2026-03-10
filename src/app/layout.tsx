import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { ThemePreference } from "@prisma/client";

export const metadata: Metadata = {
  title: "Discreet Community MVP",
  description: "Private, consent-first community platform",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  let theme: ThemePreference = ThemePreference.LIGHT;
  if (session?.user?.email) {
    const settings = await prisma.userSettings.findFirst({
      where: { user: { email: session.user.email } },
      select: { themePreference: true },
    });

    if (settings?.themePreference) {
      theme = settings.themePreference;
    }
  }

  return (
    <html lang="en" className={theme === ThemePreference.DARK ? "dark" : ""}>
      <body>{children}</body>
    </html>
  );
}