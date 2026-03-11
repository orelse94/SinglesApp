import Link from "next/link";
import { signOutAction } from "../(auth)/actions";
import { getCurrentUser } from "@/lib/auth/guards";

const navigation = [
  { href: "/home", label: "Home" },
  { href: "/groups", label: "Groups" },
  { href: "/chats", label: "Chats" },
  { href: "/notifications", label: "Notifications" },
  { href: "/me", label: "Profile" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Discreet Community</p>
            <p className="text-sm font-semibold">{currentUser?.email ?? "Member"}</p>
          </div>
          <form action={signOutAction}>
            <button className="rounded-full border px-3 py-1.5 text-xs font-medium" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 pb-3 text-sm">
          {navigation.map((item) => (
            <Link key={item.href} className="rounded-full border px-3 py-1.5" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
