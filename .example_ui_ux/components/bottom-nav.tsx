'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, ShoppingCart, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/categories', icon: Grid3X3, label: 'Browse' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/account', icon: User, label: 'Account' },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useAppStore(state => state.getCartCount());
  const solution = useAppStore(state => state.solution);
  const status = useAppStore(state => state.status);

  const showSolutionIndicator = status === 'complete' && solution;

  return (
    <>
      {/* Floating solution indicator */}
      <AnimatePresence>
        {showSolutionIndicator && pathname !== '/solution' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-40 md:hidden"
          >
            <Link href="/solution">
              <div className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Your repair plan is ready</p>
                    <p className="text-xs text-muted-foreground">{solution.totalProducts} products • €{solution.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                <span className="text-teal-400 text-sm">View →</span>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 md:hidden">
        <div className="flex items-center justify-around h-16 pb-safe">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors',
                  isActive ? 'text-teal-400' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.href === '/cart' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-teal-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
