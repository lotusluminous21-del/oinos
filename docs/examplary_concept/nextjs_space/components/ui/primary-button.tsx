import * as React from "react";
import { cn } from "@/lib/utils";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "sm" | "lg";
}

export function PrimaryButton({
  className,
  children,
  size = "default",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "w-full rounded-[28px] flex items-center justify-center transition-all duration-300 active:scale-[0.98] outline-none",
        "bg-skeuo-accent text-slate-900 font-bold tracking-tight",
        "shadow-[0_4px_14px_rgba(0,212,202,0.4),inset_1px_1px_2px_rgba(255,255,255,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.05)]",
        "active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),inset_-2px_-2px_6px_rgba(255,255,255,0.2)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        size === "default" && "h-[56px] text-[18px]",
        size === "sm" && "h-[42px] text-[15px]",
        size === "lg" && "h-[64px] text-[20px]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
