"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain, ChevronRight } from "lucide-react";

export interface QuestionOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface ChatQuestionCardProps {
  title: string;
  question: string;
  options?: QuestionOption[];
  helpText?: string;
  onSelectOption?: (optionId: string) => void;
  className?: string;
}

export function ChatQuestionCard({
  title,
  question,
  options,
  helpText,
  onSelectOption,
  className,
}: ChatQuestionCardProps) {
  const [showHelp, setShowHelp] = React.useState(false);

  if (options && options.length > 0) {
    return (
      <div className={cn("w-full space-y-3", className)}>
        <div className="flex items-start gap-[14px] mb-4">
          <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.9)] shrink-0">
            <Brain
              className="w-[22px] h-[22px] text-skeuo-pink drop-shadow-[0_2px_2px_rgba(219,39,119,0.3)]"
              strokeWidth={2.5}
            />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-slate-700 leading-[1.3]">
              {question}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectOption?.(option.id)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-[20px] bg-skeuo-bg transition-all duration-300",
                "shadow-[5px_5px_10px_rgba(0,0,0,0.05),-5px_-5px_10px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
                "hover:shadow-[6px_6px_12px_rgba(0,0,0,0.07),-6px_-6px_12px_rgba(255,255,255,0.9)]",
                "active:scale-[0.97] active:shadow-skeuo-inset"
              )}
            >
              {option.icon && (
                <span className="text-2xl mb-2">{option.icon}</span>
              )}
              <span className="text-[14px] font-bold text-slate-800 text-center">
                {option.label}
              </span>
              {option.description && (
                <span className="text-[12px] text-slate-500 text-center mt-1">
                  {option.description}
                </span>
              )}
            </button>
          ))}
        </div>

        {helpText && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-[13px] font-semibold text-slate-500 mt-2"
          >
            Not sure?
          </button>
        )}
        {showHelp && helpText && (
          <p className="text-[13px] text-slate-500 bg-white/50 p-3 rounded-xl">
            {helpText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between p-4 px-5 rounded-[24px] bg-skeuo-bg cursor-pointer transition-all duration-300",
        "shadow-[6px_6px_12px_rgba(0,0,0,0.06),-6px_-6px_12px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]",
        "hover:shadow-[8px_8px_16px_rgba(0,0,0,0.08),-8px_-8px_16px_rgba(255,255,255,0.9),2px_2px_4px_rgba(0,0,0,0.03),-2px_-2px_4px_rgba(255,255,255,1)]",
        "active:scale-[0.98] active:shadow-skeuo-inset",
        className
      )}
    >
      <div className="flex items-center gap-[18px]">
        <Brain
          className="w-[42px] h-[42px] text-skeuo-pink drop-shadow-[0_4px_4px_rgba(219,39,119,0.35)] shrink-0"
          strokeWidth={1.5}
        />
        <div className="flex flex-col text-left">
          <h4 className="text-[16px] font-bold text-slate-800 tracking-tight leading-[1.2]">
            {title}
          </h4>
          <p className="text-[14px] font-semibold text-slate-600 tracking-tight mt-[6px] leading-[1.2] pb-0.5">
            {question}
          </p>
        </div>
      </div>
      <ChevronRight
        className="w-[22px] h-[22px] text-slate-700 shrink-0 ml-3"
        strokeWidth={2.5}
      />
    </div>
  );
}
