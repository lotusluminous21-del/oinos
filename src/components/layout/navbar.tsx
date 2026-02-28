"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, User as UserIcon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Mobile Menu Button - Left */}
                <div className="flex lg:hidden flex-1">
                    <Button variant="ghost" size="icon" className="-ml-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </div>

                {/* Logo - Center on Mobile, Left on Desktop */}
                <div className="flex lg:flex-1 justify-center lg:justify-start">
                    <Link href="/" className="flex items-center gap-2 group">
                        {/* Placeholder for actual logo SVG if needed */}
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 shadow-md shadow-teal-500/20 flex items-center justify-center text-white font-black group-hover:scale-105 transition-transform">
                            P
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
                            Pavlicevits
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex flex-1 justify-center gap-x-8">
                    <Link href="/collections/all" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">
                        Browse Shop
                    </Link>
                    <Link href="/expert" className="text-sm font-semibold flex items-center gap-1.5 text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full transition-colors border border-teal-100">
                        <Sparkles className="w-3.5 h-3.5" />
                        Ask the Expert
                    </Link>
                </div>

                {/* Desktop Action Center - Right */}
                <div className="flex flex-1 items-center justify-end gap-x-2">
                    <Link href="/proionta" title="Search Products">
                        <Button variant="ghost" size="icon" className="hidden sm:flex text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100">
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Search</span>
                        </Button>
                    </Link>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 relative">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="sr-only">Cart</span>
                            {/* Placeholder for cart item count */}
                            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-teal-500 border border-white" />
                        </Button>
                    </Link>
                    <div className="hidden sm:block pl-2 border-l border-slate-200">
                        <AuthButtons />
                    </div>
                </div>
            </div>
        </nav>
    );
}

function AuthButtons() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        const authInstance = getFirebaseAuth();
        if (!authInstance) return;
        try {
            await signOut(authInstance);
            router.push('/');
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    if (loading) return null;

    if (user) {
        return (
            <div className="flex items-center gap-1">
                <Link href="/profile">
                    <Button variant="ghost" size="icon" title="Account" className="text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100">
                        <UserIcon className="h-5 w-5" />
                        <span className="sr-only">Account</span>
                    </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 rounded-full hover:bg-neutral-100 px-3">
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 font-semibold px-4">
                    Log in
                </Button>
            </Link>
            <Link href="/signup" className="hidden lg:block">
                <Button variant="default" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold px-4 shadow-md">
                    Sign up
                </Button>
            </Link>
        </div>
    );
}
