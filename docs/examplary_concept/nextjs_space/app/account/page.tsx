'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ChevronRight, Package, Heart, FolderKanban, Settings, HelpCircle, LogOut, ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Header, BottomNav, ActionCard, PrimaryButton } from '@/components/skeuo';
import { useAppStore } from '@/lib/store';

const MENU_ITEMS = [
  { icon: Package, label: 'Order History', href: '#', description: 'View past orders' },
  { icon: Heart, label: 'Saved Products', href: '#', description: 'Your wishlist' },
  { icon: FolderKanban, label: 'My Projects', href: '#', description: 'Saved repair plans' },
  { icon: Settings, label: 'Settings', href: '#', description: 'App preferences' },
  { icon: HelpCircle, label: 'Help & Support', href: '#', description: 'Get assistance' },
];

export default function AccountPage() {
  const cart = useAppStore(state => state.cart);
  const solution = useAppStore(state => state.solution);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = () => {
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-skeuo-bg pb-20">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-800 ml-2">Account</span>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="skeuo-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-skeuo-accent to-skeuo-pink flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800">Guest User</h2>
                <p className="text-sm text-slate-500 font-medium">Sign in to save your projects</p>
              </div>
              <button 
                onClick={() => toast.info('Sign in coming soon!')}
                className="text-sm text-skeuo-accent font-semibold hover:text-skeuo-accent-dark"
              >
                Sign In
              </button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <Link href="/cart">
              <ActionCard className="p-4 h-full">
                <ShoppingCart className="w-6 h-6 text-skeuo-accent mb-2" />
                <span className="text-2xl font-bold text-slate-800">{cartCount}</span>
                <span className="text-xs text-slate-500 font-medium">Cart Items</span>
              </ActionCard>
            </Link>
            <Link href="/solution">
              <ActionCard className="p-4 h-full">
                <Sparkles className="w-6 h-6 text-skeuo-pink mb-2" />
                <span className="text-2xl font-bold text-slate-800">{solution ? 1 : 0}</span>
                <span className="text-xs text-slate-500 font-medium">Active Projects</span>
              </ActionCard>
            </Link>
          </motion.div>

          {/* Active Project */}
          {solution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="skeuo-card p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-skeuo-accent/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-skeuo-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{solution.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{solution.totalProducts} products</p>
                </div>
              </div>
              <Link href="/solution">
                <PrimaryButton size="sm">
                  View Repair Plan
                </PrimaryButton>
              </Link>
            </motion.div>
          )}

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            {MENU_ITEMS.map((item) => (
              <Link key={item.label} href={item.href}>
                <ActionCard className="p-4 flex items-center justify-between text-left w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <p className="text-xs text-slate-400 font-medium">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </ActionCard>
              </Link>
            ))}
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleSignOut}
              className="w-full skeuo-card p-4 flex items-center justify-center gap-2 text-red-500 font-semibold hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 font-medium pt-4">
            PAVLICEVITS v1.0 • Expert Paint Solutions
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
