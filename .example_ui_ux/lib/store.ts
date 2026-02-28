'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  KnowledgeState,
  Message,
  Question,
  Solution,
  CartItem,
  ConversationState,
} from './types';
import { createInitialKnowledgeState, updateGaps, isReadyForSolution } from './knowledge-state';
import { generateId } from './utils';

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

      addUserMessage: (content, imageUrl) => {
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
        }));
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
          
          // Recalculate gaps
          const updatedState = updateGaps(newState);
          
          return { knowledgeState: updatedState };
        });
      },

      setCurrentQuestion: (question) => {
        set({ currentQuestion: question });
      },

      answerQuestion: (field, value) => {
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
          };
        });
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
        // Don't persist conversation - fresh each visit
      }),
    }
  )
);
