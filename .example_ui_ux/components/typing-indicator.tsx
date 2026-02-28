'use client';

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
        <span className="text-xs">🧠</span>
      </div>
      <div className="glass-card px-4 py-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-teal-400 rounded-full"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
