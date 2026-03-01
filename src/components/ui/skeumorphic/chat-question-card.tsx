'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Brain, ChevronRight, HelpCircle, PenLine } from "lucide-react"
import type { ExpertQuestion } from "@/lib/expert/types"

export interface ChatQuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
    question: ExpertQuestion;
    onAnswer: (value: any) => void;
    /** Brief AI acknowledgment text shown above the question */
    context?: string;
}

export function ChatQuestionCard({ question, onAnswer, context, className, ...props }: ChatQuestionCardProps) {
    const [showHelp, setShowHelp] = React.useState(false);
    const [textValue, setTextValue] = React.useState('');
    // For multiple-choice: user can toggle to free-text mode
    const [freeTextMode, setFreeTextMode] = React.useState(question.type === 'text');

    const handleTextSubmit = () => {
        const val = textValue.trim();
        if (val) onAnswer(val);
    };

    const TextInput = (
        <div className="space-y-2">
            <div className="skeuo-inset rounded-[16px] p-1">
                <input
                    type="text"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Γράψτε ελεύθερα..."
                    className="w-full bg-transparent px-4 py-3 text-[15px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
                />
            </div>
            <button
                onClick={handleTextSubmit}
                disabled={!textValue.trim()}
                className={cn(
                    "w-full h-[48px] rounded-[24px] font-bold text-[16px] transition-all duration-300",
                    textValue.trim()
                        ? "bg-skeuo-accent text-slate-900 shadow-skeuo-button active:shadow-skeuo-button-active active:scale-[0.98]"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
            >
                Υποβολή
            </button>
        </div>
    );

    return (
        <div className={cn("w-full space-y-3", className)} {...props}>
            <div className="skeuo-card p-4 space-y-3">

                {/* AI acknowledgment context */}
                {context && (
                    <p className="text-[13px] text-slate-500 font-semibold leading-snug pb-2 border-b border-slate-100">
                        {context}
                    </p>
                )}

                {/* Question header */}
                <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-pink-600 flex-shrink-0" strokeWidth={2} />
                    <h4 className="text-[16px] font-bold text-slate-800 tracking-tight">{question.text}</h4>
                </div>

                {/* Options OR free-text input */}
                {!freeTextMode && question.options && question.options.length > 0 ? (
                    <div className="space-y-2">
                        {question.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => onAnswer(option.id)}
                                className="option-card w-full flex items-center justify-between text-left"
                            >
                                <div>
                                    <p className="text-[15px] font-bold text-slate-800 tracking-tight">{option.label}</p>
                                    {option.description && (
                                        <p className="text-[13px] font-medium text-slate-500 mt-0.5">{option.description}</p>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" strokeWidth={2} />
                            </button>
                        ))}

                        {/* Always-present free-text escape hatch */}
                        <button
                            onClick={() => setFreeTextMode(true)}
                            className="w-full flex items-center gap-2 px-4 py-3 rounded-[16px] border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors text-[14px] font-semibold"
                        >
                            <PenLine className="w-4 h-4" strokeWidth={2} />
                            Άλλο / Δεν ξέρω — γράψτε ελεύθερα
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Back to options if applicable */}
                        {question.options && question.options.length > 0 && question.type !== 'text' && (
                            <button
                                onClick={() => setFreeTextMode(false)}
                                className="text-[13px] font-semibold text-slate-400 hover:text-slate-600 mb-1"
                            >
                                ← Πίσω στις επιλογές
                            </button>
                        )}
                        {TextInput}
                    </>
                )}
            </div>

            {/* Help text toggle */}
            {question.help_text && (
                <>
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-700"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Πώς να το βρείτε;
                    </button>
                    {showHelp && (
                        <p className="text-[13px] text-slate-500 pl-6 leading-relaxed">{question.help_text}</p>
                    )}
                </>
            )}
        </div>
    );
}
