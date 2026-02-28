// src/lib/expert/store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { KnowledgeState, ExpertChatResponse } from './types';
import { getFirebaseDb, getFirebaseAuth } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { removeUndefined } from '../utils';
import { onAuthStateChanged } from 'firebase/auth';

// The default initial state matching python's KnowledgeState baseline
const initialState: KnowledgeState = {
    domain: 'unknown',
    project_type: null,
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

