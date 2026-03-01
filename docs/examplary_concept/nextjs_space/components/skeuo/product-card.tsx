import * as React from "react"
import Image from "next/image"
import { cn, formatPrice } from "@/lib/utils"
import { Plus, Check } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    category?: { name: string } | null;
  };
  variant?: "standard" | "compact" | "horizontal";
  onAddToCart?: () => void;
  isInCart?: boolean;
  className?: string;
}

export function ProductCard({ product, variant = "standard", onAddToCart, isInCart, className }: ProductCardProps) {
  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "group relative flex items-center gap-4 p-4 rounded-[28px] bg-skeuo-bg transition-all duration-300",
          "shadow-skeuo-raised hover:shadow-skeuo-raised-hover",
          className
        )}
      >
        <div className="relative w-[70px] h-[70px] shrink-0 rounded-[18px] bg-skeuo-bg shadow-skeuo-raised flex items-center justify-center p-2 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-slate-800 truncate tracking-tight">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-[13px] font-medium text-slate-500 mt-0.5">
              {product.category.name}
            </p>
          )}
          <p className="text-[16px] font-extrabold text-slate-900 tracking-tight mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
        {onAddToCart && (
          <button
            onClick={onAddToCart}
            disabled={isInCart}
            className={cn(
              "w-[42px] h-[42px] rounded-[16px] flex items-center justify-center transition-all shrink-0",
              isInCart
                ? "bg-green-500 text-white shadow-md"
                : "bg-skeuo-accent text-slate-900 shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95"
            )}
          >
            {isInCart ? <Check className="w-5 h-5" strokeWidth={2.5} /> : <Plus className="w-5 h-5" strokeWidth={2.5} />}
          </button>
        )}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group relative flex flex-col items-center w-[140px] p-4 rounded-[24px] bg-skeuo-bg transition-all duration-300",
          "shadow-skeuo-raised hover:shadow-skeuo-raised-hover",
          className
        )}
      >
        <div className="relative w-full aspect-square mb-3">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className="text-[13px] font-bold text-slate-800 text-center leading-[1.2] line-clamp-2 tracking-tight">
          {product.name}
        </h3>
        <p className="text-[14px] font-extrabold text-slate-900 tracking-tight mt-2">
          {formatPrice(product.price)}
        </p>
      </div>
    )
  }

  // Standard variant
  return (
    <div
      className={cn(
        "group relative flex flex-col w-full p-5 rounded-[32px] bg-skeuo-bg transition-all duration-300 product-card",
        "shadow-skeuo-raised hover:shadow-skeuo-raised-hover",
        className
      )}
    >
      <div className="relative w-full h-[140px] mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
        />
      </div>

      <div className="flex flex-col flex-1 justify-end mt-auto w-full">
        <h3 className="text-[16px] font-bold text-slate-800 leading-[1.2] line-clamp-2 tracking-tight mb-3">
          {product.name}
        </h3>
        <div className="flex items-center justify-between w-full">
          <span className="text-[18px] font-extrabold text-slate-900 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              disabled={isInCart}
              className={cn(
                "w-[42px] h-[42px] rounded-[16px] flex items-center justify-center transition-all shrink-0",
                isInCart
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-skeuo-accent text-slate-900 shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95"
              )}
            >
              {isInCart ? <Check className="w-5 h-5" strokeWidth={2.5} /> : <Plus className="w-5 h-5" strokeWidth={2.5} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
