"use client";

import React from 'react';
import Link from 'next/link';
import { Layers, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';

export interface HeaderProps {
    className?: string;
}

export function Header({ className }: HeaderProps) {
    const { user, loading } = useAuth();

    return (
        <header className={cn(
            "border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50",
            className
        )}>
            <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-4 flex items-center justify-between whitespace-nowrap">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded">
                            <Layers className="text-primary-foreground w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Pavlicevits</h2>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        {[
                            { label: 'Shop', href: '/categories' },
                            { label: 'AI Expert', href: '/expert' },
                            { label: 'Services', href: '/services' },
                            { label: 'About', href: '/about' },
                            { label: 'Contact', href: '/contact' },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-muted-foreground hover:text-accent text-sm font-semibold uppercase tracking-wider transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                    <div className="hidden sm:flex items-center bg-secondary rounded-lg px-3 py-1.5 border border-border">
                        <Search className="text-muted-foreground w-5 h-5" />
                        <Input
                            className="bg-transparent border-none focus-visible:ring-0 shadow-none text-sm w-32 lg:w-48 placeholder:text-muted-foreground h-auto py-0"
                            placeholder="Search catalog..."
                            type="text"
                        />
                    </div>

                    <Link href="/cart" className="relative p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                    </Link>

                    <Link
                        href="/profile"
                        className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center overflow-hidden hover:border-primary transition-colors shadow-sm"
                        title={user ? "Account Dashboard" : "Sign In"}
                    >
                        {loading ? (
                            <div className="w-4 h-4 rounded-full border-[2px] border-muted-foreground/20 border-t-muted-foreground animate-spin"></div>
                        ) : user ? (
                            user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover grayscale" />
                            ) : (
                                <span className="text-sm font-black text-slate-500">{user.email?.[0].toUpperCase() || 'U'}</span>
                            )
                        ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
