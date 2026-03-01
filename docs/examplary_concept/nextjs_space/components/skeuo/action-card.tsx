import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ActionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const ActionCard = React.forwardRef<HTMLButtonElement, ActionCardProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center outline-none transition-all duration-300",
          "rounded-[24px] bg-skeuo-bg",
          "shadow-[6px_6px_12px_rgba(0,0,0,0.06),-6px_-6px_12px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
          "hover:shadow-[8px_8px_16px_rgba(0,0,0,0.08),-8px_-8px_16px_rgba(255,255,255,0.9),2px_2px_4px_rgba(0,0,0,0.03),-2px_-2px_4px_rgba(255,255,255,1)]",
          "active:scale-[0.97] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]",
          className
        )}
        {...props}
      />
    )
  }
)
ActionCard.displayName = "ActionCard"

export { ActionCard }
