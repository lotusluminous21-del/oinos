'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useExpertStore } from '@/lib/expert/store';
// Note: using simplified stub components for the AI engine/components until fully ported, but styling is applied.
import { ExpertChat } from '@/components/ai/expert-chat';

export default function ExpertPage() {
    const router = useRouter();

    const {
        messages,
        knowledgeState,
        isTyping,
        resetSession,
    } = useExpertStore();

    const hasConversation = messages.length > 0;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-teal-200/50">
            {/* Ambient Background Gradient (Light Aesthetic) */}
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-teal-100/50 via-slate-50/80 to-slate-50 pointer-events-none" />

            {/* Desktop & Mobile Header (Light Glass) */}
            <div className="sticky top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between h-16 w-full px-4 md:px-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100/50 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden md:inline font-medium text-sm">Back to Shop</span>
                    </button>

                    <div className="flex items-center gap-2 text-slate-800">
                        <span className="text-xl">✨</span>
                        <span className="font-semibold tracking-tight">Expert Consultation</span>
                    </div>

                    {hasConversation ? (
                        <button
                            onClick={resetSession}
                            className="p-2 -mr-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full hint-tooltip group relative"
                            aria-label="Reset Conversation"
                        >
                            <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300" />
                            <span className="absolute right-0 top-full mt-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                Start Over
                            </span>
                        </button>
                    ) : (
                        <div className="w-9" />
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <main className="flex-1 w-full relative">
                <div className="max-w-3xl mx-auto w-full h-full pt-4 pb-24 md:pb-32 px-4 md:px-8">
                    {/* Welcome message when empty */}
                    {!hasConversation && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center items-center h-[60vh] z-10 relative"
                        >
                            <div className="text-center space-y-6 bg-white/60 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-white/80 shadow-xl shadow-slate-200/50">
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 to-sky-400 flex items-center justify-center shadow-lg shadow-teal-500/20 rotate-3">
                                    <span className="text-4xl -rotate-3 hover:scale-110 transition-transform cursor-default">🧠</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">How can I help you today?</h1>
                                    <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                                        Describe your paint project, ask for advice, or upload a photo of the damage.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 max-w-xs mx-auto pt-4">
                                    <button className="text-sm px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-left flex items-center gap-3">
                                        <span className="text-lg">📍</span> Fixing a deep scratch
                                    </button>
                                    <button className="text-sm px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-left flex items-center gap-3">
                                        <span className="text-lg">🎨</span> Repainting a bumper
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* The Chat Interface Overlaying the dedicated page */}
                    <div className="w-full">
                        <ExpertChat isExpanded={true} onTransition={() => { }} />
                    </div>
                </div>
            </main>
        </div>
    );
}
