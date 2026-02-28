'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingCart, Share2, Lightbulb, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { BottomNav } from '@/components/bottom-nav';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  compatibleProducts: Product[];
}

export function ProductDetail({ product, relatedProducts, compatibleProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAppStore(state => state.addToCart);
  const cart = useAppStore(state => state.cart);
  const solution = useAppStore(state => state.solution);

  const isInCart = cart.some(item => item.productId === product.id);
  const isInSolution = solution?.steps.some(step =>
    step.products.some(p => p.productSlug === product.slug)
  );

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    }, quantity);
    toast.success(`Added ${quantity} x ${product.name} to cart`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href={`/categories/${product.category.slug}`} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium truncate max-w-[200px]">{product.name}</span>
          <button onClick={handleShare} className="p-2 -mr-2">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aspect-square rounded-2xl bg-muted/50 overflow-hidden relative"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {isInSolution && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-teal-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  In your repair plan
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/categories" className="hover:text-foreground">Categories</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
                  {product.category.name}
                </Link>
              </div>

              {/* Brand & SKU */}
              {(product.brand || product.sku) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {product.brand && <span>{product.brand}</span>}
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>
              )}

              {/* Title & Price */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
                <p className="text-3xl font-bold text-teal-400 mt-2">{formatPrice(product.price)}</p>
                <p className="text-sm text-green-400 mt-1">
                  {product.inStock ? '✓ In Stock' : 'Out of Stock'}
                </p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{product.description}</p>

              {/* Expert Tip */}
              {product.expertTip && (
                <div className="bg-teal-500/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-medium">
                    <Lightbulb className="w-5 h-5" />
                    Expert Tip
                  </div>
                  <p className="text-sm text-teal-100">{product.expertTip}</p>
                </div>
              )}

              {/* Solution link */}
              {isInSolution && solution && (
                <Link
                  href="/solution"
                  className="block glass-card p-4 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Part of your repair plan</p>
                      <p className="text-xs text-muted-foreground">{solution.title}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  variant="teal"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart ? 'Add More' : 'Add to Cart'}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Compatible Products */}
          {compatibleProducts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-lg font-semibold mb-4">Works Great With</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {compatibleProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    image={p.image}
                    categoryName={p.category.name}
                    compact
                  />
                ))}
              </div>
            </section>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-lg font-semibold mb-4">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    image={p.image}
                    categoryName={p.category.name}
                    compact
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
