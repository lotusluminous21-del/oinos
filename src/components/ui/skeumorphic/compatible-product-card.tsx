import * as React from "react"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"

export interface CompatibleProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
}

export function CompatibleProductCard({ title, className, ...props }: CompatibleProductCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-between p-3 pb-[14px] shrink-0 w-[124px] h-[156px] cursor-pointer",
                "rounded-[24px] bg-[#F0F2F6] transition-all duration-300",
                "shadow-[5px_5px_10px_rgba(0,0,0,0.05),-5px_-5px_10px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
                "hover:shadow-[7px_7px_14px_rgba(0,0,0,0.07),-7px_-7px_14px_rgba(255,255,255,0.9),2px_2px_3px_rgba(0,0,0,0.03),-2px_-2px_3px_rgba(255,255,255,1)]",
                "active:scale-[0.97] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]",
                className
            )}
            {...props}
        >
            <div className="w-full flex-1 flex items-center justify-center opacity-80 pt-1 pb-1">
                <div className="w-[52px] h-[64px] bg-gradient-to-br from-slate-200 to-slate-300 rounded-[8px] flex items-center justify-center shadow-inner">
                    <Package className="w-6 h-6 text-slate-400" />
                </div>
            </div>
            <span className="text-[14px] font-bold text-slate-800 text-center leading-[1.2] tracking-tight line-clamp-2 mt-2">
                {title}
            </span>
        </div>
    )
}
