"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { ThemePreference } from "@prisma/client";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50),
});

export async function registerAction(formData: FormData) {
  const raw = {
    email: String(formData.get("email") ?? "").toLowerCase(),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid registration details.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("Email is already in use.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      passwordHash,
      settings: {
        create: {
          themePreference: ThemePreference.LIGHT,
        },
      },
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/home",
  });

}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/home",
  });
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/home" });
}
