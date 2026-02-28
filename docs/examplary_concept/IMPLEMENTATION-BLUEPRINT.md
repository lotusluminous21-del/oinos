# PAVLICEVITS AI Expert System - Implementation Blueprint for Brownleaf

**Target Project:** brownleaf (Next.js + Shopify backend)
**Date:** February 2026
**Version:** 1.0

---

## Overview

This blueprint guides the implementation of the PAVLICEVITS AI Expert Consultation System into the existing brownleaf project. The brownleaf project uses Shopify as its product backend and has its own established styling system.

**Key Adaptation Requirements:**
- Products come from Shopify API (not local database)
- Must preserve brownleaf's existing visual identity and styling
- Product schema will differ from prototype - mapping layer required
- Shopify product tags/metafields must be leveraged for AI matching

---

## Document References

All conceptual documents are located in: `/docs/`

| Doc ID | File | Purpose |
|--------|------|--------|
| V2-01 | `V2-CONCEPT-01-OVERVIEW.md` | System purpose, components, user journey |
| V2-02 | `V2-CONCEPT-02-KNOWLEDGE-STATE.md` | Core knowledge tracking mechanism |
| V2-03 | `V2-CONCEPT-03-INFORMATION-TAXONOMY.md` | All data dimensions and categories |
| V2-04 | `V2-CONCEPT-04-CONVERSATION-FLOW.md` | Non-linear dialogue logic |
| V2-05 | `V2-CONCEPT-05-SOLUTION-GENERATION.md` | Repair plan creation logic |
| V2-06 | `V2-CONCEPT-06-UI-COMPONENTS.md` | Interface elements (adapt to brownleaf styles) |
| V2-07 | `V2-CONCEPT-07-PRODUCT-CATALOG.md` | Original catalog structure |
| V2-08 | `V2-CONCEPT-08-IMAGE-ANALYSIS.md` | Photo input capabilities |
| V2-09 | `V2-CONCEPT-09-DATA-MODEL.md` | Conceptual entities |
| V2-10 | `V2-CONCEPT-10-EXPANDED-SCENARIOS.md` | All 5 project types (CRITICAL) |
| V2-11 | `V2-CONCEPT-11-UNIFIED-KNOWLEDGE-STATE.md` | Extended knowledge state for all scenarios |
| V2-12 | `V2-CONCEPT-12-EXPANDED-CONVERSATION-FLOWS.md` | Conversation examples per project type |
| V2-13 | `V2-CONCEPT-13-EXPANDED-PRODUCT-CATALOG.md` | Full catalog structure with tags |
| V2-INDEX | `V2-CONCEPT-INDEX.md` | Master index and glossary |

---

## Implementation Phases

---

# PHASE 1: Foundation & Data Layer
**Estimated Effort:** 2-3 sessions
**Dependencies:** None

---

## Phase 1.1: TypeScript Type Definitions

**Goal:** Create all type definitions that will be used throughout the system.

**Reference Docs:**
- `V2-CONCEPT-03-INFORMATION-TAXONOMY.md` - All data dimensions
- `V2-CONCEPT-11-UNIFIED-KNOWLEDGE-STATE.md` - Extended state structure
- `V2-CONCEPT-09-DATA-MODEL.md` - Conceptual entities

**Tasks:**

1. Create `lib/expert-system/types.ts` with:
   
   a) **Project Type Enums** (from V2-10):
   ```
   - DamageRepair
   - NewPartsPainting  
   - Restoration
   - ProtectiveCoatings
   - CustomFinishes
   ```
   
   b) **Information Taxonomy Types** (from V2-03):
   ```
   - DamageType: scratch | chip | dent | crack | rust | paint-fade | oxidation | clear-coat-failure
   - DamageDepth: surface | through-clear | to-primer | to-metal | deep-dent
   - MaterialType: metal | plastic | fiberglass | carbon-fiber | aluminum
   - ColorType: solid | metallic | pearl | matte | custom
   - SizeCategory: tiny | small | medium | large | panel | full-part
   - RustCondition: none | surface | moderate | severe
   - PartCondition: unpainted | pre-primed | bare-metal | painted | faded | damaged
   - ProtectionGoal: wax | sealant | ceramic | ppf-prep
   - EquipmentLevel: none | basic | intermediate | full-spray
   ```
   
   c) **Confidence System** (from V2-02):
   ```
   - ConfidenceLevel: high (>85%) | medium (60-85%) | low (<60%)
   - InferredValue<T>: { value: T, confidence: ConfidenceLevel, source: string }
   ```
   
   d) **Knowledge State Interface** (from V2-11):
   ```
   KnowledgeState {
     projectContext: {
       projectType: ProjectType | null
       subtype: string | null  
       goals: string[]
     }
     confirmed: {
       // All explicitly stated facts
     }
     inferred: {
       // All AI-derived facts with confidence
     }
     gaps: {
       critical: string[]
       important: string[]
       optional: string[]
     }
   }
   ```
   
   e) **Conversation Types**:
   ```
   - Message: { role, content, timestamp, imageUrl? }
   - Question: { id, text, type, options?, helpText? }
   - QuestionOption: { id, label, icon?, description? }
   ```
   
   f) **Solution Types** (from V2-05):
   ```
   - Solution: { id, title, steps, totalPrice, difficulty, estimatedTime, assumptions }
   - SolutionStep: { order, title, description, products, tips }
   - SolutionProduct: { product, quantity, isEssential, reason }
   ```

