# Consultation UX Design: Mobile-First Expert Flow

## 1. The Core UX Challenge

### The Tension:
- **Expert consultation** requires gathering information (questions)
- **Mobile users** hate forms and long flows
- **E-commerce users** expect quick access to products

### The Solution Direction:
Make the consultation feel like a **conversation with a helpful friend**, not a form or a quiz.

---

## 2. Consultation Flow Architecture

### 2.1 Entry Points

Users can enter the AI consultation through:

1. **Search bar query** (primary)
   - "I scratched my car door"
   - "How do I fix rust on my car?"
   - "Need to repaint my bumper"

2. **"Get Expert Help" CTA** (secondary)
   - Prominent button on home page
   - Available in category pages

3. **Product page "Not sure?"** (contextual)
   - "Not sure if this is right for you? Get expert guidance"

### 2.2 Query Analysis Phase

When user submits a query:

```
[User Input]
     ↓
[AI Analysis]
├── Intent: Project/Product/Question/Browse
├── Extracted info: color mentioned? material? damage type?
├── Missing info: What do we need to ask?
└── Confidence: How sure are we?
```

**Example Analysis:**

Query: "I scratched my silver car"
- Intent: Project (repair)
- Extracted: Color = silver (likely metallic)
- Missing: Depth, size, surface material, rust, equipment
- Confidence: 40% (need more info)

Query: "I need 2K clear coat for my motorcycle"
- Intent: Product (specific)
- Extracted: Product type = 2K clear coat, Application = motorcycle
- Missing: Size needed, brand preference
- Confidence: 80% (can show products with light guidance)

---

## 3. The Consultation Interface: "Expert Chat Cards"

### Design Concept:
Instead of a linear form or chat bubbles, use **interactive cards** that feel conversational but are optimized for mobile tapping.

### Visual Metaphor:
Think of it as the expert laying cards on the table, each card helping narrow down the solution.

### Card Anatomy:

```
┌──────────────────────────────────────┐
│  💡 Expert Question              │
├──────────────────────────────────────┤
│                                      │
│  How deep is the scratch?            │
│                                      │
│  [Visual diagram showing depths]     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ○ Surface marks only        │  │
│  │   (clear coat damage)       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ○ Different color showing   │  │
│  │   (through to base coat)    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ○ Bare metal visible        │  │
│  │   (down to metal)          │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────┐                       │
│  │ Not sure? │  <- Help button        │
│  └────────────┘                       │
└──────────────────────────────────────┘
```

### "Not Sure?" Expansion:
When user taps "Not sure?", the card expands with helpful guidance:

```
┌──────────────────────────────────────┐
│  🔍 How to check:                    │
│                                      │
│  Run your fingernail across the      │
│  scratch:                            │
│                                      │
│  • Smooth = surface marks only       │
│  • Catches slightly = through clear  │
│  • Deep groove = down to metal       │
│                                      │
│  [Photo examples of each level]     │
│                                      │
└──────────────────────────────────────┘
```

---

## 4. Question Sequencing Strategy

### Principle: "Minimum Viable Questions"

