"use client"

import Image from "next/image"
import { FluidScene } from "./fluid-scene"
import { TrustBar } from "./trust-bar"
import { Canvas } from "@react-three/fiber"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, Camera, Mic, Sparkles } from 'lucide-react'
import { useExpertStore } from "@/lib/expert/store"

export function HeroSection() {
    const mouseRef = useRef<THREE.Vector4>(new THREE.Vector4(0, 0, -1, 0))
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    // We use the zustand store to reset conversation before navigating
    const resetSession = useExpertStore(state => state.resetSession)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);

        const queryLower = searchQuery.toLowerCase();
        const hasProjectIntent =
            queryLower.includes('how') ||
            queryLower.includes('fix') ||
            queryLower.includes('repair') ||
            queryLower.includes('help') ||
            queryLower.includes('scratch') ||
            queryLower.includes('rust');

        await new Promise(r => setTimeout(r, 300));

        if (hasProjectIntent) {
            resetSession();
            // In a real implementation we would pre-fill the pending query
            router.push('/expert');
        } else {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }

        setIsSearching(false);
    };

    return (
        <section className="relative w-full h-screen min-h-[600px] flex flex-col items-center justify-center bg-transparent overflow-hidden">
            {/* Fluid Simulation Background */}
            <div className="absolute inset-0 z-0 scale-105">
                <Canvas
                    camera={{ position: [0, 0, 1] }}
                    gl={{ preserveDrawingBuffer: true, alpha: true }}
                    dpr={[1, 2]}
                    onPointerMove={(e) => {
                        mouseRef.current.set(e.clientX, window.innerHeight - e.clientY, e.buttons > 0 ? 1 : -1, 0)
                    }}
                    onPointerDown={(e) => {
                        mouseRef.current.z = 1
                    }}
                    onPointerUp={(e) => {
                        mouseRef.current.z = -1
                    }}
                >
                    <FluidScene mouseRef={mouseRef} />
                </Canvas>
            </div>

            {/* Overlay Content */}
            <motion.div
                className="container relative z-10 px-4 md:px-6 flex flex-col items-center justify-center min-h-[80vh]"
            >
                <div className="flex flex-col items-center mb-12 w-full max-w-2xl mx-auto text-center space-y-8 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center pointer-events-auto"
                    >
                        <Image
                            src="/svg/logotype.svg"
                            alt="Pavlicevits"
                            width={993}
                            height={144}
                            className="w-[80%] max-w-[600px] h-auto invert drop-shadow-2xl"
                            priority
                        />
                        <p className="mt-4 text-muted-foreground mix-blend-difference text-white/80 max-w-lg text-center font-medium">
                            Expert paint solutions for automotive & structural projects
                        </p>
                    </motion.div>

                    {/* Smart Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full pointer-events-auto"
                    >
                        <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto">
                            {/* Light Glassmorphism Base */}
                            <div className="bg-white/40 backdrop-blur-xl rounded-full p-1.5 shadow-xl shadow-black/5 ring-1 ring-black/5 relative">
                                <div className="flex items-center gap-2 bg-white/70 rounded-full px-4 py-3">
                                    <Search className="w-5 h-5 text-neutral-500 shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Πώς μπορεί να σας βοηθήσει ο expert σήμερα;"
                                        className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-500/80 focus:outline-none"
                                        disabled={isSearching}
                                    />
                                    <div className="flex items-center gap-1">
                                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-50/80 border border-teal-100 rounded-full mr-2">
                                            <Sparkles className="w-3 h-3 text-teal-600" />
                                            <span className="text-[10px] font-bold tracking-wider text-teal-700">EXPERT AI</span>
                                        </div>
                                        {/* Icons in Light Glass theme */}
                                        <button type="button" className="p-2 text-neutral-500 hover:text-neutral-800 transition-colors">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                        <button type="button" className="p-2 text-neutral-500 hover:text-neutral-800 transition-colors">
                                            <Mic className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Quick suggestions */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setSearchQuery('Έχω μια γρατζουνιά στο αυτοκίνητο');
                                }}
                                className="text-xs px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-xl shadow-sm transition-all font-bold tracking-wide uppercase"
                            >
                                Επιδιόρθωση γρατζουνιάς
                            </button>
                            <button
                                onClick={() => {
                                    setSearchQuery('Πώς αντιμετωπίζω την σκουριά;');
                                }}
                                className="text-xs px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-xl shadow-sm transition-all font-bold tracking-wide uppercase"
                            >
                                Αντιμετώπιση σκουριάς
                            </button>
                            <button
                                onClick={() => router.push('/expert')}
                                className="text-xs px-6 py-2.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-white shadow-lg shadow-teal-500/10 transition-all font-bold tracking-wide uppercase flex items-center gap-2 backdrop-blur-xl"
                            >
                                <Sparkles className="w-4 h-4 text-teal-300" /> Ask the Expert
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bottom Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 md:bottom-12 left-0 w-full z-20 pointer-events-none px-4"
            >
                <div className="pointer-events-auto max-w-4xl mx-auto hidden md:block">
                    <TrustBar />
                </div>
            </motion.div>
        </section>
    )
}
