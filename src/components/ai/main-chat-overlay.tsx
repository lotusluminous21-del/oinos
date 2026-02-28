"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconSparkles, IconSend, IconPlus, IconShoppingCart, IconCheck } from "@tabler/icons-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "model";
    content: string;
    suggested_products?: Product[];
    step_by_step_recipe?: string[];
    safety_warnings?: string[];
    proposed_action?: {
        type: string;
        variant_ids: string[];
        label?: string;
    };
}

interface Product {
    title: string;
    handle: string;
    price: string;
    variant_id: string;
}

interface MainChatOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onSend: (message: string) => void;
    isLoading: boolean;
}

export function MainChatOverlay({ isOpen, onClose, messages, onSend, isLoading }: MainChatOverlayProps) {
    const { addItem } = useCart();
    const [input, setInput] = useState("");
    const [addedIds, setAddedIds] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen, messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput("");
            if (textareaRef.current) textareaRef.current.style.height = "auto";
        }
    };

    const handleBulkAdd = async (variantIds: string[]) => {
        if (!variantIds || variantIds.length === 0) return;

        for (const id of variantIds) {
            await addItem(id, 1);
        }
        setAddedIds(prev => [...prev, ...variantIds]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xl flex flex-col items-center justify-center p-4 md:p-8"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-white/50 hover:text-white rounded-full h-12 w-12"
                    onClick={onClose}
                >
                    <IconX size={28} />
                </Button>

                <div className="w-full max-w-4xl h-full flex flex-col pt-12">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8 px-4">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <IconSparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Expert Paint Advisor</h2>
                            <p className="text-sm text-white/50">Autonomous Project Planner</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-8 pb-32">
                        {messages.map((msg, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={i}
                                className={cn(
                                    "flex flex-col max-w-full",
                                    msg.role === "user" ? "items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "p-6 rounded-3xl text-lg leading-relaxed shadow-xl border",
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white border-blue-500 rounded-tr-none"
                                        : "bg-white/5 text-white border-white/10 backdrop-blur-md rounded-tl-none"
                                )}>
                                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-strong:text-blue-400">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Actionable Components */}
                                    {msg.step_by_step_recipe && (
                                        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Project Recipe</h4>
                                            {msg.step_by_step_recipe.map((step, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <span className="text-white/30 font-mono">{String(idx + 1).padStart(2, '0')}</span>
                                                    <span className="text-base text-white/80">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {msg.suggested_products && msg.suggested_products.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-white/10">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">Required Products</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {msg.suggested_products.map((p, idx) => (
                                                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-white truncate max-w-[150px]">{p.title}</span>
                                                            <span className="text-xs text-white/40">{p.price}€</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={addedIds.includes(p.variant_id)}
                                                            onClick={() => handleBulkAdd([p.variant_id])}
                                                            className="h-8 w-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black transition-all"
                                                        >
                                                            {addedIds.includes(p.variant_id) ? <IconCheck size={14} /> : <IconPlus size={14} />}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {msg.proposed_action?.type === "ADD_TO_CART" && (
                                        <div className="mt-6">
                                            <Button
                                                onClick={() => handleBulkAdd(msg.proposed_action!.variant_ids)}
                                                disabled={msg.proposed_action.variant_ids.every(id => addedIds.includes(id))}
                                                className="w-full h-14 rounded-2xl bg-white text-black font-bold text-lg hover:bg-blue-500 hover:text-white transition-all gap-2"
                                            >
                                                {msg.proposed_action.variant_ids.every(id => addedIds.includes(id))
                                                    ? <><IconCheck size={20} /> Προστέθηκαν στο καλάθι</>
                                                    : <><IconShoppingCart size={20} /> {msg.proposed_action.label || "Προσθήκη όλων στο καλάθι"}</>
                                                }
                                            </Button>
                                        </div>
                                    )}

                                    {msg.safety_warnings && (
                                        <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                            <div className="text-xs font-bold text-red-400 uppercase mb-2">Safety Notice</div>
                                            <ul className="space-y-1">
                                                {msg.safety_warnings.map((w, idx) => (
                                                    <li key={idx} className="text-xs text-red-200/70 flex gap-2">
                                                        <span>•</span> {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-3 text-white/50 px-2">
                                <IconSparkles className="animate-spin text-blue-400" size={18} />
                                <span className="text-sm italic">Synthesizing response...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
                        <form onSubmit={handleSubmit} className="relative flex items-center gap-2 bg-black/75 backdrop-blur-3xl border border-white/10 rounded-[40px] p-2 shadow-[0_30px_70px_rgba(0,0,0,0.7)] focus-within:bg-black/85 focus-within:border-white/20 transition-all">
                            <div className="flex-1 flex items-center px-4">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    placeholder="Follow up with a question..."
                                    className="w-full min-h-[44px] max-h-48 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/30 text-lg py-3 resize-none focus:text-white leading-tight"
                                    rows={1}
                                />
                            </div>
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isLoading}
                                className="h-14 w-14 rounded-full bg-white text-black hover:bg-white/90 shrink-0 shadow-lg transition-transform active:scale-95"
                            >
                                <IconSend size={24} />
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
