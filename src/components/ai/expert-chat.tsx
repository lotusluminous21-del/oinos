"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirebaseFunctions, getFirebaseAuth } from "@/lib/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatStatus } from "ai";
import {
    PromptInput,
    PromptInputProvider,
    PromptInputTextarea,
    PromptInputSubmit,
    PromptInputBody,
    PromptInputFooter,
    PromptInputTools,
    PromptInputButton,
    PromptInputActionAddAttachments,
    type PromptInputMessage
} from "@/components/ai-elements/prompt-input";
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton
} from "@/components/ai-elements/conversation";
import {
    Message,
    MessageContent,
    MessageResponse
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ProductCard } from "@/components/product/product-card";
import { QuestionCard } from "@/components/expert-system/question-card";
import { UnderstandingCard } from "@/components/expert-system/understanding-card";
import { SolutionRoadmap } from "@/components/expert-system/solution-roadmap";
import {
    IconArrowUp,
    IconSparkles,
    IconMinus,
    IconRefresh,
    IconAdjustmentsHorizontal,
    IconPaperclip,
    IconBolt,
    IconMessageCircle
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useProducts } from "@/hooks/useShopifyProducts";
import { useMemo } from "react";

import { Solution } from "@/lib/expert/types";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    suggested_products?: any[];
    step_by_step_recipe?: string[];
    safety_warnings?: string[];
    understanding_summary?: string;
    question?: {
        text: string;
        help_text?: string;
        options?: { id: string; label: string; description?: string }[];
    };
    clarification_needed?: boolean;
    ready_for_solution?: boolean;
    solution?: Solution;
}

import { useExpertStore } from "@/lib/expert/store";
import { useCart } from "@/hooks/useCart";

interface ExpertChatProps {
    isExpanded: boolean;
    onTransition: (expanded: boolean) => void;
}

const SuggestedProducts = ({ handles }: { handles: string[] }) => {
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

    if (!products || products.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
            ))}
        </div>
    );
};

