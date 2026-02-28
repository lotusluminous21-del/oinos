"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react"
import { useCart } from "@/hooks/useCart"

const navItems = [
    { href: '/', icon: Home, label: 'ΑΡΧΙΚΗ' },
    { href: '/proionta', icon: Grid3X3, label: 'ΚΑΤΗΓΟΡΙΕΣ' },
    { href: '/cart', icon: ShoppingCart, label: 'ΚΑΛΑΘΙ' },
    { href: '/account', icon: User, label: 'ΛΟΓΑΡΙΑΣΜΟΣ' },
]

export function MainNav() {
    const pathname = usePathname()
    const { cart } = useCart()
    const cartCount = cart?.lines?.edges?.reduce((acc, { node }) => acc + node.quantity, 0) || 0

    return (
        <nav className="hidden lg:flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/60 shadow-sm rounded-full px-4 py-2">
            {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-1.5 text-[11px] font-heading font-semibold tracking-wider relative px-3 py-1.5 rounded-full transition-all duration-300",
                            isActive
                                ? "text-teal-700 bg-white shadow-sm ring-1 ring-black/5"
                                : "text-neutral-500 hover:text-neutral-800 hover:bg-white/50"
                        )}
                    >
                        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {item.label}
                        {item.href === '/cart' && cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-[9px] font-bold rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
