'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Lightbulb, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Header, BottomNav, ProductCard, QuantitySelector, PrimaryButton, Chip } from '@/components/skeuo';
import { useAppStore } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';

interface ProductDetailContentProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    image: string | null;
    brand: string | null;
    sku: string | null;
    inStock: boolean;
    expertTip: string | null;
    compatibleWith: string[];
    tags: string[];
    category: { id: string; name: string; slug: string };
  };
  compatibleProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: { name: string } | null;
  }>;
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: { name: string } | null;
  }>;
}

export function ProductDetailContent({ product, compatibleProducts, relatedProducts }: ProductDetailContentProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAppStore(state => state.addToCart);
  const cart = useAppStore(state => state.cart);

  const isInCart = cart.some(item => item.productId === product.id);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    }, quantity);
    toast.success(`Added ${product.name} to cart`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-skeuo-bg pb-32">
      <Header />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href={`/categories/${product.category.slug}`} className="p-2 -ml-2 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-slate-800 truncate max-w-[200px]">{product.name}</span>
          <button onClick={handleShare} className="p-2 -mr-2 text-slate-500">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="skeuo-card p-6 aspect-square flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                <Image
                  src={product.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Category & Brand */}
              <div className="flex items-center gap-2">
                <Link href={`/categories/${product.category.slug}`}>
                  <Chip className="!h-7 !text-[11px]">{product.category.name}</Chip>
                </Link>
                {product.brand && (
                  <Chip className="!h-7 !text-[11px] !bg-slate-100">{product.brand}</Chip>
                )}
              </div>

              {/* Name & Price */}
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
                <p className="text-3xl font-extrabold text-skeuo-accent-dark mt-2">
                  {formatPrice(product.price)}
                </p>
                {product.sku && (
                  <p className="text-xs text-slate-400 font-medium mt-1">SKU: {product.sku}</p>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {product.description}
              </p>

              {/* Expert Tip */}
              {product.expertTip && (
                <div className="skeuo-inset rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-skeuo-accent-dark text-sm font-bold">
                    <Lightbulb className="w-5 h-5" />
                    Expert Tip
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    {product.expertTip}
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Add to Cart */}
              <div className="skeuo-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Quantity</span>
                  <QuantitySelector
                    value={quantity}
                    onValueChange={setQuantity}
                  />
                </div>

                <PrimaryButton
                  onClick={handleAddToCart}
                  className={cn(
                    isInCart && "!bg-green-500"
                  )}
                >
                  {isInCart ? (
                    <><Check className="w-5 h-5 mr-2" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</>
                  )}
                </PrimaryButton>

                <p className={cn(
                  "text-center text-sm font-medium",
                  product.inStock ? "text-green-600" : "text-red-500"
                )}>
                  {product.inStock ? '✓ In Stock' : 'Out of Stock'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Compatible Products */}
          {compatibleProducts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Works Well With</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {compatibleProducts.map((p) => (
                  <Link key={p.id} href={`/product/${p.slug}`}>
                    <ProductCard
                      product={{
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        price: p.price,
                        image: p.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
                        category: p.category,
                      }}
                      variant="compact"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <Link key={p.id} href={`/product/${p.slug}`}>
                    <ProductCard
                      product={{
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        price: p.price,
                        image: p.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
                        category: p.category,
                      }}
                      variant="compact"
                    />
                  </Link>
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
