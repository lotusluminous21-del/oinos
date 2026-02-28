// src/lib/expert/types.ts

// Must match functions/expert/schema.py exactly

export type ProjectDomain = 'automotive' | 'marine' | 'structural' | 'home' | 'industrial' | 'unknown';

export type ConfidenceLevel = 'none' | 'low' | 'medium' | 'high';

export interface InferredValue<T> {
    value: T;
    confidence: ConfidenceLevel;
    source: string;
}

export interface Taxonomies {
    material: string | null;
    damage_depth: string | null;
    environment: string | null;
    rust: string | null;
    color_type: string | null;
    budget: string | null;
}

export interface KnowledgeGaps {
    critical: string[];
    important: string[];
    optional: string[];
}

export interface KnowledgeState {
    domain: ProjectDomain;
    project_type: string | null;
    confirmed_facts: Partial<Taxonomies> & Record<string, any>;
    inferred_facts: Record<string, InferredValue<any>>;
    gaps: KnowledgeGaps;
}

export interface ExpertQuestion {
    id: string;
    text: string;
    type: 'single-select' | 'multi-select' | 'text';
    options?: { id: string; label: string; description?: string }[];
    help_text?: string;
}

export interface SolutionStep {
    order: number;
    title: string;
    description: string;
    products: string[]; // Shopify product handles
    tips: string[];
    warnings?: string[];
}

export interface Solution {
    id: string;
    title: string;
    projectType: string;
    difficulty: string;
    estimatedTime: string;
    steps: SolutionStep[];
    totalPrice: number;
    totalProducts: number;
    assumptions: string[];
}

export interface SuggestedProduct {
    handle: string;
    title: string;
    image?: string;
    price?: number;
    reason?: string;
}

export interface ExpertChatResponse {
    answer: string;
    understanding_summary?: string;
    question?: ExpertQuestion;
    clarification_needed?: string;
    ready_for_solution: boolean;
    solution?: Solution;
    suggested_products: SuggestedProduct[];
    safety_warnings: string[];
    state: KnowledgeState; // The engine returns the modified state back
}

export interface ExpertChatRequest {
    message?: string;
    image_url?: string;
    state: KnowledgeState;
    history: { role: 'user' | 'model'; content: string }[];
}
