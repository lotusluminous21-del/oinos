'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/lib/shopify/types';
import { useCart } from '@/providers/CartProvider';

interface ProductDisplayProps {
    product: Product;
    variants: ProductVariant[];
}

export default function ProductDisplay({ product, variants }: ProductDisplayProps) {
    const { addCartItem } = useCart();

    // Find the first available variant, or default to the first one
    const initialVariant = variants.find((v) => v.availableForSale) || variants[0];
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(initialVariant);
    const [isAdding, setIsAdding] = useState(false);

    // Get the image to display (variant image falls back to product featured image)
    const displayImage = selectedVariant?.image || product.featuredImage;

    // Price display
    const currentPrice = selectedVariant?.price || product.priceRange.minVariantPrice;
    const formattedPrice = new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: currentPrice.currencyCode,
    }).format(parseFloat(currentPrice.amount));

    const handleAddToCart = async () => {
        if (!selectedVariant || !selectedVariant.availableForSale) return;
        setIsAdding(true);
        try {
            await addCartItem(selectedVariant.id, 1);
            // In a real app, replace with a nice toast
            alert('Added to cart!');
        } catch (e) {
            console.error(e);
            alert('Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left Column: Floating Image Gallery */}
            <div className="sticky top-32 space-y-8">
                {/* Main Hero Image Container - Pill/Stadium Geometry */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-center p-12">
                    {/* Deep ambient glow behind the product */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-purple-500/20 opacity-60 mix-blend-screen" />

                    {displayImage ? (
                        <Image
                            src={displayImage.url}
                            alt={displayImage.altText || product.title}
                            fill
                            className="object-contain p-16 hover:scale-105 transition-transform duration-700 ease-out z-10 drop-shadow-2xl"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-white/30 z-10">
                            <span className="font-heading tracking-widest uppercase text-sm">Image Unavailable</span>
                        </div>
                    )}
                </div>

                {/* Thumbnails (if multiple images exist across variants) */}
                {/* Note: We use unique variant images + featured image to build a mini gallery */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar px-2">
                    {/* Always show featured image as the first thumbnail */}
                    {product.featuredImage && (
                        <button
                            onClick={() => {
                                // Find if a variant matches this image exactly, else just keep current variant but we might need a dedicated image state if we decouple image from variant entirely.
                                // For now, clicking thumbnails just feels good if we map them to variants.
                                const v = variants.find(v => v.image?.url === product.featuredImage.url);
                                if (v) setSelectedVariant(v);
                            }}
                            className={`relative w-20 h-20 rounded-[1.5rem] flex-shrink-0 snap-center overflow-hidden border-2 transition-all ${displayImage?.url === product.featuredImage.url ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-white/10 opacity-50 hover:opacity-100'
                                }`}
                        >
                            <Image src={product.featuredImage.url} alt="Thumbnail" fill className="object-contain p-3" />
                        </button>
                    )}

                    {/* Show distinct variant images */}
                    {Array.from(new Map(variants.filter(v => v.image && v.image.url !== product.featuredImage?.url).map(v => [v.image!.url, v])).values()).map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`relative w-20 h-20 rounded-[1.5rem] flex-shrink-0 snap-center overflow-hidden border-2 transition-all ${displayImage?.url === v.image?.url ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-white/10 opacity-50 hover:opacity-100'
                                }`}
                        >
                            <Image src={v.image!.url} alt={v.title} fill className="object-contain p-3" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Column: Product Info & Actions */}
            <div className="flex flex-col pt-4 md:pt-12 space-y-10">

                {/* Title & Price Header */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white text-balance leading-[0.95]">
                        {product.title}
                    </h1>

                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300">
                            {formattedPrice}
                        </span>
                        <span className="text-sm font-bold text-white/40 uppercase tracking-widest pl-2 border-l border-white/20">
                            Incl. VAT
                        </span>
                    </div>
                </div>

                {/* Variant Selector - Pill Geometry */}
                {variants.length > 1 && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 ml-2">Select Option</h3>
                        <div className="flex flex-wrap gap-3">
                            {variants.map((v) => {
                                const isSelected = selectedVariant?.id === v.id;
                                const isAvailable = v.availableForSale;

                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v)}
                                        disabled={!isAvailable}
                                        className={`
                                            relative px-6 py-4 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ease-out flex items-center gap-3
                                            ${isSelected
                                                ? 'bg-white text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] scale-105'
                                                : isAvailable
                                                    ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/30 backdrop-blur-md'
                                                    : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed hidden' // Hide entirely or style as struck-through
                                            }
                                        `}
                                    >
                                        {/* If we have specific option names, we'd map them here. For now, v.title */}
                                        <span>{v.title}</span>
                                        {!isAvailable && <span className="text-[10px] uppercase opacity-50 px-2 py-1 bg-black/50 rounded-full">Out</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Add to Cart Floating Action - Massive Pill */}
                <div className="pt-6 pb-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || !selectedVariant?.availableForSale}
                        className={`
                            group relative w-full flex items-center justify-center gap-4 py-6 px-12 rounded-full font-black text-xl tracking-wide transition-all duration-500 overflow-hidden
                            ${selectedVariant?.availableForSale
                                ? 'bg-emerald-500 text-black hover:scale-[1.02] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)]'
                                : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                            }
                        `}
                    >
                        {/* Button Glow Effect */}
                        {selectedVariant?.availableForSale && (
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        )}

                        <span className="relative z-10 flex items-center gap-3">
                            {isAdding ? 'Adding to Cart...' : selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}

                            {!isAdding && selectedVariant?.availableForSale && (
                                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </span>
                    </button>
                </div>

                {/* Product Description - Deep Contrast Glassmorphism */}
                <div className="relative p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] mt-8 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Product Details
                    </h3>

                    <div
                        className="prose prose-invert prose-p:text-white/60 prose-p:leading-loose prose-p:text-lg prose-li:text-white/60 prose-li:text-lg prose-a:text-emerald-400 hover:prose-a:text-emerald-300 max-w-none font-medium"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                    />
                </div>

            </div>
        </div>
    );
}
