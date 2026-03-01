"use client";

import * as React from "react";
import { Search, Camera, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SmartSearchBarProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void;
  showIcons?: boolean;
}

export const SmartSearchBar = React.forwardRef<
  HTMLInputElement,
  SmartSearchBarProps
>(({ className, onSearch, showIcons = false, ...props }, ref) => {
  const [value, setValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full p-[4px] rounded-full",
          "bg-skeuo-bg",
          "shadow-[5px_5px_10px_rgba(0,0,0,0.05),-5px_-5px_10px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]"
        )}
      >
        <div
          className={cn(
            "relative flex items-center w-full h-[56px] rounded-full",
            "bg-skeuo-bg",
            "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.7),inset_1px_1px_2px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]"
          )}
        >
          <input
            type="text"
            className={cn(
              "flex-1 bg-transparent border-none outline-none pl-7 pr-3 h-full",
              "text-[15.5px] font-[600] text-slate-500 placeholder:text-slate-400/90",
              "selection:bg-slate-200"
            )}
            placeholder="Smart Search Bar"
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            {...props}
          />

          <div className="flex items-center gap-1 pr-[4px]">
            {showIcons && (
              <>
                <button
                  type="button"
                  className="h-[40px] w-[40px] rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Mic className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  className="h-[40px] w-[40px] rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Camera className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </>
            )}
            <button
              type="submit"
              className={cn(
                "h-[48px] w-[48px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                "bg-skeuo-bg",
                "shadow-[3px_3px_6px_rgba(0,0,0,0.07),-3px_-3px_6px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
                "hover:bg-[#EAECEF] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,1),2px_2px_3px_rgba(0,0,0,0.03),-2px_-2px_3px_rgba(255,255,255,1)]",
                "active:scale-[0.97] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.06),inset_-2px_-2px_5px_rgba(255,255,255,0.7),inset_1px_1px_2px_rgba(0,0,0,0.05),inset_-1px_-1px_2px_rgba(255,255,255,0.9)]",
                "text-slate-600 hover:text-slate-800"
              )}
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
});
SmartSearchBar.displayName = "SmartSearchBar";
