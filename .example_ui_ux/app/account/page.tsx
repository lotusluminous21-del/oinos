'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Package, Heart, Settings, HelpCircle, LogIn, ShoppingCart, Sparkles } from 'lucide-react';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

const MENU_ITEMS = [
  { icon: Package, label: 'Order History', href: '#', disabled: true },
  { icon: Heart, label: 'Saved Products', href: '#', disabled: true },
  { icon: Sparkles, label: 'My Projects', href: '/solution', disabled: false },
  { icon: Settings, label: 'Settings', href: '#', disabled: true },
  { icon: HelpCircle, label: 'Help & Support', href: '#', disabled: true },
];

export default function AccountPage() {
  const cartCount = useAppStore(state => state.getCartCount());
  const solution = useAppStore(state => state.solution);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium ml-2">Account</span>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Profile section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Guest User</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to save your projects</p>
            <Button variant="teal" className="mt-4">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Register
            </Button>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <Link href="/cart" className="glass-card p-4 hover:border-teal-500/30 transition-colors">
              <ShoppingCart className="w-6 h-6 text-teal-400 mb-2" />
              <p className="text-2xl font-bold">{cartCount}</p>
              <p className="text-sm text-muted-foreground">Cart Items</p>
            </Link>
            <Link href="/solution" className="glass-card p-4 hover:border-teal-500/30 transition-colors">
              <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{solution ? 1 : 0}</p>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </Link>
          </motion.div>

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card overflow-hidden"
          >
            {MENU_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const content = (
                <div className={`flex items-center gap-4 p-4 ${idx !== MENU_ITEMS.length - 1 ? 'border-b border-white/10' : ''} ${item.disabled ? 'opacity-50' : 'hover:bg-white/5'} transition-colors`}>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && <span className="text-xs text-muted-foreground">Coming soon</span>}
                </div>
              );

              return item.disabled ? (
                <div key={item.label}>{content}</div>
              ) : (
                <Link key={item.label} href={item.href}>{content}</Link>
              );
            })}
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
