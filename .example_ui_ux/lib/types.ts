// Core types for the dynamic consultation system

export type DamageType = 'scratch' | 'rust' | 'chip' | 'dent' | 'fade' | 'peel';
export type DamageDepth = 'surface' | 'throughClear' | 'toPrimer' | 'toMetal';
export type MaterialType = 'metal' | 'plastic' | 'fiberglass' | 'mixed';
export type ColorType = 'solid' | 'metallic' | 'pearl' | 'tricoat';
export type SizeType = 'tiny' | 'small' | 'medium' | 'large';
export type EquipmentType = 'aerosol' | 'sprayGun' | 'none';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface InferredValue<T> {
  value: T;
  confidence: number; // 0-1
  source: 'text' | 'image' | 'context' | 'default';
}

export interface KnowledgeState {
  // Confirmed information (user explicitly stated)
  confirmed: {
    damageType?: DamageType;
    damageDepth?: DamageDepth;
    material?: MaterialType;
    rustPresent?: boolean;
    colorType?: ColorType;
    colorDescription?: string;
    colorCode?: string;
    size?: SizeType;
    equipment?: EquipmentType;
    location?: string; // e.g., "door", "bumper", "hood"
    vehicleInfo?: {
      make?: string;
      model?: string;
      year?: string;
    };
  };
  
  // Inferred information (AI extracted with confidence)
  inferred: {
    damageType?: InferredValue<DamageType>;
    damageDepth?: InferredValue<DamageDepth>;
    material?: InferredValue<MaterialType>;
    rustPresent?: InferredValue<boolean>;
    colorType?: InferredValue<ColorType>;
    colorDescription?: InferredValue<string>;
    size?: InferredValue<SizeType>;
  };
  
  // What we still need to know
  gaps: {
    critical: string[];   // Must have for solution
    important: string[];  // Significantly affects solution
    optional: string[];   // Can default if missing
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  imageAnalysis?: ImageAnalysisResult;
}

export interface ImageAnalysisResult {
  damageType?: { value: DamageType; confidence: number };
  damageDepth?: { value: DamageDepth; confidence: number };
  rustPresent?: { value: boolean; confidence: number };
  material?: { value: MaterialType; confidence: number };
  colorDescription?: { value: string; confidence: number };
  colorType?: { value: ColorType; confidence: number };
  sizeEstimate?: { value: SizeType; confidence: number };
  summary: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  value: any;
}

export interface Question {
  id: string;
  field: string;
  text: string;
  helpText?: string;
  type: 'single-select' | 'multi-select' | 'text' | 'color-picker';
  options?: QuestionOption[];
  required: boolean;
}

export interface SolutionStep {
  order: number;
  title: string;
  description: string;
  proTips: string[];
  warnings?: string[];
  duration?: string;
  products: SolutionProduct[];
}

export interface SolutionProduct {
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  image: string;
  reason: string;
  isEssential: boolean;
  quantity: number;
  alternatives?: string[]; // product slugs
}

export interface Solution {
  id: string;
  title: string;
  summary: {
    estimatedTime: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    priceRange: { min: number; max: number };
  };
  basedOn: {
    damageType: string;
    damageDepth: string;
    material: string;
    colorType: string;
    size: string;
    rustPresent: boolean;
    equipment: string;
  };
  assumptions: string[];
  steps: SolutionStep[];
  totalProducts: number;
  totalPrice: number;
}

export interface ConversationState {
  sessionId: string;
  messages: Message[];
  knowledgeState: KnowledgeState;
  currentQuestion: Question | null;
  solution: Solution | null;
  status: 'idle' | 'gathering' | 'generating' | 'complete';
}

export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  fromSolution?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  brand?: string | null;
  sku?: string | null;
  inStock: boolean;
  expertTip?: string | null;
  compatibleWith: string[];
  tags: string[];
  useCases: string[];
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  _count?: { products: number };
}
