"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

export interface ProductGalleryProps
  extends React.HTMLAttributes<HTMLDivElement> {
  images?: string[];
  productName?: string;
}

export function ProductGallery({
  images = [],
  productName = "Product",
  className,
  ...props
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const hasImages = images.length > 0;

  return (
    <div
      className={cn("flex flex-col items-center w-full", className)}
      {...props}
    >
      <div
        className={cn(
          "w-full aspect-[4/3.5] rounded-[32px] bg-skeuo-bg",
          "shadow-[8px_8px_16px_rgba(0,0,0,0.06),-8px_-8px_16px_rgba(255,255,255,0.8),2px_2px_4px_rgba(0,0,0,0.03),-2px_-2px_4px_rgba(255,255,255,1)]",
          "flex items-center justify-center p-6 relative overflow-hidden"
        )}
      >
        {hasImages ? (
          <div className="relative w-full h-full">
            <Image
              src={images[activeIndex]}
              alt={productName}
              fill
              className="object-contain drop-shadow-[5px_5px_10px_rgba(0,0,0,0.15)]"
            />
          </div>
        ) : (
          <div className="w-[120px] h-[160px] bg-gradient-to-br from-slate-200 to-slate-300 rounded-[12px] flex items-center justify-center shadow-inner">
            <Package className="w-14 h-14 text-slate-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-[10px] mt-[20px]">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "w-[7px] h-[7px] rounded-full transition-all duration-300",
                i === activeIndex
                  ? "bg-slate-900 scale-[1.2] shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                  : "bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
