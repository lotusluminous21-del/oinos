# Final Design Specification: PAVLICEVITS Fluid Expert Experience

## Executive Summary

This document consolidates all analysis into a final, robust design specification for a mobile-first e-commerce experience that intelligently blends traditional product browsing with AI-powered expert consultation.

### Core Innovation
The AI is not a separate "chat" feature. It's a **contextual intelligence layer** that:
1. Routes users to the right experience based on intent
2. Guides them through complex decisions with conversational discovery
3. Generates custom solutions based on their specific situation
4. Enhances traditional browsing with contextual expertise

---

## 1. System Architecture Overview

```
                    USER QUERY
                        │
                        ▼
               ┌───────────────┐
               │ INTENT ENGINE │
               └───────┬───────┘
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
   PROJECT          PRODUCT          BROWSE
   INTENT           INTENT           INTENT
       │               │                │
       ▼               ▼                ▼
  Consultation      Product          Category
     Flow           Results           Grid
       │               │                │
       ▼               ▼                ▼
    Custom          Product          Product
   Solution          Detail           Detail
       │               │                │
       └───────────────┴────────────────┘
                       │
                       ▼
                   CART → CHECKOUT
```

---

## 2. Intent Classification System

### 2.1 Query Categories

| Intent | Signals | Response |
|--------|---------|----------|
| **PROJECT** | "how to", "fix", "repair", damage words, uncertainty | Consultation flow |
| **PRODUCT** | Category names, brand names, specific terms | Product results |
| **TECHNICAL** | "VOC", "specs", "datasheet", compatibility | Product detail/docs |
| **BROWSE** | "show me", "all primers", category exploration | Category grid |
| **VAGUE** | "my car looks bad", unclear intent | Clarification prompt |

### 2.2 Classification Logic

```typescript
interface ClassificationResult {
  intent: 'project' | 'product' | 'technical' | 'browse' | 'vague';
  confidence: number; // 0-1
  extractedContext: {
    color?: string;
    material?: string;
    damageType?: string;
    product?: string;
    brand?: string;
  };
  suggestedAction: {
    type: 'consultation' | 'search' | 'clarify' | 'browse';
    params: any;
  };
}
```

### 2.3 Examples

| Query | Intent | Confidence | Action |
|-------|--------|------------|--------|
| "I scratched my silver car" | PROJECT | 0.9 | Start consultation |
| "2K clear coat" | PRODUCT | 0.95 | Show products |
| "Motip primers" | PRODUCT | 0.9 | Show brand products |
| "my car looks bad" | VAGUE | 0.3 | Ask clarification |
| "how much is shipping" | N/A | N/A | Support/FAQ |
| "show me all sandpaper" | BROWSE | 0.85 | Category view |

---

## 3. Consultation Flow Design

### 3.1 Core Questions (Required)

These must be answered for a valid solution:

#### Question 1: Damage Assessment
```
What's the situation with your [surface]?

[ ] Surface marks only
    Light scratches you can barely feel
    
[ ] Paint damage (different color showing)
    Scratched through the top coat
    
[ ] Down to bare material
    Can see metal, plastic, or primer
    
[ ] Rust or corrosion present
    Orange/brown discoloration

[Not sure? Here's how to check ↓]
```

#### Question 2: Surface Material
```
What material is the damaged surface?

[ ] Metal (car body, steel, aluminum)
[ ] Plastic (bumper, trim, interior)
[ ] Wood
[ ] Other / Not sure

[Why this matters ↓]
```

#### Question 3: Color Type (if paint needed)
```
What type of color is your [surface]?

[ ] Solid color (flat, no sparkle)
[ ] Metallic (silver sparkle)
[ ] Pearl/Mica (color-shift effect)
[ ] Not sure / Need help identifying

[Visual guide ↓]
```

### 3.2 Adaptive Questions (Conditional)

Asked based on previous answers:

| If... | Then Ask... |
|-------|-------------|
| Material = Metal | "Any rust visible?" |
| Damage = Large area | "What equipment do you have?" |
| Color = Pearl | "Do you have the color code?" |
| First-time user | "What's your experience level?" |

### 3.3 Quick Defaults

For users who want to skip questions:

```
[Just Give Me General Guidance]

Using safe defaults:
• Assuming medium-depth damage
• Assuming standard automotive paint
• Using beginner-friendly products

Your solution will be more general but still helpful.
You can always refine it later.

[Continue with defaults] [Answer questions instead]
```

