'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Header, BottomNav, SmartSearchBar, ProductCard } from '@/components/skeuo';
import { useAppStore } from '@/lib/store';

interface SearchContentProps {
  query: string;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: { name: string } | null;
  }>;
}

export function SearchContent({ query, products }: SearchContentProps) {
  const router = useRouter();
  const addToCart = useAppStore(state => state.addToCart);
  const cart = useAppStore(state => state.cart);

  const handleSearch = (newQuery: string) => {
    router.push(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleAddToCart = (product: typeof products[0]) => {
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
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-800 ml-2">Search</span>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <SmartSearchBar
              placeholder="Search products..."
              onSubmit={handleSearch}
              defaultValue={query}
              showActions={false}
              className="max-w-xl"
            />
          </div>

          {/* Results */}
          {query ? (
            <div>
              <p className="text-sm text-slate-500 font-medium mb-4">
                {products.length} result{products.length !== 1 ? 's' : ''} for "{query}"
              </p>

              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product, idx) => (
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
                            category: product.category,
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
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No products found</p>
                  <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Search for products</p>
              <p className="text-sm text-slate-400 mt-1">Enter a search term to find products</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
