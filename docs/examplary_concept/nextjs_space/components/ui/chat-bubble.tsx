import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
}

export function ChatBubble({
  role,
  content,
  imageUrl,
  className,
  ...props
}: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-[14px] mt-1">
          <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.9),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)]">
            <Brain
              className="w-[22px] h-[22px] text-skeuo-pink drop-shadow-[0_2px_2px_rgba(219,39,119,0.3)]"
              strokeWidth={2.5}
            />
          </div>
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] px-[20px] py-[14px]",
          isUser
            ? "bg-skeuo-accent rounded-[24px] rounded-tr-[8px] shadow-[0_4px_14px_rgba(0,212,202,0.35),inset_1px_1px_2px_rgba(255,255,255,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.05)] text-slate-800"
            : "bg-skeuo-bg rounded-[24px] rounded-tl-[8px] shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.8),1px_1px_2px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,1)] text-slate-700"
        )}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="rounded-lg mb-2 max-w-full max-h-[200px] object-contain"
          />
        )}
        <p className="text-[15px] font-semibold leading-[1.3] tracking-tight whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
}
