import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-[14px]", className)}>
      <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)] shrink-0">
        <Brain
          className="w-[22px] h-[22px] text-skeuo-pink drop-shadow-[0_2px_2px_rgba(219,39,119,0.3)]"
          strokeWidth={2.5}
        />
      </div>
      <div className="px-5 py-4 rounded-[24px] rounded-tl-[8px] bg-skeuo-bg shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
        </div>
      </div>
    </div>
  );
}
