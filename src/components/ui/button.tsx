import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] active:shadow-skeuo-pressed",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-primary/90 to-primary text-primary-foreground hover:brightness-110 shadow-skeuo-raised border border-white/20",
        destructive:
          "bg-gradient-to-b from-destructive/90 to-destructive text-destructive-foreground hover:brightness-110 shadow-skeuo-raised border border-white/20",
        outline:
          "border-2 border-primary/10 bg-white/50 hover:bg-white/80 backdrop-blur-xl shadow-sm text-foreground",
        secondary:
          "bg-white text-secondary-foreground hover:bg-gray-50 shadow-skeuo-raised border border-black/5",
        ghost: "hover:bg-black/5 text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/60 hover:bg-white/90 text-primary border border-white/60 backdrop-blur-xl shadow-skeuo-raised",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-full px-4 text-xs",
        lg: "h-14 rounded-full px-10 text-base",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
