import Link from "next/link";

import type { AuthSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DashboardNav, type DashboardNavItem } from "./dashboard-nav";
import { UserMenu } from "./user-menu";

interface DashboardHeaderProps {
  session: AuthSession | null;
}

const NAV_ITEMS: (DashboardNavItem & { adminOnly?: boolean })[] = [
  { href: "/dashboard", label: "仪表盘" },
  { href: "/usage-doc", label: "文档" },
  { href: "/settings", label: "系统设置", adminOnly: true },
];

export function DashboardHeader({ session }: DashboardHeaderProps) {
  const isAdmin = session?.user.role === "admin";
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <DashboardNav items={items} />
        <div className="flex items-center gap-3">
          {session ? (
            <UserMenu user={session.user} />
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">登录</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
