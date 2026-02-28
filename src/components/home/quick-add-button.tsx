"use client";

import { Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function QuickAddButton({ productHandle }: { productHandle: string }) {
    // const { addLineRecord } = useCart(); // Future implementation

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        // Add to cart action here based on handle
        console.log("Quick add disabled until connected to cart action", productHandle);
    };

    return (
        <button
            className="absolute bottom-4 right-4 w-[38px] h-[38px] rounded-full bg-[#00E5FF] hover:bg-[#33EAFF] text-neutral-900 flex items-center justify-center shadow-[0_4px_12px_rgba(0,229,255,0.4)] transition-all duration-300 active:scale-90 z-10 group-hover:scale-110"
            onClick={handleAdd}
            aria-label="Add to cart"
        >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
    );
}
