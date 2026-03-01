'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  KnowledgeState,
  Message,
  Question,
  Solution,
  CartItem,
} from './types';
import { createInitialKnowledgeState, updateGaps } from './knowledge-state';
import { generateId } from './utils';
import { callExpertChat } from './api';

interface AppStore {
  // Conversation state
  sessionId: string;
  messages: Message[];
  knowledgeState: KnowledgeState;
  currentQuestion: Question | null;
  solution: Solution | null;
  status: 'idle' | 'gathering' | 'generating' | 'complete';
  isTyping: boolean;

  // Cart state
  cart: CartItem[];

  // Actions - Conversation
  initSession: () => void;
  addUserMessage: (content: string, imageUrl?: string) => void;
  addAssistantMessage: (content: string) => void;
  updateKnowledgeState: (updates: Partial<KnowledgeState['confirmed']>, inferences?: Partial<KnowledgeState['inferred']>) => void;
  setCurrentQuestion: (question: Question | null) => void;
  answerQuestion: (field: string, value: any) => void;
  setSolution: (solution: Solution | null) => void;
  setStatus: (status: 'idle' | 'gathering' | 'generating' | 'complete') => void;
  setIsTyping: (isTyping: boolean) => void;
  resetConversation: () => void;

  // Actions - Cart
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  addSolutionToCart: (solution: Solution) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: '',
      messages: [],
      knowledgeState: createInitialKnowledgeState(),
      currentQuestion: null,
      solution: null,
      status: 'idle',
      isTyping: false,
      cart: [],

      // Conversation actions
      initSession: () => {
        const existing = get().sessionId;
        if (!existing) {
          set({ sessionId: generateId() });
        }
      },

      addUserMessage: async (content, imageUrl) => {
        const message: Message = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: new Date(),
          imageUrl,
        };

        set(state => ({
          messages: [...state.messages, message],
          status: 'gathering',
          isTyping: true,
        }));

        try {
          const { messages, knowledgeState, sessionId } = get();
          const response = await callExpertChat({
            message: content,
            history: messages.map(m => ({ role: m.role, content: m.content })),
            state: knowledgeState,
          });

          const assistantMsg: Message = {
            id: generateId(),
            role: 'assistant',
            content: response.answer,
            timestamp: new Date(),
          };

          set(state => ({
            messages: [...state.messages, assistantMsg],
            knowledgeState: response.state,
            currentQuestion: response.question ? {
              id: response.question.id,
              field: response.question.id,
              text: response.question.text,
              type: response.question.type === 'multiple-choice' ? 'single-select' : response.question.type,
              options: response.question.options?.map(o => ({
                id: o.id,
                label: o.label,
                value: o.value,
              })),
              required: true,
            } : null,
            solution: response.solution || null,
            status: response.ready_for_solution ? 'complete' : 'gathering',
            isTyping: false,
          }));
        } catch (error) {
          console.error('Failed to get AI response:', error);
          set({ isTyping: false });
        }
      },

      addAssistantMessage: (content) => {
        const message: Message = {
          id: generateId(),
          role: 'assistant',
          content,
          timestamp: new Date(),
        };
        set(state => ({
          messages: [...state.messages, message],
        }));
      },

      updateKnowledgeState: (updates, inferences) => {
        set(state => {
          const newState: KnowledgeState = {
            ...state.knowledgeState,
            confirmed: {
              ...state.knowledgeState.confirmed,
              ...updates,
            },
            inferred: inferences ? {
              ...state.knowledgeState.inferred,
              ...inferences,
            } : state.knowledgeState.inferred,
            gaps: state.knowledgeState.gaps,
          };

          const updatedState = updateGaps(newState);

          return { knowledgeState: updatedState };
        });
      },

      setCurrentQuestion: (question) => {
        set({ currentQuestion: question });
      },

      answerQuestion: async (field, value) => {
        // Optimistic update
        set(state => {
          const newConfirmed = {
            ...state.knowledgeState.confirmed,
            [field]: value,
          };

          const newState: KnowledgeState = {
            ...state.knowledgeState,
            confirmed: newConfirmed,
            gaps: state.knowledgeState.gaps,
          };

          const updatedState = updateGaps(newState);

          return {
            knowledgeState: updatedState,
            currentQuestion: null,
            isTyping: true,
          };
        });

        // Call backend to sync state and get next response
        try {
          const { messages, knowledgeState } = get();
          const response = await callExpertChat({
            message: `Selected: ${value}`, // Descriptive message for hidden state sync
            history: messages.map(m => ({ role: m.role, content: m.content })),
            state: knowledgeState,
          });

          const assistantMsg: Message = {
            id: generateId(),
            role: 'assistant',
            content: response.answer,
            timestamp: new Date(),
          };

          set(state => ({
            messages: [...state.messages, assistantMsg],
            knowledgeState: response.state,
            currentQuestion: response.question ? {
              id: response.question.id,
              field: response.question.id,
              text: response.question.text,
              type: response.question.type === 'multiple-choice' ? 'single-select' : response.question.type,
              options: response.question.options?.map(o => ({
                id: o.id,
                label: o.label,
                value: o.value,
              })),
              required: true,
            } : null,
            solution: response.solution || null,
            status: response.ready_for_solution ? 'complete' : 'gathering',
            isTyping: false,
          }));
        } catch (error) {
          console.error('Failed to sync answer with backend:', error);
          set({ isTyping: false });
        }
      },

      setSolution: (solution) => {
        set({ solution, status: solution ? 'complete' : 'gathering' });
      },

      setStatus: (status) => {
        set({ status });
      },

      setIsTyping: (isTyping) => {
        set({ isTyping });
      },

      resetConversation: () => {
        set({
          messages: [],
          knowledgeState: createInitialKnowledgeState(),
          currentQuestion: null,
          solution: null,
          status: 'idle',
          isTyping: false,
        });
      },

      // Cart actions
      addToCart: (item, quantity = 1) => {
        set(state => {
          const existing = state.cart.find(i => i.productId === item.productId);
          if (existing) {
            return {
              cart: state.cart.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            cart: [...state.cart, { ...item, quantity }],
          };
        });
      },

      removeFromCart: (productId) => {
        set(state => ({
          cart: state.cart.filter(i => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set(state => ({
          cart: state.cart.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      addSolutionToCart: (solution) => {
        solution.steps.forEach(step => {
          step.products.forEach(product => {
            if (product.isEssential) {
              get().addToCart({
                productId: product.productId,
                productSlug: product.productSlug,
                name: product.name,
                price: product.price,
                image: product.image,
                fromSolution: true,
              }, product.quantity);
            }
          });
        });
      },
    }),
    {
      name: 'pavlicevits-store',
      partialize: (state) => ({
        sessionId: state.sessionId,
        cart: state.cart,
      }),
    }
  )
);