**Deliverable:** Complete type definitions file ready for import.

**Verification:** TypeScript compilation passes with no errors.

---

## Phase 1.2: Shopify Product Adapter

**Goal:** Create a mapping layer between Shopify products and the expert system's product requirements.

**Reference Docs:**
- `V2-CONCEPT-13-EXPANDED-PRODUCT-CATALOG.md` - Required product attributes
- `V2-CONCEPT-07-PRODUCT-CATALOG.md` - Original catalog structure

**Context:** Shopify products have their own schema (title, description, variants, tags, metafields). We need to map these to our expert system's requirements.

**Tasks:**

1. Create `lib/expert-system/shopify-adapter.ts`:

   a) **Define Shopify Product Interface** (what comes from Shopify):
   ```
   ShopifyProduct {
     id: string
     title: string
     handle: string
     description: string
     productType: string
     tags: string[]
     variants: ShopifyVariant[]
     images: ShopifyImage[]
     metafields?: ShopifyMetafield[]
   }
   ```

   b) **Define Expert System Product Interface** (what we need):
   ```
   ExpertProduct {
     id: string
     shopifyId: string
     name: string
     slug: string
     price: number
     image: string
     category: ProductCategory  // From V2-13
     tags: ProductTag[]         // Structured tags for matching
     expertTip?: string
     applicationNotes?: string
     compatibleWith?: string[]  // Other product slugs
   }
   ```
   
   c) **Define ProductTag Structure** (from V2-13):
   ```
   ProductTag {
     dimension: 'material' | 'projectType' | 'condition' | 'effect' | 'skillLevel'
     value: string
   }
   ```
   
   d) **Create Mapping Functions**:
   - `mapShopifyToExpert(shopifyProduct): ExpertProduct`
   - `parseShopifyTags(tags: string[]): ProductTag[]`
   - `extractCategory(productType: string, tags: string[]): ProductCategory`
   - `getExpertTip(metafields): string | undefined`

2. **Tag Parsing Strategy:**
   
   Shopify tags should follow convention: `expert:dimension:value`
   
   Examples:
   - `expert:material:plastic`
   - `expert:projectType:damage-repair`
   - `expert:condition:rust`
   - `expert:skillLevel:beginner`
   
   Parse these into structured ProductTag objects.

3. **Category Mapping:**
   
   Map Shopify productType to our 12 categories (from V2-13):
   - "Primer" → primers
   - "Clear Coat" → clear-coats
   - "Polish" → finishing
   - etc.

**Deliverable:** Adapter module that converts Shopify products to expert system format.

**Verification:** Unit tests passing for tag parsing and mapping.

---

## Phase 1.3: Product Fetching Service

**Goal:** Create service to fetch and cache products from Shopify with expert system enhancements.

**Tasks:**

1. Create `lib/expert-system/product-service.ts`:

   a) **Fetch Functions**:
   - `fetchAllProducts(): Promise<ExpertProduct[]>`
   - `fetchProductsByCategory(category): Promise<ExpertProduct[]>`
   - `fetchProductBySlug(slug): Promise<ExpertProduct | null>`
   - `searchProducts(query): Promise<ExpertProduct[]>`
   
   b) **Caching Layer**:
   - Implement in-memory cache with TTL
   - Cache invalidation strategy
   
   c) **Tag-Based Queries**:
   - `findProductsByTags(tags: ProductTag[]): Promise<ExpertProduct[]>`
   - `findProductsForProjectType(type: ProjectType): Promise<ExpertProduct[]>`
   - `findCompatibleProducts(productSlug: string): Promise<ExpertProduct[]>`

2. **Integration with Existing Brownleaf Shopify Setup:**
   - Identify existing Shopify client/API setup in brownleaf
   - Extend rather than replace existing product fetching
   - Add expert system fields without breaking existing functionality

**Deliverable:** Product service ready for use by AI engine.

**Verification:** Can fetch products and filter by expert tags.

---

# PHASE 2: Knowledge State System
**Estimated Effort:** 2-3 sessions
**Dependencies:** Phase 1 complete

---

## Phase 2.1: Knowledge State Manager

**Goal:** Implement the core knowledge state tracking system.

**Reference Docs:**
- `V2-CONCEPT-02-KNOWLEDGE-STATE.md` - Core concept
- `V2-CONCEPT-11-UNIFIED-KNOWLEDGE-STATE.md` - Extended state for all project types

**Tasks:**

