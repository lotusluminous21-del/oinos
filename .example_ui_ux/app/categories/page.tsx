'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, SprayCan, Palette, Sparkles, Scissors, Wrench, Star } from 'lucide-react';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';

const CATEGORIES = [
  { name: 'Primers', slug: 'primers', icon: SprayCan, description: 'Surface preparation primers', count: 8 },
  { name: 'Base Coats', slug: 'base-coats', icon: Palette, description: 'Color base coats', count: 10 },
  { name: 'Clear Coats', slug: 'clear-coats', icon: Sparkles, description: '1K and 2K clear finishes', count: 6 },
  { name: 'Abrasives', slug: 'abrasives', icon: Scissors, description: 'Sandpaper and compounds', count: 12 },
  { name: 'Equipment', slug: 'equipment', icon: Wrench, description: 'Tools and supplies', count: 8 },
  { name: 'Finishing', slug: 'finishing', icon: Star, description: 'Polish and wax', count: 6 },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium ml-2">Categories</span>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6 hidden md:block">All Categories</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((category, idx) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className="glass-card p-6 flex items-start gap-4 hover:border-teal-500/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0 group-hover:bg-teal-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-teal-400 transition-colors">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{category.count} products</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
