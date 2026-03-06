'use client';

import { useState, useCallback, useRef } from 'react';
import {
    Camera,
    Upload,
    Loader2,
    Check,
    RotateCcw,
    AlertTriangle,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';
import { PhotoTipsGuide } from './photo-tips-guide';

interface DominantColor {
    hex: string;
    percentage: number;
}

interface RALMatch {
    extracted_hex: string;
    percentage: number;
    closest_ral: {
        ral_code: string;
        ral_name: string;
        hex: string;
        delta_e: number;
        confidence: 'high' | 'medium' | 'low';
        input_hex: string;
    };
}

interface AnalysisResult {
    dominant_colors: DominantColor[];
    ral_matches: RALMatch[];
    disclaimer: string;
}

interface PhotoColorUploadProps {
    /** Called when customer confirms a RAL selection */
    onColorSelected: (ralCode: string, ralName: string, ralHex: string, deltaE: number) => void;
    compact?: boolean;
}

const CONFIDENCE_LABELS: Record<string, { label: string; className: string }> = {
    high: { label: 'Υψηλή', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    medium: { label: 'Μέτρια', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    low: { label: 'Χαμηλή', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function PhotoColorUpload({ onColorSelected, compact = false }: PhotoColorUploadProps) {
    const [state, setState] = useState<'idle' | 'uploading' | 'selecting' | 'matched'>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [surfaceType, setSurfaceType] = useState<'matte' | 'glossy'>('matte');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        setError(null);

        // Validate
        if (!file.type.startsWith('image/')) {
            setError('Μόνο εικόνες JPEG/PNG.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Μέγιστο μέγεθος 5MB.');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            setPreviewUrl(dataUrl);
            setState('uploading');

            try {
                const functions = getFirebaseFunctions();
                const analyzeFn = httpsCallable<
                    { image_base64: string; n_colors: number; surface_type?: string },
                    AnalysisResult
                >(functions, 'analyze_photo_color');

                const result = await analyzeFn({
                    image_base64: dataUrl,
                    n_colors: 5,
                    surface_type: surfaceType,
                });

                if ((result.data as any).error) {
                    throw new Error((result.data as any).error);
                }

                setAnalysis(result.data);
                setState('selecting');
            } catch (err: any) {
                console.error('Photo analysis failed:', err);
                setError('Η ανάλυση απέτυχε. Δοκιμάστε ξανά με διαφορετική φωτογραφία.');
                setState('idle');
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleSwatchSelect = (idx: number) => {
        setSelectedIdx(idx);
        setState('matched');
    };

    const handleConfirmRAL = () => {
        if (analysis && selectedIdx !== null) {
            const match = analysis.ral_matches[selectedIdx];
            onColorSelected(
                match.closest_ral.ral_code,
                match.closest_ral.ral_name,
                match.closest_ral.hex,
                match.closest_ral.delta_e,
            );
        }
    };

    const resetAll = () => {
        setState('idle');
        setPreviewUrl(null);
        setAnalysis(null);
        setSelectedIdx(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={cn('space-y-3', compact && 'space-y-2')}>
            {/* ── IDLE: Drop zone ── */}
            {state === 'idle' && (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 cursor-pointer hover:border-accent/60 hover:bg-accent/10 transition-all"
                >
                    <Camera className="w-8 h-8 text-accent" />
                    <div className="text-center">
                        <p className="text-sm font-bold text-foreground">
                            Ανεβάστε φωτογραφία
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Σύρετε εδώ ή πατήστε για επιλογή αρχείου
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            JPEG / PNG — μέγ. 5MB
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />
                </div>
            )}

            {/* Photography Tips Guide */}
            {state === 'idle' && (
                <PhotoTipsGuide />
            )}

            {/* Surface Type Selector */}
            {state === 'idle' && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Επιφάνεια:
                    </span>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => setSurfaceType('matte')}
                            className={cn(
                                'px-2.5 py-1 rounded text-[10px] font-bold border transition-all',
                                surfaceType === 'matte'
                                    ? 'border-accent bg-accent/10 text-accent'
                                    : 'border-border text-muted-foreground hover:border-accent/40'
                            )}
                        >
                            📦 Ματ / Σατινέ
                        </button>
                        <button
                            type="button"
                            onClick={() => setSurfaceType('glossy')}
                            className={cn(
                                'px-2.5 py-1 rounded text-[10px] font-bold border transition-all',
                                surfaceType === 'glossy'
                                    ? 'border-accent bg-accent/10 text-accent'
                                    : 'border-border text-muted-foreground hover:border-accent/40'
                            )}
                        >
                            💧 Γυαλιστερή
                        </button>
                    </div>
                </div>
            )}

            {/* ── UPLOADING: Processing spinner ── */}
            {state === 'uploading' && previewUrl && (
                <div className="space-y-3 animate-in fade-in duration-200">
                    {/* Photo preview */}
                    <div className="relative rounded-lg overflow-hidden border border-border">
                        <img
                            src={previewUrl}
                            alt="Uploaded photo"
                            className="w-full max-h-48 object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-md">
                                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                <span className="text-sm font-bold text-foreground">
                                    Ανάλυση χρωμάτων...
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SELECTING: Color swatches (Step 2 verification) ── */}
            {state === 'selecting' && analysis && previewUrl && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="relative rounded-lg overflow-hidden border border-border">
                        <img
                            src={previewUrl}
                            alt="Analyzed photo"
                            className="w-full max-h-36 object-cover"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-bold text-foreground">
                            Αυτά τα χρώματα εντοπίστηκαν στη φωτογραφία σας:
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Πατήστε στο χρώμα που θέλετε να αντιστοιχιστεί σε RAL.
                        </p>

                        <div className="flex gap-2 flex-wrap">
                            {analysis.dominant_colors.map((color, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSwatchSelect(idx)}
                                    className={cn(
                                        'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:scale-105',
                                        selectedIdx === idx
                                            ? 'border-accent ring-2 ring-accent/30 bg-accent/10'
                                            : 'border-border hover:border-accent/40 bg-card'
                                    )}
                                    title={`${color.hex} — ${color.percentage}%`}
                                >
                                    <div
                                        className="rounded-md border border-border shadow-sm"
                                        style={{
                                            backgroundColor: color.hex,
                                            width: Math.max(32, Math.min(60, color.percentage * 1.2)),
                                            height: Math.max(32, Math.min(60, color.percentage * 1.2)),
                                        }}
                                    />
                                    <span className="text-[9px] font-bold text-muted-foreground">
                                        {color.percentage}%
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Retry */}
                    <button
                        type="button"
                        onClick={resetAll}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Δοκιμάστε άλλη φωτογραφία
                    </button>
                </div>
            )}

            {/* ── MATCHED: RAL result (Step 3 confirmation) ── */}
            {state === 'matched' && analysis && selectedIdx !== null && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {(() => {
                        const match = analysis.ral_matches[selectedIdx];
                        const conf = CONFIDENCE_LABELS[match.closest_ral.confidence] || CONFIDENCE_LABELS.low;
                        return (
                            <>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                                    {/* Extracted → RAL visual comparison */}
                                    <div className="flex items-center gap-1">
                                        <div
                                            className="w-8 h-8 rounded border border-border"
                                            style={{ backgroundColor: match.extracted_hex }}
                                            title={`Extracted: ${match.extracted_hex}`}
                                        />
                                        <span className="text-muted-foreground text-xs">→</span>
                                        <div
                                            className="w-8 h-8 rounded border-2 border-accent"
                                            style={{ backgroundColor: match.closest_ral.hex }}
                                            title={`RAL ${match.closest_ral.ral_code}`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground">
                                            RAL {match.closest_ral.ral_code}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {match.closest_ral.ral_name} — ΔE {match.closest_ral.delta_e}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        'text-[10px] font-bold px-2 py-0.5 rounded border',
                                        conf.className
                                    )}>
                                        {conf.label}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleConfirmRAL}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-accent text-accent-foreground font-bold text-xs hover:bg-accent/90 transition-colors"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Χρήση αυτού
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedIdx(null);
                                            setState('selecting');
                                        }}
                                        className="px-3 py-2 rounded-md bg-secondary text-foreground font-bold text-xs border border-border hover:bg-muted transition-colors"
                                    >
                                        Άλλο χρώμα
                                    </button>
                                </div>

                                {/* Disclaimer */}
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                                    ⚠️ Κατά προσέγγιση αντιστοιχία βάσει ψηφιακής ανάλυσης φωτογραφίας.
                                    Για ακριβή χρωματισμό, επισκεφτείτε μας με δείγμα.
                                </p>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-destructive/5 border border-destructive/20 text-xs text-destructive animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
