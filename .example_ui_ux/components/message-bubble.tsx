'use client';

import { motion } from 'framer-motion';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center shrink-0">
          <span className="text-xs">🧠</span>
        </div>
      )}

      <div className={cn(
        'max-w-[80%] space-y-2',
        isUser && 'order-first'
      )}>
        {message.imageUrl && (
          <div className={cn(
            'rounded-lg overflow-hidden',
            isUser ? 'ml-auto' : ''
          )}>
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="max-h-40 w-auto rounded-lg"
            />
          </div>
        )}

        {message.content && (
          <div className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isUser
              ? 'bg-teal-600 text-white rounded-br-md ml-auto'
              : 'glass-card rounded-bl-md'
          )}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-xs">👤</span>
        </div>
      )}
    </motion.div>
  );
}
