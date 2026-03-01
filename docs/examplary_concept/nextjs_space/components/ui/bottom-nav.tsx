"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const { getCartCount } = useAppStore();
  const cartCount = getCartCount();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/categories", icon: Search, label: "Browse" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { href: "/account", icon: User, label: "Account" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6",
        "h-[64px] bg-skeuo-bg",
        "shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.03),-1px_-1px_2px_rgba(255,255,255,1)]",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        const isCart = item.label === "Cart";

        if (isCart) {
          return (
            <div key={item.href} className="relative flex justify-center w-[60px] h-full z-10">
              <Link
                href={item.href}
                className={cn(
                  "absolute -top-[16px] left-1/2 -translate-x-1/2 w-[64px] h-[64px] rounded-full flex items-center justify-center outline-none transition-all duration-300",
                  "bg-skeuo-bg",
                  "shadow-[8px_8px_16px_rgba(0,0,0,0.06),-8px_-8px_16px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
                  active && "scale-[0.96] shadow-skeuo-inset"
                )}
              >
                <Icon
                  className={cn(
                    "w-[26px] h-[26px] transition-colors drop-shadow-sm",
                    active ? "text-slate-900" : "text-slate-700"
                  )}
                  strokeWidth={2.2}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-skeuo-accent rounded-full flex items-center justify-center text-[11px] font-bold text-slate-900">
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
          >
            <Icon
              className={cn(
                "w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm",
                active
                  ? "text-slate-800 fill-slate-800"
                  : "text-slate-500 fill-transparent group-hover:text-slate-700"
              )}
              strokeWidth={active ? 2.5 : 1.5}
            />
            <div
              className={cn(
                "absolute -bottom-[10px] w-1.5 h-1.5 rotate-45 rounded-[1px] transition-all duration-300",
                active
                  ? "bg-slate-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] opacity-100 scale-100"
                  : "bg-transparent opacity-0 scale-0"
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
