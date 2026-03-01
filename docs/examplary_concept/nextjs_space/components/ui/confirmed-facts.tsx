import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface ConfirmedFactsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  facts: string[];
  onCorrect?: () => void;
}

export function ConfirmedFacts({
  facts,
  onCorrect,
  className,
  ...props
}: ConfirmedFactsProps) {
  return (
    <div
      className={cn("flex flex-col gap-3.5 w-full pl-[5px]", className)}
      {...props}
    >
      <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">
        Confirmed Facts
      </h3>
      <div className="flex flex-col gap-3">
        {facts.map((fact, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-[20px] h-[20px] rounded-full bg-skeuo-accent flex items-center justify-center shrink-0 shadow-[0_2px_4px_rgba(0,212,202,0.3)]">
              <Check className="w-[12px] h-[12px] text-white" strokeWidth={4} />
            </div>
            <span className="text-[14.5px] font-semibold text-slate-700 tracking-tight leading-tight">
              {fact}
            </span>
          </div>
        ))}
      </div>
      {onCorrect && (
        <button
          onClick={onCorrect}
          className="text-[14px] font-bold text-slate-800 self-start mt-1 tracking-tight hover:underline underline-offset-4"
        >
          Correction link
        </button>
      )}
    </div>
  );
}
