"use client";

import { motion } from "framer-motion";
import { IconCheck, IconBulb, IconEdit, IconBrandSpeedtest } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FactItem {
    id: string;
    label: string;
    value: string;
    type: "confirmed" | "inferred";
    confidence?: "none" | "low" | "medium" | "high";
}

export interface UnderstandingCardProps {
    title?: string;
    facts: FactItem[];
    onCorrect?: (id: string) => void;
    className?: string;
}

export function UnderstandingCard({
    title = "Here's what I understand so far:",
    facts,
    onCorrect,
    className
}: UnderstandingCardProps) {
    if (!facts || facts.length === 0) return null;

    const confirmed = facts.filter(f => f.type === "confirmed");
    const inferred = facts.filter(f => f.type === "inferred");

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className={cn(
                "relative my-4 overflow-hidden rounded-3xl border border-blue-500/10 bg-gradient-to-br from-blue-50/50 to-white p-5 md:p-6 shadow-xl shadow-blue-500/5",
                className
            )}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <IconBrandSpeedtest className="w-24 h-24 text-blue-500" />
            </div>

            <h4 className="text-sm font-semibold text-blue-950 mb-4">{title}</h4>

            <div className="space-y-3 relative z-10">
                {confirmed.map((fact, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={fact.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white p-3 pr-4 border border-blue-100 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                <IconCheck className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{fact.label}</span>
                                <span className="text-sm font-medium text-black">{fact.value}</span>
                            </div>
                        </div>
                        {onCorrect && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-full sm:w-auto rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-auto"
                                onClick={() => onCorrect(fact.id)}
                            >
                                <IconEdit className="h-3.5 w-3.5 mr-1.5" />
                                <span className="text-xs">Correct</span>
                            </Button>
                        )}
                    </motion.div>
                ))}

                {inferred.map((fact, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (confirmed.length + i) * 0.1 }}
                        key={fact.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-amber-50/50 p-3 pr-4 border border-amber-200/50 border-dashed transition-all hover:border-amber-400 hover:bg-amber-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                <IconBulb className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/60">{fact.label}</span>
                                    {fact.confidence && (
                                        <span className="text-[9px] font-semibold tracking-widest uppercase bg-amber-200/50 text-amber-700 px-1.5 py-0.5 rounded-full">
                                            {fact.confidence} confidence
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-amber-950">{fact.value}</span>
                            </div>
                        </div>
                        {onCorrect && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-full sm:w-auto rounded-xl text-amber-700 hover:bg-amber-100 hover:text-amber-800 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-auto"
                                onClick={() => onCorrect(fact.id)}
                            >
                                <IconEdit className="h-3.5 w-3.5 mr-1.5" />
                                <span className="text-xs">Verify</span>
                            </Button>
                        )}
                    </motion.div>
                ))}
            </div>

            {onCorrect && (
                <div className="mt-4 text-center">
                    <p className="text-[11px] font-medium text-blue-600/60 uppercase tracking-widest">Tap any item to correct</p>
                </div>
            )}
        </motion.div>
    );
}
