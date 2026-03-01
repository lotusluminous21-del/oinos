import * as React from "react"
import { cn } from "@/lib/utils"
import { Brain, User } from "lucide-react"
import Image from "next/image"

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

export function ChatBubble({ role, content, imageUrl, className, ...props }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start", className)} {...props}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-skeuo-avatar">
            <Brain className="w-[22px] h-[22px] text-skeuo-pink drop-shadow-[0_2px_2px_rgba(219,39,119,0.3)]" strokeWidth={2.5} />
          </div>
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] px-[20px] py-[14px]",
          isUser
            ? "bg-skeuo-accent rounded-[24px] rounded-tr-[8px] shadow-[0_4px_14px_rgba(0,212,202,0.35),inset_1px_1px_2px_rgba(255,255,255,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.05)] text-slate-800"
            : "bg-skeuo-bg rounded-[24px] rounded-tl-[8px] shadow-skeuo-raised text-slate-700"
        )}
      >
        {imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden">
            <div className="relative aspect-video w-full max-w-[240px]">
              <Image src={imageUrl} alt="Uploaded image" fill className="object-cover" />
            </div>
          </div>
        )}
        <p className="text-[15px] font-semibold leading-[1.4] tracking-tight whitespace-pre-wrap">{content}</p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-skeuo-avatar">
            <User className="w-[20px] h-[20px] text-slate-600" strokeWidth={2} />
          </div>
        </div>
      )}
    </div>
  )
}