Not all questions are equal. We should:
1. Ask **critical questions** first (can't proceed without them)
2. Make **important questions** easy to answer
3. Allow **nice-to-know** questions to be skipped
4. Use **smart defaults** where possible

### Question Priority Matrix:

| Question | Priority | Why | Default if skipped |
|----------|----------|-----|--------------------|
| Damage depth | Critical | Changes entire approach | Cannot skip |
| Surface material | Critical | Different products needed | Cannot skip |
| Rust presence | Critical | Adds treatment phase | Assume no |
| Color type | High | Affects paint system | Assume metallic |
| Damage size | High | Affects application method | Assume medium |
| Equipment | Medium | Affects product format | Assume aerosol |
| Budget | Medium | Filters products | Show all tiers |
| Color code | Low | Enables exact match | Offer lookup |
| Experience | Low | Adjusts guidance detail | Assume beginner |

### Adaptive Flow:

The system should adapt based on answers:

```
IF depth = "surface marks only"
   SKIP to polishing solution (simple)
   DON'T ASK about primer, color, etc.
   
IF depth = "down to metal"
   ASK about rust (likely relevant)
   ASK about surface material (critical)
   ASK about color (needed for paint)
   
IF size = "tiny < 1cm"
   RECOMMEND touch-up pen (simple solution)
   SKIP equipment questions
   
IF user answers quickly
   MAINTAIN pace, don't over-explain
   
IF user uses "Not sure" multiple times
   OFFER to show general guidance instead
```

---

## 5. Mobile Screen Flow

### Screen 1: Initial Response

After user types "I scratched my car door":

```
┌─────────────────────────┐
│ ←    Expert Guidance     │
├─────────────────────────┤
│                         │
│  ╔═════════════════════╗  │
│  ║ 👤 You asked:        ║  │
│  ║                     ║  │
│  ║ "I scratched my     ║  │
│  ║  car door"          ║  │
│  ╚═════════════════════╝  │
│                         │
│  ╔═════════════════════╗  │
│  ║ 🧑‍🔧 Expert:         ║  │
│  ║                     ║  │
│  ║ I can help you fix  ║  │
│  ║ that! Let me ask a  ║  │
│  ║ few quick questions  ║  │
│  ║ to give you the     ║  │
│  ║ right solution.     ║  │
│  ║                     ║  │
│  ║ This usually takes  ║  │
│  ║ about 30 seconds.   ║  │
│  ╚═════════════════════╝  │
│                         │
│  ┌─────────────────────┐  │
│  │   Let's Start ➡     │  │
│  └─────────────────────┘  │
│                         │
│  ┌─────────────────────┐  │
│  │ Skip to general     │  │
│  │ guidance instead    │  │
│  └─────────────────────┘  │
│                         │
└─────────────────────────┘
```

### Screen 2: First Question (Critical)

```
┌─────────────────────────┐
│ ←    Expert Guidance     │
├─────────────────────────┤
│                         │
│  Progress: ●○○○○ (1/5)  │
│                         │
│  ╔═════════════════════╗  │
│  ║ How deep is the     ║  │
│  ║ scratch?            ║  │
│  ║                     ║  │
│  ║ [Visual diagram]    ║  │
│  ╚═════════════════════╝  │
│                         │
│  ┌─────────────────────┐  │
│  │ 🔵 Surface marks    │  │
│  │   Light scratches   │  │
│  │   you can barely    │  │
│  │   feel              │  │
│  └─────────────────────┘  │
│                         │
│  ┌─────────────────────┐  │
│  │ 🟡 Through clear    │  │
│  │   Different color   │  │
│  │   visible beneath   │  │
│  └─────────────────────┘  │
│                         │
│  ┌─────────────────────┐  │
│  │ 🔴 Down to metal   │  │
│  │   Shiny metal or    │  │
│  │   rust visible      │  │
│  └─────────────────────┘  │
│                         │
│       [Not sure? ℹ️]      │
│                         │
└─────────────────────────┘
```

### Screen 3: Building Context

As user answers, show building context:

```
┌─────────────────────────┐
│ ←    Expert Guidance     │
├─────────────────────────┤
│                         │
│  Progress: ●●●○○ (3/5)  │
│                         │
│  ┌─────────────────────┐  │
│  │ Your situation:     │  │
│  │ • Through clear coat │  │
│  │ • Metal surface      │  │
│  │ • No rust           │  │  <- Editable
│  └─────────────────────┘  │
│                         │
│  ╔═════════════════════╗  │
│  ║ What color is your  ║  │
│  ║ car?                ║  │
│  ╚═════════════════════╝  │
│                         │
│  [🟤][⚪][⚫][🔵][🔴][🟢]  │ <- Color chips
│  [🟡][🟠][🟣][  ] Metallic  │
│                         │
│  [Type color code if    │
│   you know it: ____]    │
│                         │
│  [I'll look it up ➡]    │
│                         │
└─────────────────────────┘
```

### Screen 4: Solution Generation

Once enough info gathered:

```
┌─────────────────────────┐
│ ←    Expert Guidance     │
├─────────────────────────┤
│                         │
│  ╔═════════════════════╗  │
│  ║ ✨ Creating your      ║  │
│  ║ personalized        ║  │
│  ║ repair plan...      ║  │
│  ║                     ║  │
│  ║ [█████████▓░░░░]   ║  │
│  ║                     ║  │
│  ║ ✔ Analyzing damage   ║  │
│  ║ ✔ Selecting products ║  │
│  ║ ⟳ Building steps... ║  │
│  ╚═════════════════════╝  │
│                         │
│  Based on your answers: │
│  • Silver metallic      │
│  • Through clear coat   │
│  • Metal door, no rust  │
│  • Medium area (~10cm)  │
│  • Using aerosol cans   │
│                         │
└─────────────────────────┘
```

---

## 6. The Custom Solution View

This replaces the template-based project view:

```
┌─────────────────────────┐
│ ←    Your Repair Plan    │
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐  │
│  │ Silver Metallic      │  │
│  │ Spot Repair          │  │
│  │                      │  │
│  │ ⏱ 2-3 hours          │  │
│  │ ⭐ Intermediate       │  │
│  │ 💰 €65-85 est.        │  │
│  └─────────────────────┘  │
│                         │
│  [Edit my answers ✏️]    │
│                         │
│  ────────────────────  │
│                         │
│  ▼ Step 1: Preparation   │
│  ┌─────────────────────┐  │
│  │ Clean the damaged    │  │
│  │ area with degreaser  │  │
│  │ and wipe dry.        │  │
│  │                      │  │
│  │ 💡 Pro tip: Use a    │  │
│  │ tack cloth after to  │  │
│  │ remove any dust.     │  │
│  │                      │  │
│  │ Products:            │  │
│  │ ┌─────┐┌─────┐       │  │
│  │ │     ││     │       │  │
│  │ │ 🧴  ││ 🧹  │ ➡     │  │
│  │ └─────┘└─────┘       │  │
│  │ Degreaser Tack cloth │  │
│  │ €8.50     €4.20       │  │
│  └─────────────────────┘  │
│                         │
│  ▶ Step 2: Sanding       │
│  ▶ Step 3: Primer        │
│  ▶ Step 4: Base Coat     │
│  ▶ Step 5: Clear Coat    │
│  ▶ Step 6: Polish        │
│                         │
│  ────────────────────  │
│                         │
│  Complete Shopping List │
│  8 products • €72.40     │
│                         │
│  [🛒 Add All to Cart]   │
│                         │
└─────────────────────────┘
```

---

## 7. Handling "Edit My Answers"

When user taps "Edit my answers":

```
┌─────────────────────────┐
│ ←    Edit Details        │
├─────────────────────────┤
│                         │
│  Your current details:  │
│                         │
│  Damage Depth           │
│  [▼ Through clear coat]  │ <- Dropdown
│                         │
│  Surface Material       │
│  [▼ Metal]               │
│                         │
│  Rust Present           │
│  [▼ No]                  │
│                         │
│  Color Type             │
│  [▼ Silver Metallic]     │
│                         │
│  Damage Size            │
│  [▼ Medium (5-15cm)]     │
│                         │
│  Equipment              │
│  [▼ Aerosol cans]        │
│                         │
│  ────────────────────  │
│                         │
│  [🔄 Update My Plan]     │
│                         │
└─────────────────────────┘
```

Changing any value regenerates the solution with updated products.

---

## 8. Integration with Traditional Browsing

### While User Has Active Consultation:

1. **Floating indicator** shows consultation is active
2. **Browse freely** - user can navigate categories/products
3. **"Back to your plan"** always accessible
4. **Product pages** show relevance to current consultation:
   - "This product is in your repair plan"
   - "This is an alternative to [X] in your plan"
   - "This product isn't needed for your repair"

### Product Compatibility Display:

```
┌─────────────────────────┐
│  SprayMax 2K Clear Coat │
│                         │
│  ┌─────────────────────┐  │
│  │  ✅ IN YOUR PLAN     │  │
│  │  Step 5: Clear Coat │  │
│  └─────────────────────┘  │
│                         │
│  [Product details...]   │
│                         │
│  💡 Expert Tip:          │
│  This 2K clear coat is  │
│  perfect for your       │
│  metallic silver repair │
│  - it will match the    │
│  gloss of your existing │
│  paint.                 │
│                         │
└─────────────────────────┘
```

---

## 9. Red Team Analysis of This UX

### Potential Issue 1: Still Too Many Questions
**Risk**: 5+ questions feels like a form
**Mitigation**:
- Show progress clearly (1/5, 2/5)
- Make each question quick (tap, not type)
- Allow "quick path" option that uses defaults

### Potential Issue 2: User Wants to Browse First
**Risk**: User came to browse, consultation feels forced
**Mitigation**:
- Consultation is only triggered by project-type queries
- Direct product searches go straight to products
- "Skip to products" always available

### Potential Issue 3: Information Overload in Solution
**Risk**: 6 steps with products each is overwhelming
**Mitigation**:
- Collapsed by default
- Show summary first
- "Quick add all" option for confident users

### Potential Issue 4: What If Products Are Out of Stock?
**Risk**: AI recommends product that's unavailable
**Mitigation**:
- Real-time stock check
- Show alternatives immediately
- Never recommend out-of-stock items

### Potential Issue 5: Expert Trust
**Risk**: User doesn't trust AI recommendations
**Mitigation**:
- Show "Why this product" explanations
- Link to human support
- Show that recommendations are based on their inputs

---

## NEXT: Visual Design System & Implementation Plan
