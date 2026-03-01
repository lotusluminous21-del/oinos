import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import type { ExpertChatRequest, ExpertChatResponse } from './types';

export async function callExpertChat(data: ExpertChatRequest): Promise<ExpertChatResponse> {
    if (!functions) {
        throw new Error('Firebase functions not initialized');
    }

    // V2: multi-agent architecture with deterministic state machine
    const expertChat = httpsCallable<ExpertChatRequest, ExpertChatResponse>(
        functions,
        'expert_chat_v2'
    );

    try {
        const result = await expertChat(data);
        return result.data;
    } catch (error) {
        console.error('Error calling expert_chat_v2:', error);
        throw error;
    }
}