1. Create `lib/expert-system/knowledge-state.ts`:

   a) **State Initialization**:
   ```
   createInitialKnowledgeState(): KnowledgeState
   ```
   - All confirmed fields null
   - All inferred fields empty
   - Gaps populated based on project type (or default if unknown)
   
   b) **State Updates**:
   ```
   confirmFact(state, field, value): KnowledgeState
   inferFact(state, field, value, confidence, source): KnowledgeState
   setProjectType(state, type): KnowledgeState
   ```
   
   c) **Gap Analysis** (from V2-11, critical logic):
   ```
   updateGaps(state): KnowledgeState
   ```
   - Critical gaps vary by project type:
     - Damage Repair: damageType, damageDepth, material
     - New Parts: partCondition, paintType, partType
     - Protection: protectionGoal, currentSurfaceState
     - etc.
   - Remove gaps when confirmed or high-confidence inferred
   - Add conditional gaps (e.g., rustCondition only if metal)
   
   d) **Readiness Checks**:
   ```
   isReadyForSolution(state): boolean
   getConfidenceLevel(state): 'high' | 'medium' | 'low'
   getMostImportantGap(state): string | null
   ```
   
   e) **Value Retrieval**:
   ```
   getEffectiveValue(state, field): any
   ```
   - Returns confirmed value if exists
   - Falls back to high-confidence inferred
   - Returns default if neither available
   
   f) **Defaults** (from V2-06 Defaults doc):
   ```
   DEFAULTS = {
     colorType: 'solid',
     equipmentLevel: 'basic',
     skillLevel: 'intermediate',
     // etc.
   }
   ```

**Deliverable:** Complete knowledge state management module.

**Verification:** State transitions work correctly for all project types.

---

## Phase 2.2: Project Type Detection

**Goal:** Implement logic to detect and infer project type from user input.

**Reference Docs:**
- `V2-CONCEPT-10-EXPANDED-SCENARIOS.md` - All 5 project types with detection indicators
- `V2-CONCEPT-11-UNIFIED-KNOWLEDGE-STATE.md` - Detection logic section

**Tasks:**

1. Create `lib/expert-system/project-detector.ts`:

   a) **Keyword Banks** (from V2-10):
   ```
   DAMAGE_KEYWORDS: ['scratch', 'chip', 'dent', 'crack', 'rust', 'damage', 'fix', 'repair']
   NEW_PARTS_KEYWORDS: ['new bumper', 'replacement', 'unpainted', 'bare plastic', 'install']
   RESTORATION_KEYWORDS: ['faded', 'oxidized', 'respray', 'restore', 'classic', 'whole car']
   PROTECTION_KEYWORDS: ['wax', 'ceramic', 'coating', 'protect', 'sealant', 'shine']
   CUSTOM_KEYWORDS: ['color change', 'custom', 'metallic', 'pearl', 'candy', 'effect']
   ```
   
   b) **Detection Function**:
   ```
   detectProjectType(text: string, imageAnalysis?: ImageAnalysisResult): {
     type: ProjectType | null
     confidence: ConfidenceLevel
     indicators: string[]  // What triggered the detection
   }
   ```
   
   c) **Priority Resolution** (when multiple types detected):
   1. Explicit mentions get highest priority
   2. Damage keywords checked first (most common)
   3. If ambiguous, return null and let conversation clarify
   
   d) **Subtype Detection**:
   ```
   detectSubtype(type: ProjectType, text: string): string | null
   ```
   - Damage → scratch/chip/dent/rust
   - Protection → wax/ceramic/sealant
   - etc.

**Deliverable:** Project type detection module.

**Verification:** Correctly identifies project type from sample inputs in V2-12.

---

# PHASE 3: AI Conversation Engine
**Estimated Effort:** 3-4 sessions
**Dependencies:** Phase 2 complete

---

## Phase 3.1: Text Parser

**Goal:** Extract structured information from natural language input.

**Reference Docs:**
- `V2-CONCEPT-03-INFORMATION-TAXONOMY.md` - All dimensions to extract
- `V2-CONCEPT-04-CONVERSATION-FLOW.md` - Parsing examples

**Tasks:**

1. Create `lib/expert-system/text-parser.ts`:

   a) **Main Parse Function**:
   ```
   parseUserInput(text: string, currentState: KnowledgeState): ParseResult
   
   ParseResult {
     confirmed: Partial<ConfirmedFacts>
     inferred: Partial<InferredFacts>
     projectTypeHint?: ProjectType
   }
   ```
   
   b) **Dimension Extractors** (one per taxonomy dimension):
   - `extractDamageType(text): { value, confidence, indicators }`
   - `extractDamageDepth(text): { value, confidence, indicators }`
   - `extractMaterial(text): { value, confidence, indicators }`
   - `extractColor(text): { value, confidence, indicators }`
   - `extractSize(text): { value, confidence, indicators }`
   - `extractRustCondition(text): { value, confidence, indicators }`
   - `extractEquipment(text): { value, confidence, indicators }`
   - `extractPartCondition(text): { value, confidence, indicators }`
   - `extractProtectionGoal(text): { value, confidence, indicators }`
   
   c) **Keyword Mappings** (extensive lists from V2-03):
   ```
   DAMAGE_DEPTH_KEYWORDS = {
     surface: ['light', 'shallow', 'can feel', 'fingernail catches', 'surface'],
     throughClear: ['white marks', 'through clear', 'see primer'],
     toMetal: ['bare metal', 'silver showing', 'to metal', 'down to metal'],
     // etc.
   }
   ```
   
   d) **Confidence Assignment Logic**:
   - Explicit exact match → high confidence
   - Contextual inference → medium confidence  
   - Weak indicator → low confidence

**Example Parsing** (from V2-04):
```
Input: "I scratched my car door, the scratch is about 10cm long and I can see white marks"

Output:
  confirmed: {
    damageType: 'scratch',
    location: 'door'
  }
  inferred: {
    sizeCategory: { value: 'medium', confidence: 'high', source: '10cm measurement' },
    damageDepth: { value: 'through-clear', confidence: 'medium', source: 'white marks' }
  }
```

