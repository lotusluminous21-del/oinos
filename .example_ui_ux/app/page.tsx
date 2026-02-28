'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Camera, Mic, Sparkles, Shield, Truck, Headphones, Award, ChevronRight } from 'lucide-react';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { useAppStore } from '@/lib/store';
import { parseText } from '@/lib/ai-engine';

const CATEGORIES = [
  { name: 'Primers', slug: 'primers', icon: '🪣', count: 12 },
  { name: 'Base Coats', slug: 'base-coats', icon: '🎨', count: 18 },
  { name: 'Clear Coats', slug: 'clear-coats', icon: '✨', count: 8 },
  { name: 'Abrasives', slug: 'abrasives', icon: '🧹', count: 15 },
  { name: 'Tools', slug: 'tools', icon: '🛠️', count: 22 },
  { name: 'Finishing', slug: 'finishing', icon: '💎', count: 10 },
];

const TRUST_BADGES = [
  { icon: Award, title: 'Authorized Partner', desc: 'Official distributor' },
  { icon: Shield, title: 'Secure Payments', desc: 'SSL encrypted' },
  { icon: Truck, title: 'Fast Shipping', desc: 'Nationwide delivery' },
  { icon: Headphones, title: 'Expert Support', desc: 'Technical assistance' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const initSession = useAppStore(state => state.initSession);
  const resetConversation = useAppStore(state => state.resetConversation);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Analyze if this is a project query or product search
    const { updates } = parseText(searchQuery);
    const hasProjectIntent = updates.damageType || 
      searchQuery.toLowerCase().includes('how') ||
      searchQuery.toLowerCase().includes('fix') ||
      searchQuery.toLowerCase().includes('repair') ||
      searchQuery.toLowerCase().includes('help');

    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));

    if (hasProjectIntent) {
      // Reset conversation and go to expert with query
      resetConversation();
      initSession();
      // Store query to process on expert page
      sessionStorage.setItem('pendingQuery', searchQuery);
      router.push('/expert');
    } else {
      // Direct product search
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }

    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              PAVLICEVITS
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Expert paint solutions for automotive & structural projects
            </p>
          </motion.div>

          {/* Smart Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="glass rounded-2xl p-1">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="How can the expert help you today?"
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/70"
                    disabled={isSearching}
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Camera className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expert AI Badge */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-muted-foreground">EXPERT AI</span>
              </div>
            </form>

            {/* Quick suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                onClick={() => {
                  setSearchQuery('I scratched my car door');
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                📍 Fix a scratch
              </button>
              <button
                onClick={() => {
                  setSearchQuery('I have rust on my car');
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                🪹 Treat rust
              </button>
              <button
                onClick={() => router.push('/expert')}
                className="text-xs px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 hover:bg-teal-500/30 transition-colors"
              >
                ✨ Get expert help
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-6 border-y border-white/10 bg-black/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map((badge, idx) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className="flex items-center gap-3"
            >
              <badge.icon className="w-6 h-6 text-teal-400 shrink-0" />
              <div>
                <p className="text-xs font-medium">{badge.title}</p>
                <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Shop by Category</h2>
            <Link
              href="/categories"
              className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((category, idx) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="glass-card p-4 flex flex-col items-center text-center hover:border-teal-500/30 transition-all group"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">{category.count} products</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert CTA */}
      <section className="px-4 py-8 mb-20 md:mb-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="gradient-bg rounded-2xl p-6 md:p-8 text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold">Not sure what you need?</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Our AI expert can analyze your situation and recommend the exact products you need for your project.
            </p>
            <button
              onClick={() => router.push('/expert')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Start Expert Guide
            </button>
          </motion.div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
