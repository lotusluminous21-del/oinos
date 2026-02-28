'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, X } from 'lucide-react';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

interface SearchContentProps {
  initialQuery: string;
  products: Product[];
}

export function SearchContent({ initialQuery, products }: SearchContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Mobile header with search */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center gap-2 h-14 px-4">
          <Link href="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white/5 rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Desktop search */}
          <div className="hidden md:block mb-6">
            <form onSubmit={handleSearch}>
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white/5 rounded-xl pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </form>
          </div>

          {/* Results */}
          {initialQuery && (
            <p className="text-muted-foreground mb-4">
              {products.length} results for &quot;{initialQuery}&quot;
            </p>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    image={product.image}
                    categoryName={product.category.name}
                  />
                </motion.div>
              ))}
            </div>
          ) : initialQuery ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products found for &quot;{initialQuery}&quot;</p>
              <Link href="/expert" className="text-teal-400 hover:text-teal-300">
                Try our Expert Guide instead →
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Enter a search term to find products</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