**Deliverable:** Robust text parsing module.

**Verification:** Test against all examples in V2-04 and V2-12.

---

## Phase 3.2: Image Analysis Integration

**Goal:** Integrate image analysis capabilities for photo-based consultation.

**Reference Docs:**
- `V2-CONCEPT-08-IMAGE-ANALYSIS.md` - Full image analysis specification

**Tasks:**

1. Create `lib/expert-system/image-analyzer.ts`:

   a) **Analysis Function**:
   ```
   analyzeImage(imageUrl: string): Promise<ImageAnalysisResult>
   
   ImageAnalysisResult {
     damageType?: { value, confidence }
     damageDepth?: { value, confidence }
     estimatedSize?: { value, confidence }
     surfaceType?: { value, confidence }
     rustPresent?: { value, confidence }
     colorDetected?: { value, confidence }
     overallCondition?: string
     analysisNotes?: string
   }
   ```
   
   b) **LLM Integration:**
   - Use existing LLM API (RouteLLM or similar)
   - Craft vision prompt specifically for automotive damage/paint analysis
   - Parse LLM response into structured ImageAnalysisResult
   
   c) **Vision Prompt Template:**
   ```
   "Analyze this automotive image. Identify:
   1. Type of damage or condition visible (scratch, chip, dent, rust, fade, etc.)
   2. Depth estimation (surface only, through clear coat, to primer, to metal)
   3. Size estimation (tiny <1cm, small 1-5cm, medium 5-15cm, large 15-30cm, panel 30cm+)
   4. Material visible (metal, plastic, etc.)
   5. Any rust or corrosion present
   6. Color type if discernible (solid, metallic, pearl)
   7. Overall condition assessment
   
   Provide confidence levels (high/medium/low) for each observation."
   ```
   
   d) **Confidence Handling:**
   - Map LLM confidence expressions to our levels
   - Handle "uncertain" or "cannot determine" gracefully
   
   e) **Fallback for No LLM:**
   - If LLM unavailable, return empty result
   - System should gracefully continue with text-only flow

**Deliverable:** Image analysis module.

**Verification:** Analyzes sample automotive images correctly.

---

## Phase 3.3: Question Generator

**Goal:** Dynamically generate contextual questions based on knowledge gaps.

**Reference Docs:**
- `V2-CONCEPT-04-CONVERSATION-FLOW.md` - Question logic
- `V2-CONCEPT-12-EXPANDED-CONVERSATION-FLOWS.md` - All project type questions

**Tasks:**

1. Create `lib/expert-system/question-generator.ts`:

   a) **Question Bank** (comprehensive, from V2-04 and V2-12):
   ```
   QUESTION_BANK: Record<string, Question>
   
   // Structure each question with:
   {
     id: 'damage-depth',
     text: "How deep does the damage appear?",
     contextText?: "Based on what you've described...",  // Personalized prefix
     type: 'single-select',
     options: [
       { id: 'surface', label: 'Surface only', description: 'Just the clear coat', icon: '✨' },
       { id: 'to-primer', label: 'To primer', description: 'Can see white/gray', icon: '🎨' },
       // etc.
     ],
     helpText: "Run your fingernail across - if it catches, it's likely deeper than surface.",
     forProjectTypes: ['damage-repair', 'restoration'],  // When applicable
     triggeredByGap: 'damageDepth'
   }
   ```
   
   b) **Question Selection Logic**:
   ```
   selectNextQuestion(state: KnowledgeState): Question | null
   ```
   - Get most important gap from state
   - Find question that addresses that gap
   - Personalize question text based on known context
   - Return null if ready for solution
   
   c) **Question Personalization**:
   ```
   personalizeQuestion(question: Question, state: KnowledgeState): Question
   ```
   - Add context: "Since you mentioned a scratch on metal..."
   - Filter options based on context
   - Adjust help text if relevant
   
   d) **Project-Type-Specific Questions** (from V2-12):
   - Different questions for each project type
   - Some questions only apply to certain types
   - Tag each question with applicable project types

**Deliverable:** Dynamic question generation module.

**Verification:** Generates appropriate questions for each project type.

---

## Phase 3.4: Response Generator

**Goal:** Generate AI assistant responses that drive the conversation.

**Reference Docs:**
- `V2-CONCEPT-04-CONVERSATION-FLOW.md` - Response patterns
- `V2-CONCEPT-12-EXPANDED-CONVERSATION-FLOWS.md` - Response examples

**Tasks:**

