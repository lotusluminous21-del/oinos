'use client';

import { useExternalStoreRuntime } from "@assistant-ui/react";
import { useExpertStore } from "./store";
import { useMemo } from "react";

export const useExpertRuntime = () => {
    const { messages, sendMessage, isTyping } = useExpertStore();

    const threadMessages = useMemo(() => messages.map(m => {
        const common = {
            id: m.id,
            createdAt: new Date(m.timestamp),
            content: [{ type: "text" as const, text: m.content }],
        };

        if (m.role === 'assistant') {
            return {
                ...common,
                role: 'assistant' as const,
                status: { type: "complete" as const, reason: "stop" as const },
                metadata: {
                    unstable_state: {},
                    unstable_annotations: [],
                    unstable_data: [],
                    steps: [],
                    custom: {},
                },
            };
        }

        return {
            ...common,
            role: 'user' as const,
            attachments: [],
            metadata: {
                custom: {},
            },
        };
    }), [messages]);

    const runtime = useExternalStoreRuntime({
        messages: threadMessages,
        onNew: async (message) => {
            const textPart = message.content.find((p): p is { type: 'text'; text: string } => p.type === 'text');
            if (textPart) {
                await sendMessage(textPart.text);
            }
        },
        isRunning: isTyping,
    });

    return runtime;
};
