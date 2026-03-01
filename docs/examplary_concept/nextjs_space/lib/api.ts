import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { Message, KnowledgeState, Solution } from './types';

export interface ExpertChatRequest {
    message: string;
    history: { role: string; content: string }[];
    state: KnowledgeState | null;
}

export interface ExpertChatResponse {
    answer: string;
    question?: {
        id: string;
        text: string;
        type: 'multiple-choice' | 'text' | 'boolean' | 'image';
        options?: { id: string; label: string; value: any }[];
    };
    suggested_products: any[];
    solution?: Solution;
    state: KnowledgeState;
    ready_for_solution: boolean;
    proposed_action?: any;
}

export async function callExpertChat(data: ExpertChatRequest): Promise<ExpertChatResponse> {
    if (!functions) {
        throw new Error('Firebase functions not initialized');
    }

    const expertChat = httpsCallable<ExpertChatRequest, ExpertChatResponse>(
        functions,
        'expert_chat'
    );

    try {
        const result = await expertChat(data);
        return result.data;
    } catch (error) {
        console.error('Error calling expert_chat:', error);
        throw error;
    }
}
