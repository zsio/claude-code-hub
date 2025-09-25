"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  href: string;
  label: string;
}

interface DashboardNavProps {
  items: DashboardNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname();

  if (items.length === 0) {
    return null;
  }

  const getIsActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center gap-1 rounded-full border border-border/80 bg-background/80 px-1 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {items.map((item) => {
        const isActive = getIsActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground",
              isActive && "bg-primary/5 text-foreground shadow-[0_1px_0_0_rgba(0,0,0,0.03)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
