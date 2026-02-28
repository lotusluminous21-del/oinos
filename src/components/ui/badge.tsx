import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-white/20 bg-gradient-to-b from-primary/90 to-primary text-primary-foreground shadow-skeuo-raised",
        secondary:
          "border-white/40 bg-white text-secondary-foreground shadow-skeuo-raised ring-1 ring-black/5",
        destructive:
          "border-white/20 bg-gradient-to-b from-destructive/90 to-destructive text-destructive-foreground shadow-skeuo-raised",
        outline: "text-foreground border-black/10 shadow-sm bg-white/50",
        glass: "border-white/40 bg-white/60 text-foreground backdrop-blur-xl shadow-skeuo-raised ring-1 ring-black/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