1. Create `lib/expert-system/response-generator.ts`:

   a) **Response Structure**:
   ```
   AIResponse {
     message: string           // The text to display
     understanding?: {         // Current understanding summary
       confirmed: UnderstandingItem[]
       inferred: UnderstandingItem[]
     }
     question?: Question       // Next question if any
     readyForSolution: boolean // Can generate solution now
     clarificationNeeded?: string  // If something needs clarification
   }
   ```
   
   b) **Response Generation**:
   ```
   generateResponse(state: KnowledgeState, lastUserInput: string): AIResponse
   ```
   - Acknowledge what was understood from input
   - Show current understanding (confirmed/inferred)
   - Include next question OR indicate solution ready
   
   c) **Understanding Summary Builder**:
   ```
   buildUnderstandingSummary(state: KnowledgeState): Understanding
   ```
   - List all confirmed facts with friendly labels
   - List inferred facts with confidence indicators
   
   d) **Response Templates** (natural language):
   ```
   TEMPLATES = {
     acknowledge: [
       "Got it! So you have a {damageType} on your {location}.",
       "I understand - you're dealing with a {damageType}.",
     ],
     transition: [
       "To help you fix this properly, I need to know...",
       "One more thing that will help me recommend the right products...",
     ],
     readyForSolution: [
       "I have enough information now. Let me put together a repair plan for you.",
       "Great! Based on everything you've told me, here's what I recommend...",
     ]
   }
   ```
   
   e) **Clarification Requests**:
   - When low-confidence inferences need confirmation
   - When contradictory information detected
   - When project type is ambiguous

**Deliverable:** Response generation module.

**Verification:** Generates natural, contextual responses.

---

## Phase 3.5: Main AI Engine Orchestrator

**Goal:** Tie all AI components together into a single conversation engine.

**Reference Docs:**
- `V2-CONCEPT-01-OVERVIEW.md` - System flow
- `V2-CONCEPT-04-CONVERSATION-FLOW.md` - Conversation logic

**Tasks:**

1. Create `lib/expert-system/engine.ts`:

   a) **Main Process Function**:
   ```
   processUserInput(
     input: string,
     imageUrl: string | null,
     currentState: KnowledgeState
   ): Promise<{
     newState: KnowledgeState
     response: AIResponse
   }>
   ```
   
   b) **Processing Pipeline**:
   1. Parse text input → extract facts
   2. If image provided → analyze image → extract facts
   3. Detect/confirm project type
   4. Update knowledge state with all extracted facts
   5. Recalculate gaps
   6. Check if ready for solution
   7. Generate response (with question or solution-ready flag)
   8. Return new state and response
   
   c) **Answer Processing**:
   ```
   processQuestionAnswer(
     questionId: string,
     answerId: string,
     currentState: KnowledgeState
   ): {
     newState: KnowledgeState
     response: AIResponse
   }
   ```
   - Map answer to confirmed fact
   - Update state
   - Generate follow-up
   
   d) **Error Handling:**
   - Graceful degradation if image analysis fails
   - Handle empty/uninformative inputs
   - Recovery from inconsistent state

**Deliverable:** Complete AI engine orchestrator.

**Verification:** End-to-end conversation flows work.

---

# PHASE 4: Solution Generation
**Estimated Effort:** 2-3 sessions
**Dependencies:** Phase 3 complete

---

## Phase 4.1: Solution Generator Core

**Goal:** Generate repair/project plans based on knowledge state.

**Reference Docs:**
- `V2-CONCEPT-05-SOLUTION-GENERATION.md` - Solution logic
- `V2-CONCEPT-10-EXPANDED-SCENARIOS.md` - Project-specific solutions

**Tasks:**

1. Create `lib/expert-system/solution-generator.ts`:

   a) **Main Generation Function**:
   ```
   generateSolution(state: KnowledgeState, products: ExpertProduct[]): Solution
   ```
   
   b) **Solution Structure**:
   ```
   Solution {
     id: string
     title: string  // e.g., "Fix Scratch on Metal Surface"
     projectType: ProjectType
     difficulty: 'beginner' | 'intermediate' | 'advanced'
     estimatedTime: string  // e.g., "2-3 hours"
     steps: SolutionStep[]
     totalPrice: number
     totalProducts: number
     assumptions: string[]  // What was assumed/defaulted
   }
   ```
   
   c) **Step Templates Per Project Type** (from V2-10):
   
   **Damage Repair:**
   1. Clean & Prep
   2. Sand (if needed based on depth)
   3. Rust Treatment (if rust present)
   4. Prime (if past clear coat)
   5. Base Coat
   6. Clear Coat
   7. Polish & Finish
   
   **New Parts Painting:**
   1. Clean Part
   2. Adhesion Promoter (if plastic)
   3. Prime
   4. Base Coat (multiple passes)
   5. Clear Coat
   6. Cure & Polish
   
   **Protection:**
   1. Deep Clean
   2. Decontaminate (clay bar)
   3. Polish (if needed)
   4. Apply Protection Product
   5. Cure/Buff
   
   etc.
   
   d) **Step Customization Logic**:
   - Add/remove steps based on confirmed facts
   - Adjust step descriptions based on specifics
   - Add conditional tips
   
   e) **Difficulty Calculation** (from V2-10):
   ```
   calculateDifficulty(state: KnowledgeState): Difficulty
   ```
   - Based on damage depth, size, project type
   - Equipment requirements
   - Color type complexity

**Deliverable:** Core solution generation logic.

**Verification:** Generates correct steps for each project type.

---

## Phase 4.2: Product Matcher

**Goal:** Match products to solution steps using Shopify products.

**Reference Docs:**
- `V2-CONCEPT-13-EXPANDED-PRODUCT-CATALOG.md` - Product matching logic
- `V2-CONCEPT-05-SOLUTION-GENERATION.md` - Product selection

**Tasks:**

