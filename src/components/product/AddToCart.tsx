
'use client';

import { useState } from 'react';
import { useCart } from '@/providers/CartProvider';
import { ProductVariant } from '@/lib/shopify/types';

export default function AddToCart({ variants }: { variants: ProductVariant[] }) {
    const { addCartItem } = useCart();
    const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '');
    const [isAdding, setIsAdding] = useState(false);

    // Simple variant selector logic for now (just a dropdown of all variants)
    // In a real app, this would be a sophisticated selector based on options (Size, Color)

    const handleAddToCart = async () => {
        if (!selectedVariantId) return;
        setIsAdding(true);
        try {
            await addCartItem(selectedVariantId, 1);
            alert('Added to cart!'); // Minimal feedback
        } catch (e) {
            console.error(e);
            alert('Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    if (!variants.length) return <div className="text-rose-400 font-medium p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-center">Out of Stock</div>;

    return (
        <div className="flex flex-col sm:flex-row items-end gap-4 w-full">
            {variants.length > 1 && (
                <div className="flex flex-col gap-2 w-full sm:w-1/2">
                    <label htmlFor="variant-select" className="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">
                        Select Variant
                    </label>
                    <div className="relative">
                        <select
                            id="variant-select"
                            value={selectedVariantId}
                            onChange={(e) => setSelectedVariantId(e.target.value)}
                            className="w-full appearance-none bg-white/5 border border-white/20 text-white p-4 rounded-2xl outline-none focus:border-emerald-500/50 backdrop-blur-md transition-colors"
                        >
                            {variants.map(v => (
                                <option key={v.id} value={v.id} disabled={!v.availableForSale} className="bg-neutral-900 text-white">
                                    {v.title} - {v.price.amount} {v.price.currencyCode} {!v.availableForSale && '(Out of Stock)'}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariantId}
                className="w-full sm:w-auto flex-1 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center py-4 px-8 rounded-2xl transition-all font-bold shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] active:scale-[0.98]"
            >
                {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
        </div>
    );
}
