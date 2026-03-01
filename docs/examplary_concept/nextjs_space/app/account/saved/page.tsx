"use client";

import Link from "next/link";
import { ChevronLeft, Heart } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-skeuo-bg">
      <header className="fixed top-0 left-0 right-0 z-50 h-[60px] px-4 bg-skeuo-bg shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center">
        <Link href="/account" className="w-10 h-10 flex items-center justify-center text-slate-700">
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </Link>
        <h1 className="flex-1 text-center text-[18px] font-bold text-slate-900">Saved Products</h1>
        <div className="w-10" />
      </header>
      <main className="pt-[100px] pb-[100px] px-4 text-center">
        <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-[18px] font-bold text-slate-800 mb-2">No Saved Products</h2>
        <p className="text-[14px] text-slate-500">Products you save will appear here</p>
      </main>
      <BottomNav />
    </div>
  );
}
