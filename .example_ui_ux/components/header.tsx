'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Header() {
  const cartCount = useAppStore(state => state.getCartCount());

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">PAVLICEVITS</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
          <Link href="/expert" className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
            <span className="text-xs">✨</span> Expert Guide
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/search" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          <Link href="/account" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
