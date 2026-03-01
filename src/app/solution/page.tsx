'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Clock,
    Star,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    ShoppingCart,
    Check,
    AlertTriangle,
    Lightbulb,
    Plus,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useExpertStore } from '@/lib/expert/store';
import { Header, BottomNav, PrimaryButton, Chip } from '@/components/ui/skeumorphic';
import { cn } from '@/lib/utils';

const formatPrice = (price: number | undefined | null) => {
    const val = typeof price === 'number' && !isNaN(price) ? price : 0;
    return new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: 'EUR',
    }).format(val);
};

export default function SolutionPage() {
    const router = useRouter();
    const solution = useExpertStore(state => state.solution);
    const resetSession = useExpertStore(state => state.resetSession);

    const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);

    if (!solution) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-skeuo-bg p-6 font-sans">
                <div className="skeuo-card p-10 text-center space-y-6 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                        <span className="text-4xl">📝</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Δεν υπάρχει πλάνο επισκευής</h2>
                        <p className="text-sm text-slate-500 font-bold">Άρχιστε περιγράφοντας το έργο σας στον ειδικό μας</p>
                    </div>
                    <PrimaryButton onClick={() => router.push('/expert')}>
                        Έναρξη Expert Guide
                    </PrimaryButton>
                </div>
            </div>
        );
    }

    const toggleStep = (stepOrder: number) => {
        setExpandedSteps(prev =>
            prev.includes(stepOrder)
                ? prev.filter(s => s !== stepOrder)
                : [...prev, stepOrder]
        );
    };

    const difficultyColors: Record<string, string> = {
        beginner: 'text-green-600',
        intermediate: 'text-amber-600',
        advanced: 'text-orange-600',
    };

    return (
        <div className="min-h-screen bg-skeuo-bg pb-32 font-sans">
            <div className="hidden md:block">
                <Header />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-skeuo-bg/95 backdrop-blur-sm border-b border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between h-14 px-4">
                    <Link href="/expert" className="p-2 -ml-2 text-slate-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <span className="font-black text-slate-800 tracking-tight">Το Πλάνο Σας</span>
                    <button onClick={() => {
                        resetSession();
                        router.push('/expert');
                    }} className="p-2 -mr-2 text-slate-400">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="pt-14 md:pt-24 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="skeuo-card p-6 space-y-5"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-skeuo-accent to-skeuo-accent-dark flex items-center justify-center shrink-0 shadow-lg">
                                <span className="text-3xl">🛠️</span>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-xl font-black text-slate-800 tracking-tight">{solution.title}</h1>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                    <span className="flex items-center gap-1.5 text-sm text-slate-500 font-bold">
                                        <Clock className="w-4 h-4" />
                                        {solution.estimatedTime}
                                    </span>
                                    <span className={cn("flex items-center gap-1.5 text-sm font-black", difficultyColors[solution.difficulty] || 'text-slate-600')}>
                                        <Star className="w-4 h-4" />
                                        {solution.difficulty ? solution.difficulty.charAt(0).toUpperCase() + solution.difficulty.slice(1) : 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200/60 pt-4">
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Χαρακτηριστικά Έργου</p>
                            <div className="flex flex-wrap gap-2">
                                <Chip className="!h-8 !text-[12px]">{solution.projectType}</Chip>
                                {solution.assumptions.slice(0, 3).map((asm, i) => (
                                    <Chip key={i} className="!h-8 !text-[12px] bg-slate-100 text-slate-500">{asm}</Chip>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Steps */}
                    <div className="space-y-4">
                        <h2 className="text-[13px] font-black text-slate-400 uppercase tracking-widest px-2">Βήμα-βήμα Οδηγός</h2>

                        {solution.steps.map((step, idx) => {
                            const isExpanded = expandedSteps.includes(step.order);

                            return (
                                <motion.div
                                    key={step.order}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="skeuo-card overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleStep(step.order)}
                                        className="w-full p-5 flex items-center justify-between text-left outline-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-9 h-9 rounded-full bg-skeuo-accent/10 text-skeuo-accent-dark text-sm font-black flex items-center justify-center border border-skeuo-accent/20">
                                                {step.order}
                                            </span>
                                            <span className="font-black text-slate-800 tracking-tight">{step.title}</span>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-6 space-y-5">
                                                    <p className="text-[15px] text-slate-600 font-semibold leading-relaxed">
                                                        {step.description}
                                                    </p>

                                                    {step.tips && step.tips.length > 0 && (
                                                        <div className="skeuo-inset rounded-2xl p-4 space-y-3 bg-slate-50/50">
                                                            <div className="flex items-center gap-2 text-skeuo-accent-dark text-[13px] font-black uppercase tracking-wider">
                                                                <Lightbulb className="w-4 h-4" />
                                                                Συμβουλές Expert
                                                            </div>
                                                            <ul className="text-sm text-slate-600 font-semibold space-y-2">
                                                                {step.tips.map((tip, i) => (
                                                                    <li key={i} className="flex items-start gap-2">
                                                                        <span className="text-skeuo-accent text-lg leading-4">•</span>
                                                                        <span>{tip}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {step.warnings && step.warnings.length > 0 && (
                                                        <div className="bg-orange-50/80 rounded-2xl p-4 space-y-3 border border-orange-100">
                                                            <div className="flex items-center gap-2 text-orange-600 text-[13px] font-black uppercase tracking-wider">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                Προειδοποίηση Ασφαλείας
                                                            </div>
                                                            <ul className="text-sm text-orange-800 font-semibold space-y-2">
                                                                {step.warnings.map((warning, i) => (
                                                                    <li key={i} className="flex items-start gap-2">
                                                                        <span className="text-orange-400 text-lg leading-4">!</span>
                                                                        <span>{warning}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Products */}
                                                    {(step.product_handles?.length ?? 0) > 0 && (
                                                        <div className="space-y-3">
                                                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Σχετικά Προιόντα</p>
                                                            <div className="space-y-3">
                                                                {step.product_handles.map((productHandle: string) => (
                                                                    <Link
                                                                        key={productHandle}
                                                                        href={`/product/${productHandle}`}
                                                                        className="flex items-center gap-4 skeuo-card p-3 hover:skeuo-card-hover group transition-all"
                                                                    >
                                                                        <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-inner p-2 border border-slate-100">
                                                                            <div className="relative w-full h-full">
                                                                                {/* Fallback image as we might not have all handles loaded perfectly */}
                                                                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-bold text-center">
                                                                                    Product Image
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[15px] font-black text-slate-800 truncate group-hover:text-skeuo-accent transition-colors">
                                                                                {productHandle.replace(/-/g, ' ').toUpperCase()}
                                                                            </p>
                                                                            <p className="text-[13px] text-slate-500 font-bold">
                                                                                Απαραίτητο για αυτό το βήμα
                                                                            </p>
                                                                        </div>
                                                                        <div className="shrink-0 w-10 h-10 rounded-full bg-skeuo-bg flex items-center justify-center text-slate-400 shadow-skeuo-raised group-hover:text-skeuo-accent">
                                                                            <ChevronRight className="w-5 h-5" />
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Action Footer */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="skeuo-card p-6 space-y-5"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 font-bold">Εκτίμηση Συνολικού Κόστους</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-black text-slate-800">{formatPrice(solution.totalPrice)}</p>
                                    <span className="text-sm text-slate-400 font-bold">est. total</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-slate-400" />
                            </div>
                        </div>

                        <PrimaryButton
                            onClick={() => {
                                // Future: Logic to add all products to cart
                                router.push('/cart');
                            }}
                            className="bg-skeuo-accent hover:bg-skeuo-accent-dark text-slate-900 shadow-skeuo-button h-[64px]"
                        >
                            Προσθήκη Όλων στο Καλάθι
                        </PrimaryButton>
                    </motion.div>
                </div>
            </div>

            <div className="md:hidden">
                <BottomNav />
            </div>
        </div>
    );
}