1. Create `lib/expert-system/product-matcher.ts`:

   a) **Main Matching Function**:
   ```
   matchProductsToStep(
     step: SolutionStep,
     state: KnowledgeState,
     availableProducts: ExpertProduct[]
   ): SolutionProduct[]
   ```
   
   b) **Matching Criteria** (from V2-13 tags):
   - Match by category (step needs primer → find primers)
   - Filter by material compatibility (plastic primer for plastic)
   - Filter by project type tags
   - Filter by condition tags
   - Filter by skill level if applicable
   
   c) **Essential vs Optional:**
   ```
   determineEssentiality(product, step, state): boolean
   ```
   - Core products for step = essential
   - Upgrades/alternatives = optional
   - Tools they might already have = optional
   
   d) **Quantity Calculation:**
   ```
   calculateQuantity(product, state): number
   ```
   - Based on size of job
   - Based on number of coats needed
   - Based on coverage per can/unit
   
   e) **Reason Generation:**
   ```
   generateReason(product, step, state): string
   ```
   - "Plastic primer for your bumper material"
   - "Metallic base coat matching your paint type"
   
   f) **Fallback Handling:**
   - If no exact match, find closest alternative
   - If no product available, mark step with "product needed" flag
   - Suggest generic search terms

**Deliverable:** Product matching module.

**Verification:** Correctly matches products to steps for various scenarios.

---

## Phase 4.3: Price & Summary Calculator

**Goal:** Calculate totals and generate solution summaries.

**Tasks:**

1. Add to `lib/expert-system/solution-generator.ts`:

   a) **Price Calculation:**
   ```
   calculateTotalPrice(steps: SolutionStep[]): number
   ```
   - Sum all product prices × quantities
   - Only count essential products for "minimum" price
   - Calculate "full kit" price with optionals
   
   b) **Time Estimation:**
   ```
   estimateTime(steps: SolutionStep[], state: KnowledgeState): string
   ```
   - Base time per step type
   - Adjust for size (larger = more time)
   - Account for drying/curing times
   - Present as range: "2-3 hours"
   
   c) **Summary Generation:**
   ```
   generateSummary(solution: Solution): string
   ```
   - Human-readable summary of the plan
   - Highlight key products and steps
   - Note any assumptions made

**Deliverable:** Complete solution with pricing and summaries.

**Verification:** Prices calculate correctly, times are reasonable.

---

# PHASE 5: State Management & Store
**Estimated Effort:** 1-2 sessions
**Dependencies:** Phases 1-4 complete

---

## Phase 5.1: Expert System Store

**Goal:** Create Zustand store for expert system state management.

**Reference Docs:**
- `V2-CONCEPT-09-DATA-MODEL.md` - Data persistence model

**Tasks:**

1. Create `lib/expert-system/store.ts`:

   a) **Store Interface:**
   ```
   ExpertSystemStore {
     // Session
     sessionId: string
     
     // Conversation
     messages: Message[]
     knowledgeState: KnowledgeState
     currentQuestion: Question | null
     
     // Solution
     solution: Solution | null
     
     // Status
     status: 'idle' | 'gathering' | 'analyzing' | 'generating' | 'complete'
     isTyping: boolean
     
     // Actions
     initSession(): void
     addUserMessage(content: string, imageUrl?: string): void
     addAssistantMessage(response: AIResponse): void
     updateKnowledgeState(state: KnowledgeState): void
     setCurrentQuestion(question: Question | null): void
     answerQuestion(questionId: string, answerId: string): void
     setSolution(solution: Solution): void
     resetConversation(): void
     setStatus(status): void
     setIsTyping(isTyping: boolean): void
   }
   ```
   
   b) **Persistence:**
   - Persist sessionId, knowledgeState, messages
   - Use zustand persist middleware
   - Local storage key: 'pavlicevits-expert-session'
   
   c) **Integration Points:**
   - Connect to AI engine for processing
   - Connect to solution generator
   - Trigger state transitions automatically

**Deliverable:** Complete state management store.

**Verification:** State persists across page refreshes.

---

# PHASE 6: UI Components
**Estimated Effort:** 3-4 sessions
**Dependencies:** Phase 5 complete

---

## Phase 6.1: Chat Interface Components

**Goal:** Build the conversational interface components.

**Reference Docs:**
- `V2-CONCEPT-06-UI-COMPONENTS.md` - Component specifications
- `V2-CONCEPT-07-MOBILE-UI-WIREFRAMES.md` - Layout guidance

**IMPORTANT:** Use brownleaf's existing design system and component library. These specs describe functionality, not styling.

**Tasks:**

1. Create `components/expert-system/chat-input.tsx`:
   - Text input field (multiline capable)
   - Image upload button + preview
   - Send button
   - Quick suggestion chips (when empty)
   - Voice input button (placeholder/future)
   
2. Create `components/expert-system/message-bubble.tsx`:
   - User message styling (right-aligned)
   - Assistant message styling (left-aligned)
   - Image display within messages
   - Timestamp display (optional)
   
3. Create `components/expert-system/typing-indicator.tsx`:
   - Animated dots showing AI is "thinking"
   - Avatar/icon for AI
   
4. Create `components/expert-system/understanding-card.tsx`:
   - Display confirmed facts (✓ checkmark)
   - Display inferred facts (with confidence indicator)
   - "Something wrong?" correction link
   - Collapsible/expandable

**Deliverable:** Core chat UI components.

**Verification:** Components render correctly with mock data.

---

