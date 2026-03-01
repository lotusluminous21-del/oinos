'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

import { Header, BottomNav, ProductCard, Chip } from '@/components/skeuo';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface CategoryProductsContentProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      image: string | null;
      description: string;
    }>;
  };
  allCategories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function CategoryProductsContent({ category, allCategories }: CategoryProductsContentProps) {
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const addToCart = useAppStore(state => state.addToCart);
  const cart = useAppStore(state => state.cart);

  const sortedProducts = [...category.products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  const handleAddToCart = (product: typeof category.products[0]) => {
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const isInCart = (productId: string) => cart.some(item => item.productId === productId);

  return (
    <div className="min-h-screen bg-skeuo-bg pb-20">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/categories" className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-800">{category.name}</span>
          <div className="flex gap-1">
            <button className="p-2 text-slate-500">
              <ArrowUpDown className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        {/* Category Chips */}
        <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {allCategories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}>
                <Chip selected={cat.slug === category.slug}>
                  {cat.name}
                </Chip>
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Desktop title */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{category.name}</h1>
              {category.description && (
                <p className="text-sm text-slate-500 font-medium mt-1">{category.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="skeuo-card px-4 py-2 text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/product/${product.slug}`}>
                    <ProductCard
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        image: product.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
                      }}
                      onAddToCart={() => handleAddToCart(product)}
                      isInCart={isInCart(product.id)}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 font-medium">No products in this category yet.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
