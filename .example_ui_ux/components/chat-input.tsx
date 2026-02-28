'use client';

import { useState, useRef } from 'react';
import { Send, Camera, Mic, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Describe your project or ask a question..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || imagePreview) {
      onSend(message.trim(), imagePreview || undefined);
      setMessage('');
      setImagePreview(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t border-white/10 bg-background/80 backdrop-blur-lg p-4">
      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="h-20 w-auto rounded-lg object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 glass-card flex items-end">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 bg-transparent px-4 py-3 text-sm resize-none focus:outline-none min-h-[44px] max-h-[120px]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ height: 'auto' }}
          />
          
          <div className="flex items-center gap-1 px-2 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Voice input (coming soon)"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || (!message.trim() && !imagePreview)}
          className={cn(
            'h-11 w-11 rounded-full flex items-center justify-center transition-all',
            message.trim() || imagePreview
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-muted text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Quick suggestions when empty */}
      {!message && !imagePreview && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setMessage('I scratched my car door')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            📍 I scratched my car
          </button>
          <button
            onClick={() => setMessage('I have rust on my hood')}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            🪹 Rust on my car
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            📷 Upload a photo
          </button>
        </div>
      )}
    </div>
  );
}
