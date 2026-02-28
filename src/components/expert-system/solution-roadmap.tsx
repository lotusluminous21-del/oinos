"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
    IconChecklist,
    IconClockHour4,
    IconTool,
    IconAlertTriangle,
    IconBulb,
    IconChevronDown,
    IconPlus,
    IconShoppingCart
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useProducts } from "@/hooks/useShopifyProducts";
import { useMemo } from "react";

export interface SolutionStepProps {
    order: number;
    title: string;
    description: string;
    tips?: string[];
    warnings?: string[];
    products?: string[]; // Array of Shopify product handles
}

export interface SolutionRoadmapProps {
    title: string;
    estimatedTime: string;
    difficulty: string;
    assumptions?: string[];
    steps: SolutionStepProps[];
    className?: string;
    onAddToCartAll?: () => void;
}

export function SolutionRoadmap({
    title,
    estimatedTime,
    difficulty,
    assumptions,
    steps,
    className,
    onAddToCartAll
}: SolutionRoadmapProps) {
    const [expandedStep, setExpandedStep] = useState<number | null>(1);

    const toggleStep = (stepOrder: number) => {
        setExpandedStep(prev => prev === stepOrder ? null : stepOrder);
    };

    // Sub-component for fetching products within a step
    const StepProducts = ({ handles }: { handles: string[] }) => {
        const query = useMemo(() => {
            if (!handles || handles.length === 0) return "";
            return handles.map(h => `handle:${h}`).join(" OR ");
        }, [handles]);

        const { products, loading } = useProducts({ query });

        if (loading) {
            return (
                <div className="flex gap-4 overflow-hidden py-2">
                    <div className="h-48 w-40 shrink-0 animate-pulse bg-white/5 border border-white/10 rounded-xl" />
                    <div className="h-48 w-40 shrink-0 animate-pulse bg-white/5 border border-white/10 rounded-xl" />
                </div>
            );
        }

        if (!products || products.length === 0) {
            return <p className="text-white/40 text-sm italic">Items currently unavailable.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                ))}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "w-full flex flex-col gap-6 mt-6 pb-4",
                className
            )}
        >
            {/* Header / Summary Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 text-white shadow-2xl">
                <div className="absolute -right-12 -top-12 opacity-10">
                    <IconChecklist className="w-48 h-48" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                            Roadmap Ready
                        </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-balance">
                        {title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md">
                            <IconClockHour4 className="w-4 h-4 text-emerald-400" />
                            <span>{estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md">
                            <IconTool className="w-4 h-4 text-amber-400" />
                            <span>Difficulty: {difficulty}</span>
                        </div>
                    </div>

                    {assumptions && assumptions.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-white/10">
                            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Assumptions Made</p>
                            <ul className="text-sm text-white/70 space-y-1">
                                {assumptions.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-white/30 mt-2 shrink-0" />
                                        <span className="italic">{a}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Steps Accordion */}
            <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold tracking-widest uppercase text-white/60 ml-2 mt-4 mb-2">
                    Step-by-Step Guide
                </h4>

                {steps.map((step) => {
                    const isExpanded = expandedStep === step.order;

                    return (
                        <div
                            key={step.order}
                            className={cn(
                                "flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-300 backdrop-blur-md",
                                isExpanded
                                    ? "border-white/20 bg-white/10 shadow-xl shadow-black/20"
                                    : "border-transparent bg-white/5 hover:bg-white/10 cursor-pointer"
                            )}
                        >
                            <div
                                className="flex items-center justify-between p-5 md:p-6"
                                onClick={() => toggleStep(step.order)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                                        isExpanded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/10 text-white"
                                    )}>
                                        {step.order}
                                    </div>
                                    <h5 className={cn(
                                        "font-semibold transition-colors",
                                        isExpanded ? "text-lg text-white" : "text-base text-white/70"
                                    )}>
                                        {step.title}
                                    </h5>
                                </div>
                                <div className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                                    isExpanded ? "bg-white/10 text-white rotate-180" : "bg-transparent text-white/50"
                                )}>
                                    <IconChevronDown className="h-5 w-5" />
                                </div>
                            </div>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-5 pb-6 md:px-6 md:pb-8 pt-0">
                                            <p className="text-white/80 leading-relaxed mb-6 font-medium text-balance">
                                                {step.description}
                                            </p>

                                            {/* Tips & Warnings Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                {step.tips && step.tips.length > 0 && (
                                                    <div className="bg-emerald-500/10 rounded-2xl p-4 md:p-5 border border-emerald-500/20 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-3 text-emerald-300">
                                                            <IconBulb className="h-5 w-5" />
                                                            <h6 className="font-bold text-sm">Pro Tips</h6>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {step.tips.map((tip, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-emerald-100/80">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                                    <span className="leading-snug">{tip}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {step.warnings && step.warnings.length > 0 && (
                                                    <div className="bg-rose-500/10 rounded-2xl p-4 md:p-5 border border-rose-500/20 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-3 text-rose-300">
                                                            <IconAlertTriangle className="h-5 w-5" />
                                                            <h6 className="font-bold text-sm">Important</h6>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {step.warnings.map((warn, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-rose-100/80">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                                    <span className="leading-snug">{warn}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step Products */}
                                            {step.products && step.products.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-white/10">
                                                    <h6 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                                                        Items for this step
                                                    </h6>
                                                    <StepProducts handles={step.products} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Action Footer */}
            {onAddToCartAll && (
                <div className="mt-8 flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] text-center">
                    <IconShoppingCart className="w-8 h-8 text-white/40 mb-3" />
                    <h4 className="text-lg font-bold text-white mb-2">Complete Shopping List</h4>
                    <p className="text-sm text-white/60 max-w-sm mb-6 text-balance">
                        Get everything you need for this project shipped directly to you.
                    </p>
                    <Button
                        size="lg"
                        className="w-full sm:w-auto rounded-xl px-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-500/20"
                        onClick={onAddToCartAll}
                    >
                        Add All to Cart
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