---

## 4. Solution Generation

### 4.1 Solution Data Structure

```typescript
interface CustomSolution {
  id: string;
  title: string; // "Silver Metallic Spot Repair"
  summary: {
    estimatedTime: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    priceRange: { min: number; max: number };
  };
  userInputs: UserAnswer[]; // All answers, editable
  steps: SolutionStep[];
  shoppingList: ShoppingListItem[];
  assumptions: string[]; // What AI assumed if user skipped
  warnings: string[]; // Safety/limitation notes
}

interface SolutionStep {
  order: number;
  title: string;
  description: string;
  proTips: string[];
  warnings: string[];
  duration: string;
  products: ProductRecommendation[];
}

interface ProductRecommendation {
  product: Product;
  reason: string; // "Matches your metallic silver color"
  isEssential: boolean;
  alternatives: Product[];
  quantity: number;
}
```

### 4.2 Solution Generation Rules

1. **Match products to user context**
   - Color type → Appropriate paint system
   - Material → Correct primer type
   - Equipment → Aerosol vs spray gun products
   
2. **Verify compatibility**
   - All products in solution must work together
   - Same brand line preferred
   - Flag any compatibility notes

3. **Check stock**
   - Only recommend in-stock items
   - Have alternatives ready
   - Show ETA for out-of-stock essentials

4. **Tier appropriately**
   - Default to mid-tier
   - Show budget options if requested
   - Upsell premium only as optional upgrade

---

## 5. Mobile UI Components

### 5.1 Consultation Card

```
┌────────────────────────────────────┐
│  🧑‍🔧 Expert Question            │
├────────────────────────────────────┤
│                                    │
│  [Question text here]              │
│                                    │
│  ┌────────────────────────────────┐ │
│  │ ○ Option A with icon & desc  │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ ○ Option B with icon & desc  │ │
│  └────────────────────────────────┘ │
│                                    │
│  [Not sure? ↓]  [Skip this]        │
│                                    │
└────────────────────────────────────┘
```

### 5.2 Context Summary Bar

```
┌────────────────────────────────────┐
│ Your situation:                    │
│                                    │
│ [Metal✓] [Deep scratch✓] [No rust] │
│ [Silver metallic] [_____]          │
│                           [Edit]   │
└────────────────────────────────────┘
```

### 5.3 Solution Header Card

```
┌────────────────────────────────────┐
│  YOUR CUSTOM REPAIR PLAN           │
│                                    │
│  Silver Metallic Spot Repair       │
│                                    │
│  ⏱ 2-3 hours  ⭐ Intermediate       │
│  💰 €65-85 estimated               │
│                                    │
│  Based on your answers:            │
│  • Metal door, through to primer    │
│  • Silver metallic paint            │
│  • Medium area (~10cm)              │
│  • Using aerosol cans               │
│                                    │
│  [✏️ Edit my details]               │
└────────────────────────────────────┘
```

### 5.4 Step Accordion

```
┌────────────────────────────────────┐
│ STEP 1: Preparation           [▼]  │
├────────────────────────────────────┤
│                                    │
│ Clean the damaged area with        │
│ wax and grease remover to ensure   │
│ proper adhesion.                   │
│                                    │
│ 💡 Pro tip: Clean a larger area    │
│ than the damage - about 6" beyond  │
│ in all directions.                 │
│                                    │
│ Products for this step:            │
│                                    │
│ ┌────────────┐┌────────────┐        │
│ │  [image]   ││  [image]   │        │
│ │ Degreaser  ││ Tack Cloth │        │
│ │ €8.50 [+]  ││ €3.20 [+]  │        │
│ └────────────┘└────────────┘        │
│                                    │
│ [Add all step products to cart]   │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ STEP 2: Sanding                [▶]  │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ STEP 3: Primer                 [▶]  │
└────────────────────────────────────┘
```

### 5.5 Floating Active Consultation Indicator

```
┌─────────────────────┐
│ 🛠️ Your repair plan  │
│    [View] [×]       │
└─────────────────────┘
```

---

## 6. State Management

### 6.1 Consultation State

