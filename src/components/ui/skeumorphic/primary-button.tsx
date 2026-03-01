import * as React from "react"
import { cn } from "@/lib/utils"

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export function PrimaryButton({ className, children, ...props }: PrimaryButtonProps) {
    return (
        <button
            className={cn(
                "w-full h-[56px] rounded-[28px] flex items-center justify-center transition-all duration-300 active:scale-[0.98] outline-none",
                "bg-primary text-primary-foreground text-[18px] font-bold tracking-tight",
                "shadow-[0_4px_14px_hsl(var(--primary)/0.4),inset_1px_1px_2px_rgba(255,255,255,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.05)]",
                "active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),inset_-2px_-2px_6px_rgba(255,255,255,0.2)]",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
