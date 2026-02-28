"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, User, FlaskConical, Bell } from "lucide-react"

import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CartSheet } from "@/components/cart/cart-sheet"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/lib/auth-context"

export function SiteHeader() {
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY
            setIsScrolled(offset > 100) // Switch after 100px scroll
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const capsuleClass = "pointer-events-auto bg-white/70 backdrop-blur-xl border border-white/20 rounded-full shadow-lg transition-all duration-300 hover:bg-white/80"

    return (
        <>
            {/* STATE 1: FLOATING NAVBAR (Visible when NOT scrolled) */}
            <div className={cn(
                "fixed top-4 md:top-6 w-full z-50 transition-all duration-500 ease-in-out px-4 flex justify-center",
                isScrolled ? "-translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
            )}>
                <div className={cn(
                    "bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/[0.02] transition-all duration-300 hover:bg-white/95",
                    "h-14 md:h-16 w-full max-w-5xl flex items-center justify-between px-2 md:px-4 pointer-events-auto"
                )}>
                    {/* CAPSULE 1: Branding (Left) */}
                    <div className="flex items-center gap-2 md:gap-4 pl-1 md:pl-2">
                        <MobileNav />
                        <Link href="/" className="flex flex-col items-center gap-1">
                            <Image
                                src="/svg/logotype.svg"
                                alt="Pavlicevits"
                                width={100}
                                height={20}
                                className="w-[110px] md:w-[130px] h-auto"
                            />
                        </Link>
                    </div>

                    {/* CAPSULE 2: Navigation (Center - Desktop Only) */}
                    <div className="hidden lg:flex items-center justify-center">
                        <MainNav />
                    </div>

                    {/* CAPSULE 3: Actions (Right) */}
                    <div className="flex items-center gap-0.5 md:gap-1 pr-1 md:pr-2">
                        <HeaderActions />
                    </div>
                </div>
            </div>

            {/* STATE 2: SCROLLED APPBAR (Visible when scrolled) */}
            <header className={cn(
                "fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-b border-black/[0.02] transition-all duration-500 ease-in-out",
                isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            )}>
                <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <MobileNav />
                        <Link href="/" className="flex items-center gap-2 h-full">
                            <Image
                                src="/svg/logotype.svg"
                                alt="Pavlicevits"
                                width={100}
                                height={20}
                                className="w-[110px] md:w-[130px] h-auto"
                            />
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center justify-center flex-1 px-8">
                        <MainNav />
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        <HeaderActions />
                    </div>
                </div>
            </header>
        </>
    )
}

function HeaderActions() {
    const { cart } = useCart()
    const { isAdmin } = useAuth()
    const itemCount = cart?.lines?.edges?.reduce((acc, { node }) => acc + node.quantity, 0) || 0

    return (
        <>
            {isAdmin && (
                <Link href="/admin/lab" className="hidden md:block">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 hover:text-black transition-all text-primary" aria-label="Admin Lab">
                        <FlaskConical className="h-5 w-5 text-emerald-600" />
                    </Button>
                </Link>
            )}

            <Button variant="ghost" size="icon" className="hidden md:flex rounded-full hover:bg-black/5 hover:text-black transition-all text-neutral-600" aria-label="Search">
                <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" aria-label="Account" className="hidden md:flex rounded-full hover:bg-black/5 hover:text-black transition-all text-neutral-600">
                <User className="h-5 w-5" />
            </Button>

            <CartSheet>
                <div className="hidden md:flex">
                    <Button variant="ghost" size="icon" aria-label="Cart" className="relative rounded-full hover:bg-black/5 hover:text-black transition-all text-neutral-600">
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                {itemCount}
                            </span>
                        )}
                        <span className="sr-only">Cart</span>
                    </Button>
                </div>
            </CartSheet>

            <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-black/5 transition-all text-neutral-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            <button className="hidden md:block text-xs font-bold ml-2 mr-1 px-2 py-1 rounded-md hover:bg-black/5 transition-colors text-primary">
                EN
            </button>
        </>
    )
}
