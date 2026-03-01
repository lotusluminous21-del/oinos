import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ShoppingCart, Plus } from "lucide-react";
import { PrimaryButton } from "./primary-button";

export interface EmptyCartStateProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyCartState({ className, ...props }: EmptyCartStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full min-h-[400px] text-center px-6",
        className
      )}
      {...props}
    >
      <div className="relative mb-8 flex items-center justify-center w-[160px] h-[160px]">
        <ShoppingCart
          className="w-[100px] h-[100px] text-skeuo-bg"
          strokeWidth={2.5}
          style={{
            filter: `
              drop-shadow(2px 2px 1.5px rgba(0,0,0,0.2))
              drop-shadow(-2px -2px 1.5px rgba(255,255,255,1))
              drop-shadow(8px 8px 14px rgba(0,0,0,0.08))
              drop-shadow(-8px -8px 14px rgba(255,255,255,0.8))
            `,
          }}
        />
        <div
          className={cn(
            "absolute top-[20px] right-[10px] w-[38px] h-[38px] rounded-full flex items-center justify-center",
            "bg-skeuo-accent",
            "shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(255,255,255,0.4)]"
          )}
        >
          <Plus className="w-[20px] h-[20px] text-slate-900" strokeWidth={3} />
        </div>
      </div>

      <h2 className="text-[20px] font-bold text-slate-800 tracking-tight leading-tight mb-2">
        Your cart is empty
      </h2>
      <p className="text-[15px] font-medium text-slate-500 max-w-[280px] leading-[1.4] tracking-tight mb-8">
        Add some products to get started with your project
      </p>

      <div className="w-full max-w-[280px] space-y-3">
        <Link href="/categories">
          <PrimaryButton>Start Shopping</PrimaryButton>
        </Link>
        <Link href="/expert">
          <button className="w-full h-[48px] rounded-[24px] text-[16px] font-bold text-slate-700 bg-skeuo-bg shadow-skeuo-card hover:shadow-skeuo-card-hover transition-all">
            Get Expert Help
          </button>
        </Link>
      </div>
    </div>
  );
}
