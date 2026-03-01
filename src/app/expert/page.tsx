'use client';

/**
 * expert/page.tsx — V2
 *
 * Single source of truth: `ConversationStatus` drives ALL rendering decisions.
 * No boolean soup. No conflicting conditions.
 *
 * Status values:
 *   'idle'        → welcome screen
 *   'thinking'    → AI processing (typing indicator)
 *   'questioning' → AI needs an answer → ChatQuestionCard is the ONLY active element
 *   'free-chat'   → AI responded without a question → ChatInput active
 *   'complete'    → Solution ready → Solution CTA is the ONLY active element
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useExpertStore } from '@/lib/expert/store';
import { cn } from '@/lib/utils';
import {
    Header,
    ChatBubble,
    ChatInput,
    ChatQuestionCard,
    TypingIndicator,
    ConfirmedFacts,
    PrimaryButton,
    SuggestedProductsStrip,
    SafetyWarningBanner,
} from '@/components/ui/skeumorphic';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(price);

const FIELD_LABELS: Record<string, string> = {
    damageType: 'Τύπος Ζημιάς',
    damage_type: 'Τύπος Ζημιάς',
    damage_depth: 'Βάθος Ζημιάς',
    damageDepth: 'Βάθος Ζημιάς',
    damage_size: 'Μέγεθος Ζημιάς',
    damageSize: 'Μέγεθος Ζημιάς',
    material: 'Υλικό Επιφάνειας',
    rust_present: 'Σκουριά',
    rustPresent: 'Σκουριά',
    color_type: 'Τύπος Χρώματος',
    colorType: 'Τύπος Χρώματος',
    color_code: 'Κωδικός Χρώματος',
    colorCode: 'Κωδικός Χρώματος',
    part_condition: 'Κατάσταση Εξαρτήματος',
    partCondition: 'Κατάσταση Εξαρτήματος',
    equipment_level: 'Εξοπλισμός',
    equipmentLevel: 'Εξοπλισμός',
    domain: 'Κατηγορία',
    project_type: 'Τύπος Έργου',
    projectType: 'Τύπος Έργου',
    vehicle_make: 'Μάρκα',
    vehicle_model: 'Μοντέλο',
    vehicle_year: 'Έτος',
    vin: 'VIN',
};

function fieldLabel(field: string): string {
    return FIELD_LABELS[field] ?? field.replace(/_/g, ' ');
}

// ─── ConversationStatus derivation ──────────────────────────────────────────

type ConversationStatus = 'idle' | 'thinking' | 'questioning' | 'free-chat' | 'complete';

function deriveStatus(
    hasMessages: boolean,
    isTyping: boolean,
    currentQuestion: any,
    solution: any,
): ConversationStatus {
    if (!hasMessages) return 'idle';
    if (isTyping) return 'thinking';
    if (solution) return 'complete';
    if (currentQuestion) return 'questioning';
    return 'free-chat';
}

// ─── Page component ──────────────────────────────────────────────────────────

export default function ExpertPage() {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        knowledgeState,
        solution,
        isTyping,
        resetSession,
        sendMessage,
        answerExpertQuestion,
    } = useExpertStore();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Derive state — one calculation, used everywhere below
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const currentQuestion = lastMessage?.role === 'assistant' ? lastMessage.question : null;
    const status = deriveStatus(messages.length > 0, isTyping, currentQuestion, solution);

    const handleAnswer = useCallback(async (value: any) => {
        await answerExpertQuestion(value);
    }, [answerExpertQuestion]);

    // Build ConfirmedFacts data
    const confirmed = Object.entries(knowledgeState?.confirmed_facts ?? {})
        .filter(([, v]) => v != null)
        .map(([field, value]) => ({ field: fieldLabel(field), value: String(value) }));

    const inferred = Object.entries(knowledgeState?.inferred_facts ?? {})
        .filter(([, v]) => v != null)
        .map(([field, v]: [string, any]) => ({
            field: fieldLabel(field),
            value: String(v?.value ?? v),
            confidence: v?.confidence,
        }));

    return (
        <div className="h-screen flex flex-col bg-skeuo-bg font-sans">
            {/* Header */}
            <Header showBack title="Expert Guide" />

            {/* Scrollable chat area — pt-16 offsets the fixed 64px header */}
            {/* pb adjusts dynamically: larger when input bar is visible */}
            <div className={`flex-1 overflow-y-auto pt-16 max-w-2xl mx-auto w-full px-4 ${(status === 'idle' || status === 'free-chat') ? 'pb-32' : 'pb-8'
                }`}>

                {/* Reset button — appears once conversation has started */}
                {messages.length > 0 && (
                    <div className="sticky top-0 z-10 flex justify-end py-2">
                        <button
                            onClick={resetSession}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full skeuo-card text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
                            Νέα Συνεδρία
                        </button>
                    </div>
                )}

                {/* ── IDLE: Welcome screen ── */}
                {status === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-12"
                    >
                        <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-xl">
                            <span className="text-4xl">🧠</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                                Expert Guide
                            </h1>
                            <p className="text-slate-500 font-semibold max-w-xs">
                                Περιγράψτε μου τη ζημιά ή το έργο σας και θα σας φτιάξω ένα εξατομικευμένο πλάνο βαφής.
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {['Fix a scratch', 'Treat rust', 'New part painting'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => sendMessage(s)}
                                    className="px-4 py-2 rounded-full skeuo-card text-sm font-bold text-slate-600 hover:text-skeuo-accent transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Chat message history ── */}
                {messages.length > 0 && (
                    <div className="space-y-5">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => {
                                const isLast = idx === messages.length - 1;
                                const isActiveQuestion = isLast && msg.role === 'assistant' && !!msg.question;

                                // The last assistant message with a pending question:
                                // its text will appear as context INSIDE the question card — no separate bubble
                                if (isActiveQuestion) return null;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-2"
                                    >
                                        <div className="space-y-2">
                                            <ChatBubble role={msg.role} content={msg.content} />
                                            {/* If this historical message HAD a question, show the text of that question too */}
                                            {msg.role === 'assistant' && msg.question?.text && (
                                                <div className="ml-14 flex items-center gap-2 text-[13px] font-bold text-slate-400 italic">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    {msg.question.text}
                                                </div>
                                            )}
                                        </div>
                                        {/* Rich UI below assistant messages */}
                                        {msg.role === 'assistant' && (msg.suggested_products?.length ?? 0) > 0 && (
                                            <div className="ml-14">
                                                <SuggestedProductsStrip products={msg.suggested_products as any} />
                                            </div>
                                        )}
                                        {msg.role === 'assistant' && (msg.safety_warnings?.length ?? 0) > 0 && (
                                            <div className="ml-14">
                                                <SafetyWarningBanner warnings={msg.safety_warnings as string[]} />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* ── ConfirmedFacts panel ── */}
                {(confirmed.length > 0 || inferred.length > 0) && status !== 'complete' && !isTyping && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4"
                    >
                        <ConfirmedFacts confirmed={confirmed} inferred={inferred} />
                    </motion.div>
                )}

                {/* ── THINKING: Typing indicator ── */}
                {status === 'thinking' && (
                    <div className="mt-4">
                        <TypingIndicator />
                    </div>
                )}

                {/* ── QUESTIONING: Single unified question card ── */}
                {status === 'questioning' && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="mt-4"
                    >
                        <ChatQuestionCard
                            question={currentQuestion}
                            onAnswer={handleAnswer}
                            context={lastMessage?.content || undefined}
                        />
                    </motion.div>
                )}

                {/* ── COMPLETE: Solution CTA ── */}
                {status === 'complete' && solution && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 skeuo-card p-6 border-2 border-skeuo-accent/20 space-y-5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-skeuo-accent to-skeuo-accent-dark flex items-center justify-center shadow-lg">
                                <span className="text-3xl">✅</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                    {solution.title}
                                </h3>
                                <p className="text-slate-500 font-bold text-sm">
                                    {solution.totalProducts > 0
                                        ? `${solution.totalProducts} προϊόντα • ${formatPrice(solution.totalPrice)}`
                                        : 'Εξατομικευμένο πλάνο έτοιμο'}
                                </p>
                            </div>
                        </div>
                        <PrimaryButton
                            onClick={() => router.push('/solution')}
                            className="bg-skeuo-accent hover:bg-skeuo-accent-dark text-slate-900 shadow-skeuo-button h-[64px]"
                        >
                            Δείτε το Εξατομικευμένο Πλάνο σας
                        </PrimaryButton>
                    </motion.div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* ── Fixed bottom input — only shown when user can actually type ── */}
            {(status === 'idle' || status === 'free-chat') && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-skeuo-bg/80 backdrop-blur-sm border-t border-slate-200/50">
                    <div className="max-w-2xl mx-auto">
                        <ChatInput
                            onSend={sendMessage}
                            disabled={false}
                            placeholder="Περιγράψτε τη ζημιά ή το έργο σας..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
