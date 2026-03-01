import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  active?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, children, icon, active, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-[6px] px-[16px] h-[38px] rounded-full shrink-0 cursor-pointer transition-all duration-300",
          "bg-skeuo-bg",
          active
            ? "shadow-skeuo-inset"
            : "shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
          "text-[14px] font-bold tracking-tight",
          active ? "text-slate-900" : "text-slate-700",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
        <span>{children}</span>
      </div>
    );
  }
);
Chip.displayName = "Chip";

export { Chip };
