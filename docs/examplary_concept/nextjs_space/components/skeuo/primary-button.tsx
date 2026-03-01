import * as React from "react"
import { cn } from "@/lib/utils"

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function PrimaryButton({ className, children, variant = 'default', size = 'default', ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center justify-center transition-all duration-300 active:scale-[0.98] outline-none font-bold tracking-tight",
        // Size variants
        size === 'default' && "w-full h-[56px] rounded-[28px] text-[18px]",
        size === 'sm' && "h-[44px] px-6 rounded-[22px] text-[15px]",
        size === 'lg' && "w-full h-[64px] rounded-[32px] text-[20px]",
        // Color variants
        variant === 'default' && [
          "bg-skeuo-accent text-slate-900",
          "shadow-[0_4px_14px_rgba(0,212,202,0.4),inset_1px_1px_2px_rgba(255,255,255,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.05)]",
          "active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),inset_-2px_-2px_6px_rgba(255,255,255,0.2)]",
        ],
        variant === 'secondary' && [
          "bg-skeuo-bg text-slate-800",
          "shadow-skeuo-raised",
          "active:shadow-skeuo-inset",
        ],
        variant === 'outline' && [
          "bg-transparent text-slate-700 border-2 border-slate-300",
          "hover:border-skeuo-accent hover:text-skeuo-accent-dark",
        ],
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
