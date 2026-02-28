'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, SlidersHorizontal, ChevronDown } from 'lucide-react';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
interface CategoryProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface CategoryWithProducts {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  products: CategoryProduct[];
}

interface SimpleCategory {
  id: string;
  name: string;
  slug: string;
}

interface CategoryContentProps {
  category: CategoryWithProducts;
  allCategories: SimpleCategory[];
}

export function CategoryContent({ category, allCategories }: CategoryContentProps) {
  const [sortBy, setSortBy] = useState('name');
  const [showSort, setShowSort] = useState(false);

  const sortedProducts = [...category.products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Link href="/categories" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-medium ml-2">{category.name}</span>
          </div>
          <button
            onClick={() => setShowSort(!showSort)}
            className="p-2 -mr-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Sort dropdown */}
        {showSort && (
          <div className="absolute top-full left-0 right-0 glass border-b border-white/10 p-4">
            <p className="text-xs text-muted-foreground mb-2">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'name', label: 'Name' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSort(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    sortBy === option.value
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-14 md:pt-20">
        {/* Category pills */}
        <div className="overflow-x-auto scrollbar-hide border-b border-white/10">
          <div className="flex gap-2 px-4 py-3 min-w-max">
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  cat.slug === category.slug
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {category.products.length} products
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-sm">Sort by</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSort && (
                <div className="absolute right-0 mt-2 w-48 glass-card p-2 z-10">
                  {[
                    { value: 'name', label: 'Name' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSort(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product, idx) => (
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
                  categoryName={category.name}
                />
              </motion.div>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
