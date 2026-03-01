// src/lib/expert/store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { KnowledgeState, ExpertChatResponse } from './types';
import { getFirebaseDb, getFirebaseAuth } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { removeUndefined } from '../utils';
import { onAuthStateChanged } from 'firebase/auth';
import { callExpertChat } from './api';

// The default initial state matching python's KnowledgeState baseline
const initialState: KnowledgeState = {
    domain: 'unknown',
    project_type: 'unknown',
    confirmed_facts: {},
    inferred_facts: {},
    gaps: { critical: [], important: [], optional: [] }
};

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: number;
    // Expanded data returned by the backend
    understanding_summary?: string;
    question?: any;
    clarification_needed?: string;
    ready_for_solution?: boolean;
    solution?: any;
    suggested_products?: any[];
    step_by_step_recipe?: string[];
    safety_warnings?: string[];
}

interface ExpertSystemState {
    sessionId: string;
    messages: ChatMessage[];
    knowledgeState: KnowledgeState;
    isTyping: boolean;
    isSyncing: boolean;
    solution: ExpertChatResponse['solution'] | null;

    // Actions
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    sendMessage: (content: string, imageUrl?: string) => Promise<void>;
    answerExpertQuestion: (value: any) => Promise<void>;
    setTyping: (typing: boolean) => void;
    updateKnowledgeState: (newState: KnowledgeState) => void;
    setSolution: (solution: ExpertChatResponse['solution']) => void;
    resetSession: () => void;
    syncWithFirestore: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(7);

export const useExpertStore = create<ExpertSystemState>()(
    persist(
        (set, get) => ({
            sessionId: generateId(),
            messages: [],
            knowledgeState: initialState,
            isTyping: false,
            isSyncing: false,
            solution: null,

            addMessage: (msgInput) => {
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            ...msgInput,
                            id: generateId(),
                            timestamp: Date.now()
                        }
                    ]
                }));
                get().syncWithFirestore();
            },

            sendMessage: async (content, imageUrl) => {
                const { messages, knowledgeState, addMessage, setTyping } = get();

                // Add user message locally
                addMessage({
                    role: 'user',
                    content,
                    // imageUrl
                });

                setTyping(true);

                try {
                    const response = await callExpertChat({
                        message: content,
                        image_url: imageUrl,
                        state: knowledgeState,
                        history: messages.map(m => ({
                            role: m.role === 'user' ? 'user' : 'model',
                            content: m.content || ""
                        }))
                    });

                    // Add assistant response
                    addMessage({
                        role: 'assistant',
                        content: response.answer || "",
                        understanding_summary: response.understanding_summary,
                        question: response.question,
                        clarification_needed: response.clarification_needed,
                        ready_for_solution: response.ready_for_solution,
                        solution: response.solution,
                        suggested_products: response.suggested_products,
                        safety_warnings: response.safety_warnings
                    });

                    // Update knowledge state from engine
                    set((state) => ({
                        knowledgeState: response.state || state.knowledgeState,
                        solution: response.solution || state.solution || null
                    }));

                } catch (error) {
                    console.error("Expert Chat Error:", error);
                    addMessage({
                        role: 'assistant',
                        content: "Συγγνώμη, παρουσιάστηκε ένα σφάλμα κατά την επικοινωνία με τον ειδικό. Παρακαλώ δοκιμάστε ξανά σε λίγο.",
                    });
                } finally {
                    setTyping(false);
                }
            },

            answerExpertQuestion: async (value) => {
                const { messages, knowledgeState, sendMessage, addMessage, setTyping } = get();

                const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant' && m.question);
                const question = lastAssistantMsg?.question;

                if (!question) {
                    console.warn("No active question to answer");
                    return;
                }

                // Find the display label for the user bubble
                let displayLabel = String(value);
                if (question.options) {
                    const option = question.options.find((o: any) => o.id === value || o.value === value);
                    if (option) displayLabel = option.label;
                }

                // Optimistically pre-confirm this field in the local state
                // This ensures the backend always sees it in confirmed_facts, not just inferred
                const preConfirmedState = {
                    ...knowledgeState,
                    confirmed_facts: {
                        ...knowledgeState.confirmed_facts,
                        [question.id]: value,
                    }
                };

                // Add user bubble showing what was selected
                addMessage({ role: 'user', content: `Επέλεξα: ${displayLabel}` });
                setTyping(true);

                try {
                    const { callExpertChat } = await import('./api');
                    const response = await callExpertChat({
                        message: String(value), // raw machine value — unambiguous for extractor
                        state: preConfirmedState,
                        history: messages.map(m => ({
                            role: m.role === 'user' ? 'user' : 'model',
                            content: m.content || ""
                        }))
                    });

                    addMessage({
                        role: 'assistant',
                        content: response.answer || "",
                        question: response.question,
                        ready_for_solution: response.ready_for_solution,
                        solution: response.solution,
                        suggested_products: response.suggested_products,
                        safety_warnings: response.safety_warnings,
                    });

                    set((state) => ({
                        knowledgeState: response.state || preConfirmedState,
                        solution: response.solution || state.solution || null
                    }));
                } catch (error) {
                    console.error("answerExpertQuestion error:", error);
                    addMessage({ role: 'assistant', content: "Συγγνώμη, παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά." });
                } finally {
                    setTyping(false);
                }
            },

            setTyping: (typing) => set({ isTyping: typing }),

            updateKnowledgeState: (newState) => {
                set({ knowledgeState: newState });
                get().syncWithFirestore();
            },

            setSolution: (solution) => {
                set({ solution });
                get().syncWithFirestore();
            },

            resetSession: () => set({
                sessionId: generateId(),
                messages: [],
                knowledgeState: initialState,
                isTyping: false,
                solution: null
            }),

            syncWithFirestore: async () => {
                const state = get();
                if (state.isSyncing) return;

                try {
                    set({ isSyncing: true });
                    const auth = getFirebaseAuth();
                    const user = auth.currentUser;

                    if (user) {
                        const db = getFirebaseDb();
                        const sessionRef = doc(db, 'users', user.uid, 'expert_sessions', state.sessionId);

                        const payload = removeUndefined({
                            sessionId: state.sessionId,
                            messages: state.messages,
                            knowledgeState: state.knowledgeState,
                            updatedAt: new Date().toISOString()
                        });

                        await setDoc(sessionRef, payload, { merge: true });
                    }
                } catch (error) {
                    console.error("Failed to sync expert store with Firestore:", error);
                } finally {
                    set({ isSyncing: false });
                }
            }
        }),
        {
            name: 'pavlicevits-expert-session', // LocalStorage Key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                sessionId: state.sessionId,
                messages: state.messages,
                knowledgeState: state.knowledgeState
            }), // Only persist these
        }
    )
);

// Initialize auth listener to sync when user logs in
if (typeof window !== 'undefined') {
    const auth = getFirebaseAuth();
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const store = useExpertStore.getState();
            store.syncWithFirestore();
        }
    });
}

