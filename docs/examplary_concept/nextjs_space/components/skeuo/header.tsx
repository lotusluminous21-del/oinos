'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, ShoppingCart, User, Sparkles, ArrowLeft } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  className?: string;
}

export function Header({ showBack, title, className }: HeaderProps) {
  const pathname = usePathname();
  const cart = useAppStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Desktop Header */}
      <header
        className={cn(
          "hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-6",
          "bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50",
          "shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
          className
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-skeuo-accent flex items-center justify-center shadow-skeuo-button">
            <span className="text-slate-900 font-black text-sm">P</span>
          </div>
          <span className="font-black text-lg tracking-tight text-slate-800">PAVLICEVITS</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/categories"
            className={cn(
              "text-sm font-semibold transition-colors",
              pathname.startsWith('/categories') ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Products
          </Link>
          <Link
            href="/expert"
            className={cn(
              "text-sm font-semibold flex items-center gap-1.5 transition-colors",
              pathname === '/expert' ? "text-skeuo-accent" : "text-slate-600 hover:text-skeuo-accent"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Expert Guide
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/cart"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-skeuo-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      {(showBack || title) && (
        <header
          className={cn(
            "md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4",
            "bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50",
            "shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          )}
        >
          {showBack && (
            <Link href="/" className="p-2 -ml-2 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          {title && (
            <h1 className="flex-1 text-center font-bold text-slate-800 tracking-tight">
              {title}
            </h1>
          )}
          {showBack && <div className="w-9" />}
        </header>
      )}
    </>
  )
}
