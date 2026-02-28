"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconChevronRight, IconHelpCircle, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface QuestionOption {
    id: string;
    label: string;
    value?: string;
    description?: string;
    icon?: React.ReactNode;
}

export interface QuestionCardProps {
    text: string;
    helpText?: string;
    options?: QuestionOption[];
    onSelect: (value: string) => void;
    className?: string;
}

export function QuestionCard({ text, helpText, options, onSelect, className }: QuestionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "relative mt-6 overflow-hidden rounded-3xl border border-black/[0.08] bg-white p-6 shadow-2xl shadow-black-[0.03]",
                className
            )}
        >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-50" />

            <div className="flex items-start gap-3 mb-6">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <IconSparkles className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="text-base font-semibold text-black leading-tight mb-1 shrink-0">{text}</h4>
                    {helpText && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <IconHelpCircle className="h-3.5 w-3.5" />
                            <p>{helpText}</p>
                        </div>
                    )}
                </div>
            </div>

            {options && options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {options.map((opt, i) => (
                        <motion.div
                            key={opt.id || `opt-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                            <Button
                                variant="outline"
                                className="group relative flex h-auto w-full items-center justify-between gap-4 rounded-2xl border-black/[0.08] bg-white px-5 py-4 text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-50/50 hover:shadow-md hover:-translate-y-0.5"
                                onClick={() => onSelect(opt.value || opt.id || opt.label)}
                            >
                                <div className="flex items-center gap-4">
                                    {opt.icon && (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.03] text-black group-hover:bg-white group-hover:text-emerald-600 group-hover:shadow-sm transition-all">
                                            {opt.icon}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-black group-hover:text-emerald-950 transition-colors">{opt.label}</span>
                                        {opt.description && (
                                            <span className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{opt.description}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 opacity-0 transition-all group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:opacity-100">
                                    <IconChevronRight className="h-3 w-3" />
                                </div>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
