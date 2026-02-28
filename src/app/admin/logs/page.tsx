"use client"

import React, { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Terminal, ShieldAlert, AlertTriangle, Info, Play, Pause, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LogEntry {
    id: string
    timestamp: any
    level: string
    source: string
    message: string
    sku?: string
    traceback?: string
    error_type?: string
    [key: string]: any
}

export default function LogsDashboard() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [isPaused, setIsPaused] = useState(false)
    const [filterLevel, setFilterLevel] = useState<string | null>(null)
    const [expandedLog, setExpandedLog] = useState<string | null>(null)

    useEffect(() => {
        if (!db || isPaused) return

        const q = query(
            collection(db, "system_logs"),
            orderBy("timestamp", "desc"),
            limit(200)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rawLogs: LogEntry[] = []
            snapshot.forEach(doc => {
                rawLogs.push({ id: doc.id, ...doc.data() } as LogEntry)
            })
            setLogs(rawLogs)
        }, (err) => {
            console.error("Failed to listen to logs:", err)
        })

        return () => unsubscribe()
    }, [isPaused])

    const filteredLogs = filterLevel
        ? logs.filter(l => l.level === filterLevel)
        : logs

    const LevelIcon = ({ level }: { level: string }) => {
        if (level === "ERROR") return <ShieldAlert className="w-4 h-4 text-red-500" />
        if (level === "WARNING" || level === "WARN") return <AlertTriangle className="w-4 h-4 text-yellow-500" />
        return <Info className="w-4 h-4 text-blue-500" />
    }

    const LevelColor = ({ level }: { level: string }) => {
        if (level === "ERROR") return "text-red-400 bg-red-400/10 border-red-400/20"
        if (level === "WARNING" || level === "WARN") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
        return "text-blue-400 bg-blue-400/10 border-blue-400/20"
    }

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] font-mono overflow-hidden">
            {/* Header */}
            <header className="flex-none h-14 border-b border-[#30363d] flex items-center justify-between px-4 bg-[#161b22]">
                <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h1 className="font-semibold text-sm tracking-wide">System Logs</h1>
                    <div className="h-4 w-px bg-[#30363d] mx-2" />
                    <span className="text-xs text-[#8b949e]">Real-time Telemetry</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex space-x-1 mr-4 bg-[#0d1117] p-1 rounded-md border border-[#30363d]">
                        {['ALL', 'ERROR', 'WARN', 'INFO'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setFilterLevel(lvl === 'ALL' ? null : lvl)}
                                className={cn(
                                    "px-3 py-1 text-xs rounded transition-colors font-medium cursor-pointer",
                                    (filterLevel === lvl || (lvl === 'ALL' && !filterLevel))
                                        ? "bg-[#21262d] text-white"
                                        : "text-[#8b949e] hover:text-white hover:bg-[#21262d]/50"
                                )}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPaused(!isPaused)}
                        className={cn("h-8 border-[#30363d] bg-transparent hover:bg-[#21262d] text-[#c9d1d9]")}
                    >
                        {isPaused ? <Play className="w-4 h-4 mr-2 text-emerald-400" /> : <Pause className="w-4 h-4 mr-2 text-yellow-400" />}
                        {isPaused ? "Resume" : "Pause"}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogs([])}
                        className="h-8 border-[#30363d] bg-transparent hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 text-[#c9d1d9]"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear UI
                    </Button>
                </div>
            </header>

            {/* Terminal View */}
            <div className="flex-1 overflow-auto p-4 space-y-1">
                {filteredLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[#8b949e] italic text-sm">
                        Waiting for events...
                    </div>
                ) : (
                    filteredLogs.map((log) => {
                        const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
                        const timeString = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

                        const isExpanded = expandedLog === log.id;

                        return (
                            <div key={log.id} className="group flex flex-col hover:bg-[#161b22] px-2 py-1.5 -mx-2 rounded transition-colors">
                                <div className="flex items-start gap-3 cursor-pointer" onClick={() => (log.traceback || log.sku) && setExpandedLog(isExpanded ? null : log.id)}>
                                    <div className="shrink-0 pt-0.5">
                                        <LevelIcon level={log.level} />
                                    </div>
                                    <div className="shrink-0 text-xs text-[#8b949e] w-[110px] pt-0.5">
                                        {timeString}
                                    </div>
                                    <div className="shrink-0 pt-0.5">
                                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-bold", LevelColor({ level: log.level }))}>
                                            {log.level.substring(0, 4)}
                                        </Badge>
                                    </div>
                                    <div className="shrink-0 text-xs font-semibold text-[#a5d6ff] w-[140px] truncate pt-0.5" title={log.source}>
                                        {log.source.split('.').pop() || log.source}
                                    </div>

                                    <div className="flex-1 text-sm text-[#e6edf3] break-all leading-relaxed">
                                        {log.error_type && <span className="text-red-400 font-bold mr-2">[{log.error_type}]</span>}
                                        {log.message}

                                        {log.sku && (
                                            <span className="ml-3 text-xs text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded border border-purple-400/20">
                                                SKU: {log.sku}
                                            </span>
                                        )}

                                        {(log.traceback) && (
                                            <span className="ml-3 text-[10px] text-[#8b949e] underline decoration-dotted underline-offset-2">
                                                {isExpanded ? 'Hide Trace' : 'View Trace'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-2 ml-[176px] mr-4 p-3 bg-[#0d1117] border border-red-900/30 rounded-md shadow-inner text-xs text-red-300 overflow-x-auto">
                                        {log.traceback ? (
                                            <pre className="whitespace-pre-wrap font-mono leading-relaxed">
                                                {log.traceback}
                                            </pre>
                                        ) : (
                                            <pre className="whitespace-pre-wrap font-mono text-[#8b949e]">
                                                {JSON.stringify(log, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
