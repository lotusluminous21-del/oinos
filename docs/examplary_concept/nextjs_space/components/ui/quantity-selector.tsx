"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

export interface QuantitySelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  onValueChange?: (val: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  className,
  value = 1,
  onValueChange,
  min = 1,
  max = 99,
  ...props
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min && onValueChange) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && onValueChange) {
      onValueChange(value + 1);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-between px-2 h-[42px] min-w-[104px] rounded-full bg-skeuo-bg",
        "shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
        className
      )}
      {...props}
    >
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 active:text-slate-900 active:scale-95 transition-all outline-none active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] disabled:opacity-40"
      >
        <Minus className="w-[16px] h-[16px]" strokeWidth={2.5} />
      </button>
      <span className="text-[16px] font-bold text-slate-800 w-5 text-center leading-none">
        {value}
      </span>
      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 active:text-slate-900 active:scale-95 transition-all outline-none active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] disabled:opacity-40"
      >
        <Plus className="w-[16px] h-[16px]" strokeWidth={2.5} />
      </button>
    </div>
  );
}