## Phase 6.2: Question Components

**Goal:** Build question display and answer capture components.

**Reference Docs:**
- `V2-CONCEPT-06-UI-COMPONENTS.md` - Question card specs

**Tasks:**

1. Create `components/expert-system/question-card.tsx`:
   - Question text display
   - Help text toggle ("Not sure?")
   - Adapts to question type:
     - Single select: radio-style options
     - Multi select: checkbox-style options
     - Text input: textarea
   
2. Create `components/expert-system/question-option.tsx`:
   - Icon display (emoji or lucide icon)
   - Option label
   - Option description (smaller text)
   - Selected state styling
   - Hover/tap state
   
3. **Option Layout:**
   - 2-column grid on mobile for simple options
   - Full-width for options with descriptions
   - Animated selection feedback

**Deliverable:** Question display components.

**Verification:** All question types render and capture answers.

---

## Phase 6.3: Solution Display Components

**Goal:** Build solution presentation components.

**Reference Docs:**
- `V2-CONCEPT-06-UI-COMPONENTS.md` - Solution display specs

**Tasks:**

1. Create `components/expert-system/solution-header.tsx`:
   - Solution title
   - Difficulty badge
   - Time estimate badge
   - Total price display
   - "Add All to Cart" button
   
2. Create `components/expert-system/solution-step.tsx`:
   - Step number/indicator
   - Step title
   - Step description
   - Tips/notes section
   - Products for this step (collapsible)
   - "Add Step Products to Cart" button
   
3. Create `components/expert-system/solution-product.tsx`:
   - Product image thumbnail
   - Product name (links to product page)
   - Price
   - Quantity needed
   - Essential vs Optional indicator
   - Reason why recommended
   - Individual "Add to Cart" button
   
4. Create `components/expert-system/solution-summary.tsx`:
   - Assumptions made (if any)
   - Confidence level indicator
   - "Start Over" option
   - "Save for Later" option (future)

**Deliverable:** Complete solution display components.

**Verification:** Solution renders with all details, cart integration works.

---

## Phase 6.4: Expert Page Assembly

**Goal:** Create the main expert consultation page.

**Tasks:**

1. Create `app/expert/page.tsx`:
   - Server component shell
   - Metadata for SEO
   - Load necessary products (for solution generation)
   
2. Create `components/expert-system/expert-page.tsx`:
   - Main client component
   - Conversation view (scrollable message list)
   - Fixed input area at bottom
   - Solution overlay/view when complete
   - Status indicators (gathering/analyzing/etc.)
   
3. **Layout Considerations:**
   - Full-height on mobile
   - Safe area handling (notch, home indicator)
   - Keyboard handling (input pushes up)
   - Scroll to bottom on new messages
   
4. **State Integration:**
   - Connect to expert system store
   - Handle all user interactions
   - Trigger AI processing on input
   - Display solutions when ready

**Deliverable:** Complete expert consultation page.

**Verification:** Full conversation flow works end-to-end.

---

# PHASE 7: Integration & Polish
**Estimated Effort:** 2-3 sessions
**Dependencies:** Phase 6 complete

---

## Phase 7.1: Cart Integration

**Goal:** Connect expert system with brownleaf's cart.

**Tasks:**

1. **Identify Existing Cart System:**
   - Locate brownleaf's cart state/hooks
   - Understand add-to-cart API/function signature
   
2. **Create Bridge Functions:**
   ```
   addExpertProductToCart(product: SolutionProduct): void
   addAllSolutionProductsToCart(solution: Solution): void
   addStepProductsToCart(step: SolutionStep): void
   ```
   
3. **Cart Attribution:**
   - Track that items came from expert recommendation
   - Pass metadata (for analytics):
     - `source: 'expert-system'`
     - `projectType: string`
     - `stepNumber: number`

**Deliverable:** Seamless cart integration.

**Verification:** Adding products from solution updates cart correctly.

---

## Phase 7.2: Navigation Integration

**Goal:** Integrate expert system into brownleaf's navigation.

**Tasks:**

1. **Add Navigation Entry:**
   - Add "Expert Guide" or "AI Assistant" to main nav
   - Add appropriate icon
   - Highlight as featured/new feature
   
2. **Entry Points:**
   - Homepage CTA to expert system
   - Product pages: "Need help choosing?" link
   - Category pages: "Let our expert guide you" banner
   - Search results: "Can't find what you need?" prompt
   
3. **Active Session Indicator:**
   - If expert session in progress, show floating indicator
   - Allow easy return to consultation
   - Badge showing "solution ready" if applicable

**Deliverable:** Expert system accessible from multiple touchpoints.

**Verification:** All entry points work, session continuity maintained.

---

## Phase 7.3: Error Handling & Edge Cases

**Goal:** Handle all error conditions gracefully.

**Tasks:**

1. **Image Analysis Failures:**
   - Show friendly error message
   - Continue with text-only flow
   - Log error for debugging
   
2. **Product Matching Failures:**
   - When no products match requirements
   - Show step without products, suggest search
   - Contact/help option
   
3. **Empty States:**
   - No conversation yet: welcoming prompt
   - Session expired: offer to start fresh
   - No products available: helpful message
   
4. **Network Errors:**
   - Retry logic for API calls
   - Offline indicator
   - Queue messages for retry
   
