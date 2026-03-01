'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Send, Camera, X } from "lucide-react"
import Image from "next/image"

export interface ChatInputProps {
    onSend: (message: string, imageUrl?: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function ChatInput({ onSend, disabled, placeholder, className }: ChatInputProps) {
    const [message, setMessage] = React.useState('');
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if ((message.trim() || imagePreview) && !disabled) {
            onSend(message.trim(), imagePreview || undefined);
            setMessage('');
            setImagePreview(null);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    const canSend = (message.trim() || imagePreview) && !disabled;

    return (
        <div className={cn("p-4 bg-skeuo-bg", className)}>
            {/* Image Preview */}
            {imagePreview && (
                <div className="mb-3 relative inline-block">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-skeuo-raised">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <button
                        onClick={() => setImagePreview(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="skeuo-card p-1 rounded-[28px]">
                <div className="skeuo-inset flex items-end gap-2 rounded-[24px] px-4 py-3">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder={placeholder || "Describe your paint issue..."}
                        className={cn(
                            "flex-1 bg-transparent border-none outline-none resize-none",
                            "text-[15px] font-semibold text-slate-700 placeholder:text-slate-400",
                            "min-h-[24px] max-h-[120px]",
                            disabled && "opacity-50"
                        )}
                        rows={1}
                    />

                    <div className="flex items-center gap-1 shrink-0">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Camera className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSend}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                canSend
                                    ? "bg-skeuo-accent text-slate-900 shadow-skeuo-button active:shadow-skeuo-button-active active:scale-95"
                                    : "text-slate-400 cursor-not-allowed"
                            )}
                        >
                            <Send className="w-5 h-5" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Suggestions */}
            {!message && !imagePreview && !disabled && (
                <div className="flex flex-wrap gap-2 mt-3">
                    <button
                        onClick={() => setMessage("I scratched my car door")}
                        className="text-[13px] px-4 py-2 rounded-full bg-skeuo-bg shadow-skeuo-raised text-slate-600 font-semibold hover:skeuo-card-hover transition-all"
                    >
                        📍 Fix a scratch
                    </button>
                    <button
                        onClick={() => setMessage("I have rust on my car")}
                        className="text-[13px] px-4 py-2 rounded-full bg-skeuo-bg shadow-skeuo-raised text-slate-600 font-semibold hover:skeuo-card-hover transition-all"
                    >
                        🪹 Treat rust
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[13px] px-4 py-2 rounded-full bg-skeuo-bg shadow-skeuo-raised text-slate-600 font-semibold hover:skeuo-card-hover transition-all"
                    >
                        📷 Upload photo
                    </button>
                </div>
            )}
        </div>
    )
}
