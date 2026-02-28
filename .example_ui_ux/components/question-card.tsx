'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { Question, QuestionOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  onAnswer: (value: any) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [textValue, setTextValue] = useState('');

  if (question.type === 'text') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <p className="text-sm font-medium">{question.text}</p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500/50"
          />
          <button
            onClick={() => textValue && onAnswer(textValue)}
            disabled={!textValue}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Submit
          </button>
        </div>

        {question.helpText && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Not sure?</span>
            <ChevronDown className={cn('w-3 h-3 transition-transform', showHelp && 'rotate-180')} />
          </button>
        )}

        <AnimatePresence>
          {showHelp && question.helpText && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="text-xs text-muted-foreground bg-white/5 rounded-lg p-3">
                {question.helpText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <p className="text-sm font-medium">{question.text}</p>

      <div className="space-y-2">
        {question.options?.map((option, idx) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onAnswer(option.value)}
            className="w-full option-card text-left"
          >
            <div className="flex items-start gap-3">
              {option.icon && (
                <span className="text-lg shrink-0">{option.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {question.helpText && (
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Not sure?</span>
          <ChevronDown className={cn('w-3 h-3 transition-transform', showHelp && 'rotate-180')} />
        </button>
      )}

      <AnimatePresence>
        {showHelp && question.helpText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="text-xs text-muted-foreground bg-white/5 rounded-lg p-3">
              {question.helpText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
