"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Home, CheckCircle2, ShoppingCart, MessageSquareText, User } from "lucide-react"

export interface BottomNavProps extends React.HTMLAttributes<HTMLDivElement> { }

export function BottomNav({ className, ...props }: BottomNavProps) {
    const [activeTab, setActiveTab] = useState<"home" | "check" | "cart" | "chat" | "profile">("home")

    // Helper to render the diamond pip only for the active tab
    const renderPip = (tab: string) => (
        <div
            className={cn(
                "absolute -bottom-[10px] w-1.5 h-1.5 rotate-45 rounded-[1px] transition-all duration-300",
                activeTab === tab ? "bg-slate-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)] opacity-100 scale-100" : "bg-transparent opacity-0 scale-0"
            )}
        />
    )

    return (
        <div
            className={cn(
                "relative w-full max-w-[420px] h-[64px] pb-[8px] flex items-center justify-between px-6",
                "bg-[#F0F2F6] rounded-none", // Removed corner curvature as requested
                "shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.03),-1px_-1px_2px_rgba(255,255,255,1)]",
                className
            )}
            {...props}
        >
            {/* Home */}
            <button
                onClick={() => setActiveTab("home")}
                className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
            >
                <Home
                    className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "home" ? "text-slate-800 fill-slate-800" : "text-slate-500 fill-transparent group-hover:text-slate-700")}
                    strokeWidth={1.5}
                />
                {renderPip("home")}
            </button>

            {/* Check/Tasks */}
            <button
                onClick={() => setActiveTab("check")}
                className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
            >
                <CheckCircle2
                    className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "check" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700")}
                    strokeWidth={activeTab === "check" ? 2.5 : 1.5}
                />
                {renderPip("check")}
            </button>

            {/* Center Floating Cart */}
            <div className="relative flex justify-center w-[60px] h-full z-10">
                <button
                    onClick={() => setActiveTab("cart")}
                    className={cn(
                        "absolute -top-[16px] left-1/2 -translate-x-1/2 w-[64px] h-[64px] rounded-full flex items-center justify-center outline-none transition-all duration-300",
                        "bg-[#F0F2F6]",
                        "shadow-[8px_8px_16px_rgba(0,0,0,0.06),-8px_-8px_16px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
                        activeTab === "cart" && "scale-[0.96] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]"
                    )}
                >
                    <ShoppingCart className={cn("w-[26px] h-[26px] transition-colors drop-shadow-sm", activeTab === "cart" ? "text-slate-900" : "text-slate-700")} strokeWidth={2.2} />
                </button>
            </div>

            {/* Messages */}
            <button
                onClick={() => setActiveTab("chat")}
                className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
            >
                <MessageSquareText
                    className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "chat" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700")}
                    strokeWidth={activeTab === "chat" ? 2.5 : 1.5}
                />
                {renderPip("chat")}
            </button>

            {/* Profile */}
            <button
                onClick={() => setActiveTab("profile")}
                className="relative flex flex-col items-center justify-center w-[50px] outline-none group"
            >
                <User
                    className={cn("w-[26px] h-[26px] transition-all duration-300 drop-shadow-sm", activeTab === "profile" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700")}
                    strokeWidth={activeTab === "profile" ? 2.5 : 1.5}
                />
                {renderPip("profile")}
            </button>
        </div>
    )
}
