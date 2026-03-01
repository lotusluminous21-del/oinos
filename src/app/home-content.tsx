"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Shield, Truck, Headphones, Award, ChevronRight } from "lucide-react"

import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { FluidScene } from "@/components/fluid/fluid-scene"
import { Header } from "@/components/ui/skeumorphic/header"
import { BottomNav } from "@/components/ui/skeumorphic/bottom-nav"
import { SmartSearchBar } from "@/components/ui/skeumorphic/smart-search-bar"
import { Chip } from "@/components/ui/skeumorphic/chip"
import { ActionCard } from "@/components/ui/skeumorphic/action-card"
import { ProductCard } from "@/components/ui/skeumorphic/product-card"
import { PrimaryButton } from "@/components/ui/skeumorphic/primary-button"
import { Product } from "@/lib/shopify/types"
import { getCategoryImage, getCategoryOrder } from "@/lib/categories"



const TRUST_BADGES = [
    { icon: Award, title: "Authorized Partner", desc: "Official distributor" },
    { icon: Shield, title: "Secure Payments", desc: "SSL encrypted" },
    { icon: Truck, title: "Fast Shipping", desc: "Nationwide delivery" },
    { icon: Headphones, title: "Expert Support", desc: "Technical assistance" },
]

// Mock data to match structural requirements while using real types if we had them.
interface CategoryData {
    id: string;
    name: string;
    slug: string;
    icon: string;
    count: number;
}

interface HomeContentProps {
    initialProducts: Product[];
    initialCategories: CategoryData[];
}