```typescript
interface ConsultationState {
  id: string;
  status: 'in_progress' | 'complete' | 'abandoned';
  originalQuery: string;
  currentStep: number;
  totalSteps: number;
  answers: {
    [questionId: string]: {
      value: any;
      answeredAt: Date;
      skipped: boolean;
    };
  };
  extractedContext: ExtractedContext;
  generatedSolution: CustomSolution | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 6.2 Persistence Strategy

- **Active consultation**: localStorage (survives refresh)
- **Completed solutions**: Server-side (if logged in) or localStorage
- **Cart integration**: Solutions link to cart items with metadata

---

## 7. Product Recommendation Engine

### 7.1 Decision Matrix

```
INPUTS:
- Damage depth
- Surface material 
- Color type
- Rust presence
- Equipment type
- Size of area
- User skill level
- Budget preference

OUTPUTS:
- Required products per step
- Quantities needed
- Alternative options
- Optional upgrades
```

### 7.2 Example Decision Tree

```
IF damage_depth = 'surface_marks' THEN
  solution = polishing_kit_only
  
ELSE IF damage_depth = 'through_clear' THEN
  IF rust_present THEN
    ADD rust_treatment_step
  END
  
  IF material = 'metal' THEN
    primer = metal_primer
  ELSE IF material = 'plastic' THEN
    ADD plastic_adhesion_promoter
    primer = plastic_primer
  END
  
  IF color_type = 'metallic' THEN
    paint_system = base_coat + clear_coat
  ELSE IF color_type = 'solid' THEN
    paint_system = single_stage OR base_coat + clear_coat
  ELSE IF color_type = 'pearl' THEN
    paint_system = base_coat + pearl_midcoat + clear_coat
  END
  
  IF equipment = 'aerosol' THEN
    product_format = spray_cans
  ELSE
    product_format = quart_size
    ADD spray_gun_if_needed
  END
  
END
```

---

## 8. Integration Points

### 8.1 With Traditional Browsing

- Product pages show "This product is in your repair plan" badge
- Category pages show "For your repair: X relevant products"
- Search results highlight relevant items
- Cart shows "Complete your repair" suggestions

### 8.2 With Cart

- Items added from consultation have "Part of repair plan" tag
- If user removes essential item, show warning
- "Add remaining items" button in cart
- Cart total vs solution estimate comparison

### 8.3 With Account

- Logged-in users: Save consultations to account
- View past repairs
- Re-order products for past repairs
- Share repair plans

---

## 9. Safety and Limitations

### 9.1 Hard Rules

1. **Never recommend dangerous practices**
   - Indoor 2K spraying without ventilation → Refuse
   - Mixing incompatible products → Refuse
   
2. **Recognize DIY limits**
   - Structural rust → Recommend professional
   - Complex tri-coat blending → Warn about difficulty
   - Deep dents → Recommend body work first

3. **Stock awareness**
   - Never recommend out-of-stock essentials
   - Always have alternatives ready
   - Show restocking dates where available

### 9.2 Disclaimers

```
"This guidance is for informational purposes. Results depend
on proper technique and conditions. For best results with 
complex repairs, consider professional assistance."
```

---

## 10. Success Metrics

### 10.1 User Experience
- Consultation completion rate (target: >70%)
- Average questions answered (target: 4-5)
- Time to solution (target: <90 seconds)
- Solution edit rate (lower = better defaults)

### 10.2 Business
- Cart value from consultations vs direct browse
- Return rate for consultation-guided purchases
- Repeat usage of expert feature
- Customer satisfaction scores

---

## 11. Implementation Priority

### Phase 1: Core Experience
1. Intent classification system
2. Consultation flow with core questions
3. Solution generation (rule-based)
4. Basic solution view
5. Cart integration

### Phase 2: Refinement
1. Adaptive question flow
2. Rich visual guides for questions  
3. Edit/refine answers
4. Alternatives and upgrades
5. Save/share solutions

### Phase 3: Intelligence
1. ML-enhanced classification
2. Usage pattern learning
3. Personalized defaults
4. Photo-based damage assessment

---

## APPROVAL CHECKPOINT

This specification represents our consolidated design thinking. Before implementation:

1. ✅ Problem space thoroughly analyzed
2. ✅ User journeys mapped
3. ✅ UX flow designed for mobile-first
4. ✅ Red-team analysis completed
5. ✅ Edge cases documented
6. ✅ Technical architecture defined
7. ✅ Safety considerations addressed

**Ready for implementation review.**
