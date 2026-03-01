"use client";

import Link from "next/link";
import { ChevronLeft, HelpCircle, MessageCircle, Mail, Phone } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";

export default function HelpPage() {
  const helpItems = [
    { icon: MessageCircle, label: "Live Chat", description: "Chat with our support team" },
    { icon: Mail, label: "Email Support", description: "support@pavlicevits.com" },
    { icon: Phone, label: "Phone Support", description: "+30 210 123 4567" },
  ];

  return (
    <div className="min-h-screen bg-skeuo-bg">
      <header className="fixed top-0 left-0 right-0 z-50 h-[60px] px-4 bg-skeuo-bg shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center">
        <Link href="/account" className="w-10 h-10 flex items-center justify-center text-slate-700">
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </Link>
        <h1 className="flex-1 text-center text-[18px] font-bold text-slate-900">Help & Support</h1>
        <div className="w-10" />
      </header>
      <main className="pt-[76px] pb-[100px] px-4">
        <div className="text-center mb-8">
          <HelpCircle className="w-16 h-16 text-skeuo-primary mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-slate-800 mb-2">How can we help?</h2>
          <p className="text-[14px] text-slate-500">Choose a support option below</p>
        </div>
        <div className="space-y-3">
          {helpItems.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-4 p-4 rounded-[24px] bg-skeuo-bg",
                "shadow-[6px_6px_12px_rgba(0,0,0,0.06),-6px_-6px_12px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-skeuo-accent/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-skeuo-primary" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-800">{item.label}</h3>
                <p className="text-[13px] text-slate-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
