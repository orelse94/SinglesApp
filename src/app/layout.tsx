import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/guards";
import { ThemePreference } from "@prisma/client";

export const metadata: Metadata = {
  title: "Discreet Community MVP",
  description: "Private, consent-first community platform",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await getCurrentUser();

  let theme: ThemePreference = ThemePreference.LIGHT;
  if (currentUser?.email) {
    const settings = await prisma.userSettings.findFirst({
      where: { user: { email: currentUser.email } },
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
