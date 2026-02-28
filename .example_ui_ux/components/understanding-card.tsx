'use client';

import { motion } from 'framer-motion';
import { Check, HelpCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnderstandingItem {
  field: string;
  value: string;
  confidence?: number;
}

interface UnderstandingCardProps {
  confirmed: UnderstandingItem[];
  inferred: UnderstandingItem[];
  onCorrect?: () => void;
}

export function UnderstandingCard({ confirmed, inferred, onCorrect }: UnderstandingCardProps) {
  if (confirmed.length === 0 && inferred.length === 0) return null;

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <Check className="w-3 h-3 text-green-400" />;
    if (confidence >= 0.6) return <HelpCircle className="w-3 h-3 text-yellow-400" />;
    return <AlertCircle className="w-3 h-3 text-orange-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-3"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>🧠</span>
        <span>Here&apos;s what I understand:</span>
      </div>

      <div className="space-y-2">
        {confirmed.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-muted-foreground">{item.field}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}

        {inferred.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            {getConfidenceIcon(item.confidence || 0.7)}
            <span className="text-muted-foreground">{item.field}:</span>
            <span className={cn(
              'font-medium',
              item.confidence && item.confidence < 0.7 && 'text-yellow-300'
            )}>
              {item.value}
            </span>
            {item.confidence && item.confidence < 0.8 && (
              <span className="text-xs text-muted-foreground">(likely)</span>
            )}
          </div>
        ))}
      </div>

      {onCorrect && (
        <button
          onClick={onCorrect}
          className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          Something wrong? Tap to correct
        </button>
      )}
    </motion.div>
  );
}
