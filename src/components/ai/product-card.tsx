"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconShoppingCart, IconPlus, IconCheck } from "@tabler/icons-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: {
        title: string;
        handle: string;
        price: string;
        variant_id: string;
        image_url?: string;
    };
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToCart = async () => {
        setIsLoading(true);
        try {
            await addItem(product.variant_id, 1);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        } catch (error) {
            console.error("Failed to add to cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="group overflow-hidden bg-white/40 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="relative aspect-square overflow-hidden bg-gray-100/50">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center size-full text-gray-400 font-mono text-xs uppercase tracking-widest">
                        No Image
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="space-y-1">
                    <h4 className="font-bold text-sm tracking-tight truncate" title={product.title}>
                        {product.title}
                    </h4>
                    <p className="text-xs font-mono text-gray-500">{product.price}€</p>
                </div>
                <Button
                    onClick={handleAddToCart}
                    disabled={isLoading || isAdded}
                    size="sm"
                    className={cn(
                        "w-full h-9 rounded-full transition-all duration-300 gap-2",
                        isAdded
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-black text-white hover:bg-gray-800"
                    )}
                >
                    {isAdded ? (
                        <>
                            <IconCheck size={16} />
                            <span>Added</span>
                        </>
                    ) : (
                        <>
                            <IconPlus size={16} />
                            <span>Add to Cart</span>
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