export function ExpertChat({ isExpanded, onTransition }: ExpertChatProps) {
    const {
        messages,
        addMessage,
        isTyping,
        setTyping,
        resetSession,
        knowledgeState,
        updateKnowledgeState
    } = useExpertStore();
    const { addItem } = useCart();

    const [inputValue, setInputValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProject = async () => {
        setIsSaving(true);
        try {
            // Check if authenticated
            const auth = getFirebaseAuth();
            if (!auth.currentUser) {
                // Trigger simple popup auth for the sake of the demo
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            }

            // Extract the final solution message to save
            const finalSolutionMessage = messages.slice().reverse().find(m => m.solution);

            const saveFn = httpsCallable(getFirebaseFunctions(), "save_expert_project");
            await saveFn({
                state: knowledgeState,
                solution: finalSolutionMessage?.solution || {}
            });

            alert("Project successfully saved to your dashboard!");
        } catch (error) {
            console.error("Failed to save project:", error);
            alert("Failed to save project. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddToCartAll = async () => {
        try {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.role === "assistant" && lastMessage.suggested_products?.length) {
                const promises = lastMessage.suggested_products.map((p: any) => {
                    // In the new schema, suggested_products contains full product objects with variant_id
                    if (p.variant_id) {
                        return addItem(p.variant_id, 1);
                    }
                });
                await Promise.all(promises);
                alert("All items from the solution plan were added to your cart.");
            }
        } catch (error) {
            console.error("Failed to add all items to cart:", error);
            alert("Some items could not be added to cart. Please check your cart and try again manually.");
        }
    };

    const handleSendMessage = async (text: string, files?: any[]) => {
        const trimmed = text.trim();
        if (!trimmed && !(files && files.length > 0)) {
            // Uninformative/Empty Input Handling (Phase 7.3)
            alert("Please provide some details about your project or attach a photo.");
            return;
        }

        if (!isExpanded) {
            onTransition(true);
        }

        addMessage({
            role: "user",
            content: trimmed
        });

        setTyping(true);
        setInputValue("");

        try {
            const expertChatFn = httpsCallable(getFirebaseFunctions(), "expert_chat");
            // Pass full state and contextual history mirroring Python schema
            const payload = {
                message: trimmed,
                files: files?.map((f: any) => ({ url: f.url, type: f.mediaType })) || [],
                state: knowledgeState,
                history: messages.map(h => ({
                    role: h.role === "assistant" ? "model" : "user",
                    content: h.content
                }))
            };

            const result = await expertChatFn(payload);
            const data = result.data as any;

            if (data) {
                // Destructure Python response corresponding to ExpertChatResponse Pydantic Model
                let fallbackAnswer = data.answer;

                // Edge Case Handling: AI returns no text but provides solution
                if (!fallbackAnswer && data.solution) {
                    fallbackAnswer = "I've put together a specialized repair plan based on our conversation.";
                } else if (!fallbackAnswer && data.question) {
                    fallbackAnswer = "I have a quick question to help me understand better.";
                } else if (!fallbackAnswer) {
                    fallbackAnswer = "I'm processing that information.";
                }

                addMessage({
                    role: "assistant",
                    content: fallbackAnswer,
                    suggested_products: data.suggested_products || [],
                    step_by_step_recipe: data.step_by_step_recipe || [],
                    safety_warnings: data.safety_warnings || [],
                    understanding_summary: data.understanding_summary,
                    question: data.question,
                    clarification_needed: data.clarification_needed,
                    ready_for_solution: data.ready_for_solution,
                    solution: data.solution
                });

                // Keep knowledgeState perfectly in sync with the backend Engine
                if (data.state) {
                    updateKnowledgeState(data.state);
                }
            }
        } catch (error: any) {
            console.error("Expert chat error:", error);

            // Network Errors / Edge Cases (Phase 7.3)
            let errorMessage = "I'm sorry, I'm having trouble connecting to the expert right now. Please try again in a moment.";
            if (error?.code === "functions/unavailable") {
                errorMessage = "The AI service is currently unavailable. Please check your connection and try again.";
            } else if (error?.code === "functions/internal") {
                errorMessage = "The AI encountered an internal issue analyzing your request. Could you rephrase it?";
            }

            addMessage({
                role: "assistant",
                content: errorMessage
            });
        } finally {
            setTyping(false);
        }
    };

    const status: ChatStatus = isTyping ? "submitted" : "ready";

    return (
        <motion.div
            layout
            initial={false}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
            }}
            className={cn(
                "w-full flex flex-col overflow-hidden bg-black/50 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative transition-all duration-500",
                isExpanded
                    ? "max-w-5xl h-[85vh] rounded-[2.5rem]"
                    : "max-w-2xl h-auto rounded-[2rem] mt-8"
            )}
        >
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.header
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex items-center justify-between gap-4 border-b border-white/10 px-8 py-5 bg-black/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-balance text-sm font-bold text-white tracking-tight">
                                    Pavlicevits Expert Session
                                </div>
                                <div className="flex items-center gap-2 text-pretty text-[10px] text-white/50 font-medium uppercase tracking-widest">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Live Agent
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-9 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                                onClick={() => resetSession()}
                                title="Reset Session"
                            >
                                <IconRefresh className="size-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-9 rounded-full text-white/70 hover:bg-red-500/20 hover:text-red-400"
                                onClick={() => onTransition(false)}
                                title="Close Session"
                            >
                                <IconMinus className="size-4" />
                            </Button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {isExpanded && (
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 overflow-hidden flex flex-col bg-transparent"
                >
                    <Conversation className="flex-1">
                        <ConversationContent className="gap-8 p-8 md:p-12 max-w-4xl mx-auto w-full">
                            {messages.map((message) => (
                                <Message key={message.id} from={message.role}>
                                    <MessageContent
                                        className={cn(
                                            "leading-relaxed text-base",
                                            message.role === "assistant" && "max-w-prose"
                                        )}
                                    >
                                        {message.role === "assistant" ? (
                                            <div className="space-y-4">
                                                {/* 1. Main Text Response */}
                                                {message.content && message.content !== "Επεξεργασία ολοκληρώθηκε." && (
                                                    <MessageResponse>{message.content}</MessageResponse>
                                                )}

                                                {/* 2. Understanding Card (Inline Context Confirmation) */}
                                                {message.understanding_summary && (
                                                    <UnderstandingCard
                                                        title="Here's what I understand so far:"
                                                        facts={[
                                                            { id: "domain", label: "Project Category", value: knowledgeState.domain, type: "confirmed" },
                                                            ...(knowledgeState.project_type ? [{ id: "type", label: "Specific Goal", value: knowledgeState.project_type, type: "confirmed" as const }] : []),
                                                            ...Object.entries(knowledgeState.confirmed_facts).map(([k, v]) => ({
                                                                id: k,
                                                                label: k.replace(/_/g, ' '),
                                                                value: String(v),
                                                                type: "confirmed" as const
                                                            })),
                                                            ...Object.entries(knowledgeState.inferred_facts).map(([k, v]) => ({
                                                                id: k,
                                                                label: k.replace(/_/g, ' '),
                                                                value: String(v.value),
                                                                confidence: v.confidence,
                                                                type: "inferred" as const
                                                            }))
                                                        ]}
                                                    />
                                                )}

                                                {/* 3. Progressive Question Block */}
                                                {message.question && (
                                                    <QuestionCard
                                                        text={message.question.text}
                                                        helpText={message.question.help_text}
                                                        options={message.question.options}
                                                        onSelect={handleSendMessage}
                                                    />
                                                )}

                                                {/* 4. Suggested Products Pipeline (Preliminary) */}
                                                {message.suggested_products && message.suggested_products.length > 0 && !message.solution && (
                                                    <div className="mt-4 pt-4 border-t border-border/40">
                                                        <h6 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Recommended Items</h6>
                                                        <SuggestedProducts handles={message.suggested_products as unknown as string[]} />
                                                    </div>
                                                )}

                                                {/* 5. Final Solution Roadmap & Save CTA */}
                                                {message.solution && (
                                                    <>
                                                        <SolutionRoadmap
                                                            title={message.solution.title || "Your Custom Repair Plan"}
                                                            estimatedTime={message.solution.estimatedTime || "1-3 Hours"}
                                                            difficulty={message.solution.difficulty || "Medium"}
                                                            assumptions={message.solution.assumptions}
                                                            steps={message.solution.steps || []}
                                                            onAddToCartAll={handleAddToCartAll}
                                                        />

                                                        {/* Final Save Project CTA triggered when Solution is Ready */}
                                                        <div className="mt-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-blue-500/20">
                                                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                                                            <IconSparkles className="absolute -right-4 -top-4 w-32 h-32 text-white/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700 rotate-12" />

                                                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                                <div className="max-w-md">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                                                            <IconSparkles className="size-5 text-white" />
                                                                        </div>
                                                                        <h4 className="font-bold text-white text-xl">Save this roadmap?</h4>
                                                                    </div>
                                                                    <p className="text-blue-100 text-sm leading-relaxed">
                                                                        Take this step-by-step repair guide to your garage. Save it to your account to track your progress and open it on your phone while you work.
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    onClick={handleSaveProject}
                                                                    disabled={isSaving}
                                                                    className="w-full md:w-auto bg-white hover:bg-white/90 text-blue-900 rounded-2xl shadow-xl transition-all font-bold px-8 py-6 text-base whitespace-nowrap"
                                                                >
                                                                    {isSaving ? "Saving..." : "Save to My Dashboard"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap text-pretty font-medium text-white/90">
                                                {message.content}
                                            </p>
                                        )}
                                    </MessageContent>
                                </Message>
                            ))}
                            {isTyping && (
                                <Message from="assistant">
                                    <MessageContent>
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]" />
                                            <div className="size-2 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]" />
                                            <div className="size-2 rounded-full bg-white/40 animate-bounce" />
                                            <span className="text-xs font-semibold text-white/50 tracking-widest uppercase ml-2">Expert Thinking</span>
                                        </div>
                                    </MessageContent>
                                </Message>
                            )}
                        </ConversationContent>
                        <ConversationScrollButton />
                    </Conversation>
                </motion.div>
            )}

            <div className={cn(
                "bg-black/20 backdrop-blur-md transition-all duration-500",
                isExpanded ? "p-4 md:p-8 border-t border-white/10" : "p-4 md:p-6"
            )}>
                <div className={cn(
                    "mx-auto transition-all duration-500",
                    isExpanded ? "max-w-4xl" : "max-w-2xl"
                )}>
                    <TooltipProvider>
                        <PromptInputProvider initialInput="">
                            <PromptInput
                                onSubmit={(message) => handleSendMessage(message.text, message.files)}
                                className="w-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] [&>[data-slot=input-group]]:rounded-[2rem] [&>[data-slot=input-group]]:border-white/20 [&>[data-slot=input-group]]:bg-white/5 [&>[data-slot=input-group]]:backdrop-blur-xl [&>[data-slot=input-group]]:transition-all [&>[data-slot=input-group]]:duration-500"
                            >
                                <PromptInputTextarea
                                    placeholder="How can the expert help you today?"
                                    value={inputValue}
                                    onChange={(event) => setInputValue(event.currentTarget.value)}
                                    onFocus={() => {
                                        if (!isExpanded) onTransition(true);
                                    }}
                                    className="min-h-[60px] text-base px-6 py-4 text-white placeholder:text-white/40"
                                />
                                <PromptInputFooter className="px-6 pb-4">
                                    <PromptInputTools>
                                        <div className="flex items-center gap-2 mr-4 opacity-70 select-none">
                                            <IconSparkles size={16} className="text-emerald-400" />
                                            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400">Expert AI</span>
                                        </div>
                                        {/* TODO: Integrate PromptInputActionAddAttachments menu or use custom openFileDialog */}
                                        <PromptInputButton aria-label="Attach" tooltip="Attach file" className="text-white/60 hover:bg-white/10 hover:text-white" onClick={() => {
                                            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                            if (fileInput) fileInput.click();
                                        }}>
                                            <IconPaperclip className="size-4" />
                                        </PromptInputButton>
                                        <PromptInputButton aria-label="Quick prompt" tooltip="Quick prompts" className="text-white/60 hover:bg-white/10 hover:text-white">
                                            <IconBolt className="size-4" />
                                        </PromptInputButton>
                                        <PromptInputButton
                                            aria-label="New chat"
                                            tooltip="New chat"
                                            className="text-white/60 hover:bg-white/10 hover:text-white"
                                            onClick={() => {
                                                resetSession();
                                                setInputValue("");
                                            }}
                                        >
                                            <IconMessageCircle className="size-4" />
                                        </PromptInputButton>
                                    </PromptInputTools>
                                    <PromptInputSubmit
                                        status={status}
                                        disabled={!inputValue.trim() || status !== "ready"}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                    />
                                </PromptInputFooter>
                            </PromptInput>
                        </PromptInputProvider>
                    </TooltipProvider>
                </div>
            </div>
        </motion.div>
    );
}
