'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  categoryName?: string;
  isRelatedToProject?: boolean;
  compact?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  image,
  categoryName,
  isRelatedToProject,
  compact,
}: ProductCardProps) {
  const addToCart = useAppStore(state => state.addToCart);
  const cart = useAppStore(state => state.cart);

  const isInCart = cart.some(item => item.productId === id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: id,
      productSlug: slug,
      name,
      price,
      image,
    });

    toast.success(`Added ${name} to cart`);
  };

  return (
    <Link href={`/product/${slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="product-card h-full flex flex-col"
      >
        {/* Image */}
        <div className="aspect-square relative bg-muted/50 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          {isRelatedToProject && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-teal-500 text-white text-[10px] font-medium rounded">
              For your project
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          {categoryName && !compact && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {categoryName}
            </span>
          )}
          <h3 className="text-sm font-medium mt-1 line-clamp-2 flex-1">{name}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-semibold text-teal-400">{formatPrice(price)}</span>
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isInCart
                  ? 'bg-green-500 text-white'
                  : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-white'
                }`}
            >
              {isInCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
