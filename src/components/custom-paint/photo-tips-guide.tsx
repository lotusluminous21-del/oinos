'use client';

import { useState, useEffect } from 'react';
import {
    ZapOff,
    CloudSun,
    Maximize,
    Sparkles,
    Eye,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'pavlicevits-photo-tips-dismissed';

interface PhotoTipsGuideProps {
    className?: string;
}

const TIPS = [
    {
        icon: ZapOff,
        title: 'Χωρίς φλας',
        description: 'Δημιουργεί λευκή αντανάκλαση στο κέντρο',
    },
    {
        icon: CloudSun,
        title: 'Φυσικό φως / σκιά',
        description: 'Αποφύγετε τεχνητό φωτισμό — χρωματίζει κίτρινα',
    },
    {
        icon: Maximize,
        title: 'Γεμίστε το κάδρο',
        description: 'Κοντινή λήψη, μόνο η επίπεδη επιφάνεια',
    },
    {
        icon: Sparkles,
        title: 'Καθαρή επιφάνεια',
        description: 'Σκόνη και βρωμιά αλλοιώνουν την απόχρωση',
    },
    {
        icon: Eye,
        title: 'Χωρίς αντανακλάσεις',
        description: 'Γυαλιστερές βαφές αντανακλούν τα γύρω χρώματα',
    },
];

export function PhotoTipsGuide({ className }: PhotoTipsGuideProps) {
    const [dismissed, setDismissed] = useState(true); // Default hidden until we check localStorage

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        setDismissed(saved === 'true');
    }, []);

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    return (
        <div className={cn(
            'relative rounded-lg border border-accent/20 bg-accent/5 p-3 animate-in fade-in duration-200',
            className
        )}>
            {/* Dismiss */}
            <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss tips"
            >
                <X className="w-3.5 h-3.5" />
            </button>

            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">
                📸 Συμβουλές για καλύτερη ανάλυση χρώματος
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {TIPS.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-1.5 rounded">
                        <tip.icon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <span className="text-[10px] font-bold text-foreground">
                                {tip.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1">
                                — {tip.description}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={handleDismiss}
                className="mt-2 w-full text-[10px] font-bold text-accent uppercase tracking-widest hover:underline transition-colors py-1"
            >
                Κατάλαβα ✓
            </button>
        </div>
    );
}
