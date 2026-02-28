"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/shopify/types';
import { TechBadge } from '@/components/ui/tech-badge';
import { motion } from 'framer-motion';

export function ProductCard({ product, index }: { product: Product; index: number }) {
    // Format price
    const price = new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: product.priceRange.minVariantPrice.currencyCode,
    }).format(parseFloat(product.priceRange.minVariantPrice.amount));

    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.log(`Product ${index + 1}: ${product.title}`, {
            hasImage: !!product.featuredImage,
            imgUrl: product.featuredImage?.url,
            price: product.priceRange.minVariantPrice.amount
        });
    }

    return (
        <Link
            href={`/product/${product.handle}`}
            className="group relative flex flex-col h-full rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 hover:border-teal-100 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
            <div className="absolute top-3 left-3 z-20">
                <TechBadge variant="ghost" className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-md shadow-sm border border-slate-200">
                    {`NO. ${String(index + 1).padStart(3, '0')}`}
                </TechBadge>
            </div>

            {/* Image Container */}
            <div className="aspect-[4/3] sm:aspect-square relative overflow-hidden bg-slate-50/50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    className="w-full h-full relative flex items-center justify-center mix-blend-multiply"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                >
                    {product.featuredImage && (
                        <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText || product.title}
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    )}
                </motion.div>

                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/[0.02] transition-colors duration-500" />
            </div>

            <div className="flex flex-col p-4 sm:p-5 gap-2 sm:gap-3 bg-white/40 flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-heading font-semibold text-base sm:text-lg leading-tight tracking-tight text-slate-800 group-hover:text-teal-900 transition-colors line-clamp-2">
                        {product.title}
                    </h3>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-900">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </motion.div>
                </div>

                <div className="flex justify-between items-end mt-auto pt-3 border-t border-slate-200/50">
                    <span className="font-bold text-slate-900">
                        {price}
                    </span>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
}