5. **Invalid Inputs:**
   - Uninformative text: ask for more details
   - Unrelated images: politely redirect
   - Spam detection: rate limiting

**Deliverable:** Robust error handling throughout.

**Verification:** All error scenarios handled gracefully.

---

## Phase 7.4: Analytics & Tracking

**Goal:** Implement analytics for expert system usage.

**Tasks:**

1. **Events to Track:**
   - Session started
   - Message sent (text/image)
   - Question answered
   - Solution generated
   - Product added to cart (with source)
   - Session completed/abandoned
   
2. **Metrics to Capture:**
   - Conversion rate (session → cart add)
   - Average messages per session
   - Most common project types
   - Most recommended products
   - Drop-off points
   
3. **Integration:**
   - Use brownleaf's existing analytics
   - Add custom events for expert system

**Deliverable:** Comprehensive analytics tracking.

**Verification:** Events fire correctly in analytics dashboard.

---

# PHASE 8: Testing & Launch
**Estimated Effort:** 1-2 sessions
**Dependencies:** All previous phases complete

---

## Phase 8.1: Scenario Testing

**Goal:** Test all project type scenarios end-to-end.

**Reference Docs:**
- `V2-CONCEPT-12-EXPANDED-CONVERSATION-FLOWS.md` - Test cases

**Test Scenarios:**

1. **Damage Repair:**
   - Light scratch on car door (text only)
   - Deep chip with rust (text + image)
   - Dent on plastic bumper
   
2. **New Parts Painting:**
   - Unpainted replacement bumper
   - Pre-primed fender
   
3. **Restoration:**
   - Faded hood paint
   - Classic car respray inquiry
   
4. **Protection:**
   - Ceramic coating application
   - Wax for new car
   
5. **Custom:**
   - Color change inquiry
   - Metallic effect desired

**Deliverable:** All scenarios tested and passing.

---

## Phase 8.2: Performance Optimization

**Goal:** Ensure fast, responsive experience.

**Tasks:**

1. **Lazy Loading:**
   - Load expert system components on demand
   - Don't impact main site performance
   
2. **Product Caching:**
   - Cache product list for solution generation
   - Refresh periodically
   
3. **Response Times:**
   - AI processing should show typing indicator
   - Image analysis shouldn't block UI
   - Solutions should generate in <2s

**Deliverable:** Smooth, responsive experience.

---

## Phase 8.3: Final Review & Launch

**Goal:** Final checks before release.

**Tasks:**

1. **Code Review:**
   - Review all new code
   - Check for security issues
   - Verify no brownleaf regressions
   
2. **Accessibility:**
   - Keyboard navigation
   - Screen reader support
   - Color contrast
   
3. **Mobile Testing:**
   - iOS Safari
   - Android Chrome
   - Various screen sizes
   
4. **Documentation:**
   - Update any user-facing help content
   - Internal documentation for maintenance

**Deliverable:** Production-ready expert system.

---

# Appendix A: File Structure

```
lib/expert-system/
├── types.ts                 # All type definitions
├── shopify-adapter.ts       # Shopify → Expert product mapping
├── product-service.ts       # Product fetching & caching
├── knowledge-state.ts       # Knowledge state management
├── project-detector.ts      # Project type detection
├── text-parser.ts           # Natural language parsing
├── image-analyzer.ts        # Image analysis integration
├── question-generator.ts    # Dynamic question generation
├── response-generator.ts    # AI response generation
├── engine.ts                # Main orchestrator
├── solution-generator.ts    # Solution creation
├── product-matcher.ts       # Product → Step matching
└── store.ts                 # Zustand store

components/expert-system/
├── chat-input.tsx
├── message-bubble.tsx
├── typing-indicator.tsx
├── understanding-card.tsx
├── question-card.tsx
├── question-option.tsx
├── solution-header.tsx
├── solution-step.tsx
├── solution-product.tsx
├── solution-summary.tsx
└── expert-page.tsx

app/expert/
└── page.tsx
```

---

# Appendix B: Shopify Tag Convention

For the expert system to work optimally, Shopify products should be tagged following this convention:

```
expert:<dimension>:<value>
```

**Examples:**
- `expert:material:plastic`
- `expert:material:metal`
- `expert:projectType:damage-repair`
- `expert:projectType:protection`
- `expert:condition:rust`
- `expert:effect:metallic`
- `expert:skillLevel:beginner`
- `expert:category:primer`
- `expert:category:clear-coat`

These tags enable intelligent product matching in solution generation.

---

# Appendix C: Quick Reference - Doc to Phase Mapping

| Phase | Primary Docs |
|-------|-------------|
| 1.1 Types | V2-03, V2-11, V2-09 |
| 1.2 Adapter | V2-13, V2-07 |
| 2.1 Knowledge State | V2-02, V2-11 |
| 2.2 Project Detection | V2-10, V2-11 |
| 3.1 Text Parser | V2-03, V2-04 |
| 3.2 Image Analysis | V2-08 |
| 3.3 Questions | V2-04, V2-12 |
| 3.4 Responses | V2-04, V2-12 |
| 4.1 Solution Gen | V2-05, V2-10 |
| 4.2 Product Match | V2-13, V2-05 |
| 6.x UI Components | V2-06 |
| 8.1 Testing | V2-12 |

---

**END OF BLUEPRINT**
