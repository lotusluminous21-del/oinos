import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type LogLevel = 'info' | 'warn' | 'error';

class SystemLogger {
    private source: string;

    constructor(source: string) {
        this.source = source;
    }

    private async writeToFirestore(level: LogLevel, message: string, context?: Record<string, any>) {
        if (!db) return;
        try {
            await addDoc(collection(db, "system_logs"), {
                timestamp: serverTimestamp(),
                level: level.toUpperCase(),
                source: this.source,
                message,
                ...context,
                userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server/SSR',
                route: typeof window !== 'undefined' ? window.location.pathname : 'Server/SSR'
            });
        } catch (e) {
            console.error("CRITICAL: Failed to write system log to Firestore", e);
        }
    }

    info(message: string, context?: Record<string, any>) {
        console.log(`[INF] ${this.source}: ${message}`, context || "");
        this.writeToFirestore('info', message, context);
    }

    warn(message: string, context?: Record<string, any>) {
        console.warn(`[WRN] ${this.source}: ${message}`, context || "");
        this.writeToFirestore('warn', message, context);
    }

    error(message: string, error?: unknown, context?: Record<string, any>) {
        console.error(`[ERR] ${this.source}: ${message}`, error, context || "");

        const errorInfo: Record<string, any> = { ...context };

        if (error instanceof Error) {
            errorInfo.error_message = error.message;
            errorInfo.traceback = error.stack;
            errorInfo.error_type = error.name;
        } else if (error) {
            errorInfo.error_data = JSON.stringify(error);
        }

        this.writeToFirestore('error', message, errorInfo);
    }
}

export function getLogger(source: string) {
    return new SystemLogger(source);
}
