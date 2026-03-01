import * as React from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

export interface QuantitySelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
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
        "shadow-skeuo-raised",
        className
      )}
      {...props}
    >
      <button 
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all outline-none",
          "text-slate-700 active:text-slate-900 active:scale-95 active:shadow-skeuo-inset",
          value <= min && "opacity-40 cursor-not-allowed"
        )}
      >
        <Minus className="w-[16px] h-[16px]" strokeWidth={2.5} />
      </button>
      <span className="text-[16px] font-bold text-slate-800 w-6 text-center leading-none">
        {value}
      </span>
      <button 
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all outline-none",
          "text-slate-700 active:text-slate-900 active:scale-95 active:shadow-skeuo-inset",
          value >= max && "opacity-40 cursor-not-allowed"
        )}
      >
        <Plus className="w-[16px] h-[16px]" strokeWidth={2.5} />
      </button>
    </div>
  )
}
