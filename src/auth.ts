import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { ThemePreference } from "@prisma/client";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/db/prisma";

const baseAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: {
    ...baseAdapter,
    async createUser({ name, ...data }) {
      return prisma.user.create({
        data: {
          ...data,
          displayName: name ?? data.email?.split("@")[0] ?? "Member",
        },
      });
    },
    async updateUser({ id, name, ...data }) {
      return prisma.user.update({
        where: { id },
        data: {
          ...data,
          ...(typeof name === "string" ? { displayName: name } : {}),
        },
      });
    },
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user }) {
      const dbUser = user as typeof user & { displayName?: string | null };

      if (session.user) {
        session.user.name = dbUser.name ?? dbUser.displayName ?? null;
        session.user.email = dbUser.email;
        session.user.image = dbUser.image;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) {
        return;
      }
      await prisma.userSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          themePreference: ThemePreference.LIGHT,
        },
      });
    },
  },
});
