'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, ShoppingCart, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { useExpertStore } from '@/lib/expert/store';
// Using the existing SolutionRoadmap component from the expert-system directory
import { SolutionRoadmap } from '@/components/expert-system/solution-roadmap';
import { Button } from '@/components/ui/button';

export default function SolutionPage() {
    const router = useRouter();
    const { solution, resetSession } = useExpertStore();

    useEffect(() => {
        // Redirect back to home if no solution exists (e.g., direct navigation)
        if (!solution) {
            router.push('/');
        }
    }, [solution, router]);

    if (!solution) {
        return null;
    }

    const handleRestart = () => {
        resetSession();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-teal-200/50">
            {/* Ambient Background Gradient (Light Aesthetic) */}
            <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-teal-100/50 via-slate-50/80 to-slate-50 pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between h-16 w-full px-4 md:px-8">
                    <button
                        onClick={() => router.push('/expert')}
                        className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100/50 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden md:inline font-medium text-sm">Back to Chat</span>
                    </button>

                    <div className="flex items-center gap-2 text-slate-800">
                        <span className="text-xl">📋</span>
                        <span className="font-semibold tracking-tight">Your Repair Plan</span>
                    </div>

                    <div className="w-9" /> {/* Spacer for centering flex */}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full relative">
                <div className="max-w-4xl mx-auto w-full h-full pt-8 pb-32 px-4 md:px-8">

                    {/* Summary Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/80 shadow-xl shadow-slate-200/50 mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                                        Custom Repair Plan
                                    </h1>
                                    <p className="text-slate-600 flex items-center gap-2 font-medium">
                                        <Clock className="w-4 h-4 text-teal-600" />
                                        Estimated Time: 2-3 hours •
                                        Difficulty: <span className="capitalize">Intermediate</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[240px]">
                                <div className="bg-slate-100/80 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-200/50 text-center">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Materials Needed</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        --- <span className="text-base font-semibold text-slate-500">items</span>
                                    </p>
                                </div>
                                <Button
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 py-6 rounded-xl font-semibold gap-2 transition-all"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add All Essentials to Cart
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Roadmap Component */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* We spread the solution data into the Roadmap component */}
                        {solution && (
                            <SolutionRoadmap
                                title={solution.title || "Your Custom Repair Plan"}
                                estimatedTime={solution.estimatedTime || "1-3 Hours"}
                                difficulty={solution.difficulty || "Medium"}
                                assumptions={solution.assumptions}
                                steps={solution.steps || []}
                            />
                        )}
                    </motion.div>

                    {/* Footer Actions */}
                    <div className="mt-12 text-center pb-12">
                        <button
                            onClick={handleRestart}
                            className="text-sm text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-800 transition-all"
                        >
                            Start a New Consultation
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
