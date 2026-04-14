"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Leaf, LogOut, Settings } from "lucide-react";
import {
  LayoutDashboard,
  Search,
  FolderKanban,
  Bug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/evidence", label: "Evidence Search", icon: Search },
  { href: "/projects", label: "My Projects", icon: FolderKanban },
  { href: "/species", label: "Species Explorer", icon: Bug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-14 items-center border-b px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 hover:bg-accent">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center gap-2 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">CEIP</span>
          </div>
          <Separator />
          <nav className="space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Separator />
          <div className="p-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <div className="ml-3 flex items-center gap-2">
        <Leaf className="h-5 w-5 text-primary" />
        <span className="font-semibold">CEIP</span>
      </div>
    </div>
  );
}
