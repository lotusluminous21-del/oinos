'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Grid3X3, ShoppingCart, MessageSquareText, User } from "lucide-react"
import { useAppStore } from "@/lib/store"

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/categories', icon: Grid3X3, label: 'Browse' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart', isCenter: true },
  { href: '/expert', icon: MessageSquareText, label: 'Expert' },
  { href: '/account', icon: User, label: 'Account' },
];

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const cart = useAppStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-skeuo-bg border-t border-slate-200/50",
        "shadow-[0_-8px_16px_rgba(0,0,0,0.05)]",
        "pb-safe",
        className
      )}
    >
      <div className="flex items-center justify-around h-[64px] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          const isCart = item.label === 'Cart';

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex justify-center -mt-4"
              >
                <div
                  className={cn(
                    "w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-300",
                    "bg-skeuo-bg",
                    isActive
                      ? "shadow-skeuo-inset scale-[0.96]"
                      : "shadow-[8px_8px_16px_rgba(0,0,0,0.06),-8px_-8px_16px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-skeuo-accent" : "text-slate-600"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-skeuo-pink text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-[50px] py-2 group"
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700"
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold mt-1 transition-colors",
                  isActive ? "text-slate-800" : "text-slate-500"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rotate-45 rounded-[1px] bg-slate-800 shadow-inner" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  )
}
