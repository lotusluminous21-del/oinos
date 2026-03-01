'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ShieldAlert } from "lucide-react"

export interface SafetyWarningBannerProps extends React.HTMLAttributes<HTMLDivElement> {
    warnings: string[];
}

export function SafetyWarningBanner({ warnings, className, ...props }: SafetyWarningBannerProps) {
    if (!warnings || warnings.length === 0) return null;

    return (
        <div
            className={cn(
                "rounded-2xl px-4 py-3 space-y-2",
                "bg-orange-50/80 border border-orange-100",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-2 text-orange-600 text-[11px] font-black uppercase tracking-widest">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                Προειδοποιήσεις Ασφαλείας
            </div>
            <ul className="space-y-1.5">
                {warnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] font-semibold text-orange-800">
                        <span className="text-orange-400 text-base leading-5 flex-shrink-0">!</span>
                        <span className="leading-snug">{warning}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
