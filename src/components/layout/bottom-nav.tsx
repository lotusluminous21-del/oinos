"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, ShoppingCart, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    const tabs = [
        {
            name: "Home",
            href: "/",
            icon: Home,
        },
        {
            name: "Browse",
            href: "/categories",
            icon: Compass,
        },
        {
            name: "Expert",
            href: "/expert",
            icon: MessageSquare,
        },
        {
            name: "Cart",
            href: "/cart",
            icon: ShoppingCart,
        },
        {
            name: "Profile",
            href: "/account",
            icon: User,
        },
    ]

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50 bg-white/90 backdrop-blur-2xl rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.02)]">
            <nav className="flex items-center justify-between h-16 px-5">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (pathname?.startsWith(tab.href + "/") && tab.href !== "/")

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href!}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-12 h-full transition-all duration-300",
                                isActive ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                            )}
                        >
                            <tab.icon
                                className="w-[22px] h-[22px] z-10"
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {isActive && (
                                <div className="absolute inset-0 m-auto w-10 h-10 bg-neutral-100 rounded-full -z-10 scale-110" />
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
