import * as React from "react"
import { cn } from "@/lib/utils"
import { Brain, ChevronRight } from "lucide-react"

export interface ChatQuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    question: string;
}

export function ChatQuestionCard({ title, question, className, ...props }: ChatQuestionCardProps) {
    return (
        <div
            className={cn(
                "w-full flex items-center justify-between p-4 px-5 rounded-[24px] bg-[#F0F2F6] cursor-pointer transition-all duration-300",
                "shadow-[6px_6px_12px_rgba(0,0,0,0.06),-6px_-6px_12px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
                "hover:shadow-[8px_8px_16px_rgba(0,0,0,0.08),-8px_-8px_16px_rgba(255,255,255,0.9),2px_2px_4px_rgba(0,0,0,0.03),-2px_-2px_4px_rgba(255,255,255,1)]",
                "active:scale-[0.98] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]",
                className
            )}
            {...props}
        >
            <div className="flex items-center gap-[18px]">
                <Brain className="w-[42px] h-[42px] text-[#db2777] drop-shadow-[0_4px_4px_rgba(219,39,119,0.35)] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col text-left">
                    <h4 className="text-[16px] font-bold text-slate-800 tracking-tight leading-[1.2]">{title}</h4>
                    <p className="text-[14px] font-semibold text-slate-600 tracking-tight mt-[6px] leading-[1.2] pb-0.5">{question}</p>
                </div>
            </div>
            <ChevronRight className="w-[22px] h-[22px] text-slate-700 shrink-0 ml-3" strokeWidth={2.5} />
        </div>
    )
}
