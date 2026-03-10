'use client';

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { type FC } from "react";
import { Bot, User, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const MyThread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col bg-background">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto scroll-smooth p-4 sm:p-6 md:px-10">
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <div className="border-t border-border bg-background/80 backdrop-blur-sm p-3 sm:p-4 md:px-10">
        <div className="max-w-3xl mx-auto relative">
          <MyComposer />
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-6 flex flex-row-reverse gap-3 items-start max-w-3xl mx-auto">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
        <User className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-end max-w-[80%]">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 text-right">
          ΜΗΧΑΝΙΚΟΣ ΕΡΓΟΥ
        </span>
        <div className="rounded-lg px-4 py-3 bg-primary text-primary-foreground text-sm shadow-sm ring-1 ring-primary/20">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-6 flex gap-3 items-start max-w-3xl mx-auto relative">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <Bot className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="flex flex-col max-w-[80%]">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          PAVLICEVITS AI SUPPORT
        </span>
        <div className="rounded-lg px-4 py-3 bg-card border border-border text-foreground text-sm shadow-sm ring-1 ring-border/50 transition-all duration-300">
           <MessagePrimitive.Content 
             components={{
               Text: ({ text }) => (
                 <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-accent">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {text}
                   </ReactMarkdown>
                 </div>
               )
             }}
           />
           
           <ThreadPrimitive.If running>
             <MessagePrimitive.If last>
                <div className="mt-2 flex items-center gap-1.5 text-accent animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">ΑΝΑΛΥΣΗ ΈΡΓΟΥ...</span>
                </div>
             </MessagePrimitive.If>
           </ThreadPrimitive.If>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const MyComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="relative flex flex-col gap-2">
      <div className="flex items-center gap-2 relative">
        <ComposerPrimitive.Input
          placeholder="Περιγράψτε το έργο σας ή ρωτήστε τεχνικά..."
          rows={1}
          autoFocus={false}
          className="w-full bg-card border border-border rounded-lg px-4 py-3 pr-24 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all placeholder:text-muted-foreground min-h-[48px]"
        />
        
        <div className="absolute right-3 bottom-2.5 flex items-center gap-1">
          <ComposerPrimitive.Send className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </ComposerPrimitive.Send>
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
};
