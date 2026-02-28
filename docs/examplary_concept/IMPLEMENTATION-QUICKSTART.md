# Implementation Quick-Start Guide

**For AI Agent in IDE - Getting Started Fast**

---

## Pre-Flight Checklist

Before writing any code, complete these steps:

### Step 1: Understand the Brownleaf Project Structure

- [ ] Locate the `lib/` directory structure
- [ ] Identify existing Shopify integration files
- [ ] Find the existing cart state management (Zustand/Context/etc.)
- [ ] Note the existing component library and design tokens
- [ ] Check for existing TypeScript configurations

### Step 2: Read Core Concept Documents

**Minimum Required Reading (in order):**

1. `V2-CONCEPT-INDEX.md` - Master overview (5 min)
2. `V2-CONCEPT-01-OVERVIEW.md` - System purpose (5 min)
3. `V2-CONCEPT-10-EXPANDED-SCENARIOS.md` - All 5 project types (10 min)
4. `V2-CONCEPT-11-UNIFIED-KNOWLEDGE-STATE.md` - State structure (10 min)

### Step 3: Identify Shopify Product Schema

```typescript
// Find and document the existing Shopify product type
// Usually in a types file or API response handler
interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  // ... document all fields
}
```

---

## Phase 1 Micro-Steps

### 1.1.1 Create the Expert System Directory

```bash
mkdir -p lib/expert-system
```

### 1.1.2 Create types.ts - Part 1: Enums

```typescript
// lib/expert-system/types.ts

// Project Types (from V2-CONCEPT-10-EXPANDED-SCENARIOS.md)
export type ProjectType = 
  | 'damage-repair'
  | 'new-parts-painting'
  | 'restoration'
  | 'protective-coatings'
  | 'custom-finishes';

// Damage Classification (from V2-CONCEPT-03-INFORMATION-TAXONOMY.md)
export type DamageType = 
  | 'scratch'
  | 'chip'
  | 'dent'
  | 'crack'
  | 'rust'
  | 'paint-fade'
  | 'oxidation'
  | 'clear-coat-failure';

export type DamageDepth = 
  | 'surface'
  | 'through-clear'
  | 'to-primer'
  | 'to-metal'
  | 'deep-dent';

// Continue with all enums from V2-03...
```

### 1.1.3 Create types.ts - Part 2: Confidence System

```typescript
// Confidence (from V2-CONCEPT-02-KNOWLEDGE-STATE.md)
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface InferredValue<T> {
  value: T;
  confidence: ConfidenceLevel;
  source: string;  // What triggered this inference
}
```

### 1.1.4 Create types.ts - Part 3: Knowledge State

```typescript
// Knowledge State (from V2-CONCEPT-11-UNIFIED-KNOWLEDGE-STATE.md)
export interface KnowledgeState {
  projectContext: {
    projectType: ProjectType | null;
    subtype: string | null;
    goals: string[];
  };
  
  confirmed: {
    damageType?: DamageType;
    damageDepth?: DamageDepth;
    material?: MaterialType;
    location?: string;
    colorType?: ColorType;
    colorDescription?: string;
    sizeCategory?: SizeCategory;
    rustCondition?: RustCondition;
    partCondition?: PartCondition;
    protectionGoal?: ProtectionGoal;
    equipmentLevel?: EquipmentLevel;
    hasCompressor?: boolean;
    hasSprayGun?: boolean;
  };
  
  inferred: {
    damageType?: InferredValue<DamageType>;
    damageDepth?: InferredValue<DamageDepth>;
    material?: InferredValue<MaterialType>;
    // ... all fields with InferredValue wrapper
  };
  
  gaps: {
    critical: string[];
    important: string[];
    optional: string[];
  };
}
```

### 1.1.5 Create types.ts - Part 4: Conversation Types

```typescript
// Messages
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

// Questions (from V2-CONCEPT-04-CONVERSATION-FLOW.md)
export interface QuestionOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  contextText?: string;
  type: 'single-select' | 'multi-select' | 'text';
  options?: QuestionOption[];
  helpText?: string;
  forProjectTypes?: ProjectType[];
  triggeredByGap: string;
}
```

### 1.1.6 Create types.ts - Part 5: Solution Types

```typescript
// Solutions (from V2-CONCEPT-05-SOLUTION-GENERATION.md)
export interface SolutionProduct {
  product: ExpertProduct;  // Defined in shopify-adapter
  quantity: number;
  isEssential: boolean;
  reason: string;
}

export interface SolutionStep {
  order: number;
  title: string;
  description: string;
  tips: string[];
  products: SolutionProduct[];
}

export interface Solution {
  id: string;
  title: string;
  projectType: ProjectType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: SolutionStep[];
  totalPrice: number;
  totalProducts: number;
  assumptions: string[];
}
```

---

## Verification Checkpoint

After completing Phase 1.1:

```bash
# Run TypeScript compiler to check for errors
npx tsc --noEmit lib/expert-system/types.ts
```

Expected output: No errors

---

## Next: Phase 1.2 Shopify Adapter

Once types.ts compiles cleanly, proceed to create shopify-adapter.ts:

1. Import the Shopify product type from brownleaf
2. Create `ExpertProduct` interface
3. Create `mapShopifyToExpert()` function
4. Create `parseShopifyTags()` function

Refer to: `IMPLEMENTATION-BLUEPRINT.md` → Phase 1.2

---

## Common Pitfalls to Avoid

### 1. Don't Hardcode Products
The prototype had a hardcoded product catalog. In brownleaf, all products come from Shopify. Never hardcode product data.

### 2. Don't Override Brownleaf Styles
Use brownleaf's existing design tokens, colors, and component styles. The V2-06 document describes *functionality*, not visual styling.

### 3. Don't Create Duplicate Cart Logic
Brownleaf has an existing cart. Create adapter functions to integrate with it, don't create a separate cart.

### 4. Preserve Shopify Product References
Always keep the Shopify product ID/handle for cart integration and linking to product pages.

---

## File Creation Order

```
1. lib/expert-system/types.ts          ← Start here
2. lib/expert-system/shopify-adapter.ts
3. lib/expert-system/product-service.ts
4. lib/expert-system/knowledge-state.ts
5. lib/expert-system/project-detector.ts
6. lib/expert-system/text-parser.ts
7. lib/expert-system/image-analyzer.ts
8. lib/expert-system/question-generator.ts
9. lib/expert-system/response-generator.ts
10. lib/expert-system/engine.ts
11. lib/expert-system/solution-generator.ts
12. lib/expert-system/product-matcher.ts
13. lib/expert-system/store.ts
14. components/expert-system/*.tsx     ← All UI components
15. app/expert/page.tsx
```

Each file should be complete and compilable before moving to the next.

---

**Ready to begin? Start with Phase 1.1.2 above.**
