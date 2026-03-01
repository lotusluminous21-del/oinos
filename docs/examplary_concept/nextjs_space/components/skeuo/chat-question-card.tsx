'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Brain, ChevronRight, HelpCircle } from "lucide-react"
import type { Question } from "@/lib/types"

export interface ChatQuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  question: Question;
  onAnswer: (value: any) => void;
}

export function ChatQuestionCard({ question, onAnswer, className, ...props }: ChatQuestionCardProps) {
  const [showHelp, setShowHelp] = React.useState(false);
  const [textValue, setTextValue] = React.useState('');

  if (question.type === 'text') {
    return (
      <div className={cn("w-full space-y-3", className)} {...props}>
        <div className="skeuo-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-skeuo-pink" strokeWidth={2} />
            <h4 className="text-[16px] font-bold text-slate-800 tracking-tight">{question.text}</h4>
          </div>
          <div className="skeuo-inset rounded-[16px] p-1">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-transparent px-4 py-3 text-[15px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textValue.trim()) {
                  onAnswer(textValue.trim());
                }
              }}
            />
          </div>
          <button
            onClick={() => textValue.trim() && onAnswer(textValue.trim())}
            disabled={!textValue.trim()}
            className={cn(
              "w-full h-[48px] rounded-[24px] font-bold text-[16px] transition-all duration-300",
              textValue.trim()
                ? "bg-skeuo-accent text-slate-900 shadow-skeuo-button active:shadow-skeuo-button-active active:scale-[0.98]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            Submit
          </button>
        </div>
        {question.helpText && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-700"
          >
            <HelpCircle className="w-4 h-4" />
            Not sure?
          </button>
        )}
        {showHelp && question.helpText && (
          <p className="text-[13px] text-slate-500 pl-6">{question.helpText}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      <div className="flex items-center gap-3 mb-2">
        <Brain className="w-6 h-6 text-skeuo-pink" strokeWidth={2} />
        <h4 className="text-[16px] font-bold text-slate-800 tracking-tight">{question.text}</h4>
      </div>
      
      <div className="space-y-2">
        {question.options?.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswer(option.value)}
            className="option-card w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              {option.icon && (
                <span className="text-xl">{option.icon}</span>
              )}
              <div>
                <p className="text-[15px] font-bold text-slate-800 tracking-tight">{option.label}</p>
                {option.description && (
                  <p className="text-[13px] font-medium text-slate-500 mt-0.5">{option.description}</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" strokeWidth={2} />
          </button>
        ))}
      </div>

      {question.helpText && (
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-700 mt-2"
        >
          <HelpCircle className="w-4 h-4" />
          Not sure?
        </button>
      )}
      {showHelp && question.helpText && (
        <p className="text-[13px] text-slate-500 pl-6">{question.helpText}</p>
      )}
    </div>
  )
}
