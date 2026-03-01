"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, Bell, ShoppingCart } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Header() {
  const { getCartCount } = useAppStore();
  const cartCount = getCartCount();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[60px] px-4",
        "bg-skeuo-bg",
        "shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
        "flex items-center justify-between"
      )}
    >
      <button className="w-10 h-10 flex items-center justify-center text-slate-700">
        <Menu className="w-6 h-6" strokeWidth={1.5} />
      </button>

      <Link href="/" className="flex items-center">
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
          PAVLICEVITS
        </h1>
      </Link>

      <div className="flex items-center gap-1">
        <button className="w-10 h-10 flex items-center justify-center text-slate-700">
          <Bell className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <Link
          href="/cart"
          className="relative w-10 h-10 flex items-center justify-center text-slate-700"
        >
          <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-skeuo-accent rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