export default function HomeContent({ initialProducts, initialCategories }: HomeContentProps) {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const heroRef = React.useRef<HTMLElement>(null)
    const mouseRef = React.useRef(new THREE.Vector4(0, 0, 0, 0))

    // In a real app we might want to recalculate counts if products were filtered,
    // but for now we'll just use the initial counts or calculate them once.
    const categoriesWithCounts = initialCategories.map(cat => ({
        ...cat,
        count: initialProducts.filter(p => p.productType === cat.name).length
    }));

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulated routing based on smart search query
        router.push("/search")
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!heroRef.current) return
        const rect = heroRef.current.getBoundingClientRect()
        mouseRef.current.x = e.clientX - rect.left
        mouseRef.current.y = e.clientY - rect.top
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!heroRef.current) return
        const rect = heroRef.current.getBoundingClientRect()
        mouseRef.current.z = 1
        mouseRef.current.x = e.clientX - rect.left
        mouseRef.current.y = e.clientY - rect.top
    }

    const handlePointerUp = () => {
        mouseRef.current.z = 0
    }

    // Mock products removed, using initialProducts prop
    const featuredProducts = initialProducts.slice(0, 8);

    return (
        <div className="min-h-screen bg-[#F0F2F6] overflow-x-hidden font-sans pb-24 md:pb-10 pt-[64px] md:pt-[80px]">
            <Header />


            <main className="relative z-10 w-full flex flex-col items-center">

                {/* --- HERO SECTION --- */}
                <section
                    ref={heroRef}
                    className="w-full relative flex flex-col items-center justify-center px-6 py-20 space-y-8 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] overflow-hidden"
                    onPointerMove={handlePointerMove}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    {/* Liquid Background Canvas - Scaled slightly to hide edge artifacts */}
                    <div className="absolute inset-0 z-0 pointer-events-none scale-105 origin-center">
                        <Canvas
                            camera={{ position: [0, 0, 1] }}
                            className="w-full h-full"
                            dpr={[1, 2]}
                            gl={{ alpha: true, antialias: true }}
                        >
                            <FluidScene mouseRef={mouseRef} />
                        </Canvas>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                        className="text-center relative z-10"
                    >
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-800 drop-shadow-sm">
                            PAVLICEVITS
                        </h1>
                        <p className="text-slate-500 mt-3 text-sm md:text-base font-bold tracking-tight">
                            Expert paint solutions for automotive & structural projects
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                        className="w-full max-w-xl flex justify-center relative z-10"
                    >
                        <form onSubmit={handleSearch} className="w-full contents">
                            <SmartSearchBar placeholder="How can the expert help you today?" />
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center gap-2 relative z-10"
                    >
                        <Sparkles className="w-4 h-4 text-primary" strokeWidth={2.5} />
                        <span className="text-xs text-slate-500 font-extrabold tracking-widest uppercase">EXPERT AI</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap justify-center gap-3 max-w-xl relative z-10"
                    >
                        <Chip onClick={() => router.push("/search")} className="hover:scale-105 active:scale-95 transition-transform">
                            📍 Fix a scratch
                        </Chip>
                        <Chip onClick={() => router.push("/search")} className="hover:scale-105 active:scale-95 transition-transform">
                            🪹 Treat rust
                        </Chip>
                        <Chip
                            onClick={() => router.push("/expert")}
                            className="text-accent hover:scale-105 active:scale-95 transition-transform"
                            style={{
                                boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,1)"
                            }}
                        >
                            ✨ Get expert help
                        </Chip>
                    </motion.div>
                </section>

                {/* --- TRUST BADGES --- */}
                <section className="w-full px-4 py-8 relative">
                    {/* Horizontal dividing line matching prototype */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />

                    <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                        {TRUST_BADGES.map((badge, idx) => (
                            <motion.div
                                key={badge.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="flex flex-col items-center justify-center text-center gap-2"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#F0F2F6] flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.03),-1px_-1px_2px_rgba(255,255,255,1)]">
                                    <badge.icon className="w-5 h-5 text-[#303C59]" strokeWidth={2} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[13px] font-extrabold text-slate-800 tracking-tight leading-tight">{badge.title}</p>
                                    <p className="text-[11px] text-slate-500 font-bold leading-tight">{badge.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* --- CATEGORIES --- */}
                <section className="w-full px-6 py-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Shop by Category</h2>
                            <Link
                                href="/categories"
                                className="text-sm text-primary font-bold flex items-center gap-1 transition-transform hover:scale-105"
                            >
                                View all <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categoriesWithCounts
                                .sort((a, b) => getCategoryOrder(a.name) - getCategoryOrder(b.name))
                                .map((category, idx) => {
                                    const imageSrc = getCategoryImage(category.name);
                                    return (
                                        <motion.div
                                            key={category.slug}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                                            transition={{ delay: 0.5 + idx * 0.05 }}
                                        >
                                            <Link href={`/categories/${category.slug}`}>
                                                <ActionCard className="p-4 min-h-[160px] w-full group flex flex-col items-center">
                                                    <div className="relative w-20 h-20 mb-3 shrink-0">
                                                        <Image
                                                            src={imageSrc}
                                                            alt={category.name}
                                                            fill
                                                            className="object-contain drop-shadow-[2px_8px_12px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-center flex-1 justify-center">
                                                        <span className="text-[14px] font-bold text-slate-800 tracking-tight leading-tight mb-1">{category.name}</span>
                                                        <span className="text-[11px] text-slate-500 font-bold">{category.count} products</span>
                                                    </div>
                                                </ActionCard>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    </div>
                </section>

                {/* --- FEATURED PRODUCTS --- */}
                <section className="w-full px-6 py-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Featured Products</h2>
                        </div>

                        {/* Mobile Scrollable Row, Desktop Grid */}
                        <div className="flex md:grid md:grid-cols-4 gap-5 overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide snap-x">
                            {featuredProducts.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ delay: 0.6 + idx * 0.05 }}
                                    className="shrink-0 snap-center"
                                >
                                    <Link href={`/product/${product.handle}`}>
                                        <ProductCard
                                            product={product}
                                            variant="featured"
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- EXPERT CTA SECTION --- */}
                <section className="w-full px-6 py-12 mb-12">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ delay: 0.8 }}
                            className="w-full rounded-[32px] p-8 md:p-12 text-center space-y-6 bg-[#F0F2F6] shadow-[8px_8px_20px_rgba(0,0,0,0.05),-8px_-8px_20px_rgba(255,255,255,0.8),2px_2px_4px_rgba(0,0,0,0.03),-2px_-2px_4px_rgba(255,255,255,1)]"
                        >
                            <div className="w-20 h-20 mx-auto rounded-[24px] bg-accent flex items-center justify-center shadow-[6px_6px_12px_hsl(var(--accent)/0.3),-6px_-6px_12px_rgba(255,255,255,0.9),inset_2px_2px_5px_rgba(255,255,255,0.5),inset_-2px_-2px_5px_rgba(0,0,0,0.1)]">
                                <span className="text-3xl drop-shadow-sm">🧠</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Not sure what you need?</h3>
                                <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto font-bold leading-relaxed">
                                    Our AI expert can analyze your situation and recommend the exact products you need for your project.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-center">
                                <PrimaryButton
                                    onClick={() => router.push('/expert')}
                                    className="max-w-[260px]"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Start Expert Guide
                                </PrimaryButton>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Sticky Bottom Nav on Mobile to replicate the App Feel */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-4 z-50">
                <BottomNav />
            </div>
        </div>
    )
}
