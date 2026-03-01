'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Truck, Headphones, Award, ChevronRight, SprayCan, Palette, Star, Scissors, Wrench } from 'lucide-react';

import { Header, BottomNav, SmartSearchBar, ActionCard, ProductCard, Chip, PrimaryButton } from '@/components/skeuo';
import { useAppStore } from '@/lib/store';
import { parseText } from '@/lib/ai-engine';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  SprayCan, Palette, Star, Scissors, Wrench,
  default: SprayCan,
};

const TRUST_BADGES = [
  { icon: Award, title: 'Authorized Partner', desc: 'Official distributor' },
  { icon: Shield, title: 'Secure Payments', desc: 'SSL encrypted' },
  { icon: Truck, title: 'Fast Shipping', desc: 'Nationwide delivery' },
  { icon: Headphones, title: 'Expert Support', desc: 'Technical assistance' },
];

interface HomeContentProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    _count: { products: number };
  }>;
  featuredProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: { name: string } | null;
  }>;
}

export function HomeContent({ categories, featuredProducts }: HomeContentProps) {
  const router = useRouter();
  const resetConversation = useAppStore(state => state.resetConversation);
  const initSession = useAppStore(state => state.initSession);

  const handleSearch = async (query: string) => {
    const { updates } = parseText(query);
    const hasProjectIntent = updates.damageType || 
      query.toLowerCase().includes('how') ||
      query.toLowerCase().includes('fix') ||
      query.toLowerCase().includes('repair') ||
      query.toLowerCase().includes('help');

    if (hasProjectIntent) {
      resetConversation();
      initSession();
      sessionStorage.setItem('pendingQuery', query);
      router.push('/expert');
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-skeuo-bg">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[60vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-4 md:pt-20">
        {/* Fluid background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="fluid-shape fluid-shape-1" />
          <div className="fluid-shape fluid-shape-2" />
          <div className="fluid-shape fluid-shape-3" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-2xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-800">
              PAVLICEVITS
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
              Expert paint solutions for automotive & structural projects
            </p>
          </motion.div>

          {/* Smart Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full flex justify-center"
          >
            <SmartSearchBar
              placeholder="How can the expert help you today?"
              onSubmit={handleSearch}
              onCameraClick={() => router.push('/expert')}
              className="max-w-md"
            />
          </motion.div>

          {/* Expert AI Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-skeuo-accent" />
            <span className="text-xs text-slate-500 font-semibold tracking-wide">EXPERT AI</span>
          </motion.div>

          {/* Quick suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2"
          >
            <Chip onClick={() => handleSearch('I scratched my car door')}>
              📍 Fix a scratch
            </Chip>
            <Chip onClick={() => handleSearch('I have rust on my car')}>
              🪹 Treat rust
            </Chip>
            <Chip 
              onClick={() => router.push('/expert')}
              className="!bg-skeuo-accent/10 !text-skeuo-accent-dark"
            >
              ✨ Get expert help
            </Chip>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-6 border-y border-slate-200/50 bg-white/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map((badge, idx) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className="flex items-center gap-3"
            >
              <badge.icon className="w-6 h-6 text-skeuo-accent shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-700">{badge.title}</p>
                <p className="text-[10px] text-slate-500 font-medium">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Shop by Category</h2>
            <Link
              href="/categories"
              className="text-sm text-skeuo-accent font-semibold flex items-center gap-1 hover:text-skeuo-accent-dark"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category, idx) => {
              const IconComp = ICON_MAP[category.icon || 'default'] || ICON_MAP.default;
              return (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.05 }}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <ActionCard className="p-4 h-full hover:scale-[1.02]">
                      <div className="w-12 h-12 rounded-xl bg-skeuo-accent/10 flex items-center justify-center mb-2">
                        <IconComp className="w-6 h-6 text-skeuo-accent" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{category.name}</span>
                      <span className="text-xs text-slate-500 font-medium">{category._count.products} products</span>
                    </ActionCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + idx * 0.05 }}
                >
                  <Link href={`/product/${product.slug}`}>
                    <ProductCard
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        image: product.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
                        category: product.category,
                      }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Expert CTA */}
      <section className="px-4 py-8 mb-20 md:mb-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="skeuo-card p-6 md:p-8 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-skeuo-accent to-skeuo-pink flex items-center justify-center shadow-lg">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Not sure what you need?</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
              Our AI expert can analyze your situation and recommend the exact products you need for your project.
            </p>
            <PrimaryButton
              onClick={() => router.push('/expert')}
              size="sm"
              className="mx-auto w-auto"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Expert Guide
            </PrimaryButton>
          </motion.div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
