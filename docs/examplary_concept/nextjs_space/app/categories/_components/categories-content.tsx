'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, SprayCan, Palette, Star, Scissors, Wrench, Sparkles } from 'lucide-react';

import { Header, BottomNav, ActionCard } from '@/components/skeuo';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  SprayCan, Palette, Star, Scissors, Wrench, Sparkles,
  default: SprayCan,
};

interface CategoriesContentProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    _count: { products: number };
  }>;
}

export function CategoriesContent({ categories }: CategoriesContentProps) {
  return (
    <div className="min-h-screen bg-skeuo-bg pb-20">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-800 ml-2">Categories</span>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 hidden md:block">All Categories</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, idx) => {
              const IconComp = ICON_MAP[category.icon || 'default'] || ICON_MAP.default;
              return (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <ActionCard className="p-6 flex items-start gap-4 text-left h-full hover:scale-[1.01]">
                      <div className="w-14 h-14 rounded-xl bg-skeuo-accent/10 flex items-center justify-center shrink-0">
                        <IconComp className="w-7 h-7 text-skeuo-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-slate-500 font-medium mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-slate-400 font-medium mt-2">
                          {category._count.products} products
                        </p>
                      </div>
                    </ActionCard>
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
