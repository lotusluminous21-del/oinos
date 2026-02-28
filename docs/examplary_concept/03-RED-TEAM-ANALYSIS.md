# Red Team Analysis: Breaking Our Own Design

## Purpose
This document systematically attacks our proposed "Fluid Expert Experience" design to identify weaknesses, edge cases, and failure modes before implementation.

---

## 1. User Persona Attacks

### Persona A: "The Impatient Browser"
**Profile**: Knows what they want, just needs to find it quickly
**Attack**: They type "primer" into the smart search

**Failure Mode**: AI tries to ask questions ("What surface? What color?")
**User Frustration**: "I just want to see primers, not answer 20 questions!"

**Defense**:
- Detect pure product searches vs. project queries
- "primer" → Show product results immediately
- "I need primer for my project" → Trigger consultation
- Use clear signals: question words ("how", "what should", "help me") trigger consultation

**Improved Classification**:
```
Project triggers: 
- "how do I...", "I need to...", "help me...", "fix...", "repair..."
- Contains damage words: scratch, rust, dent, chip, fade
- Contains uncertainty: "should I", "which one", "what's best"

Product triggers:
- Product category names: "primer", "clear coat", "sandpaper"
- Brand names: "SprayMax", "Motip", "Montana"
- SKU/code patterns
- "buy", "price", "how much"
```

---

### Persona B: "The Expert DIYer"
**Profile**: Experienced, knows terminology, just needs products
**Attack**: They type "2K HS clear coat 400ml Motip"

**Failure Mode**: AI still tries to "help" with unnecessary guidance
**User Frustration**: "I know what I'm doing, just show me the product!"

**Defense**:
- Recognize specific product requests
- If query contains brand + product type + size: Direct product search
- No consultation needed
- Maybe offer: "Need application tips?" as optional aside

---

### Persona C: "The Confused Novice"
**Profile**: Doesn't know terminology, can't describe problem well
**Attack**: Types "my car looks bad"

**Failure Mode**: AI can't classify this - too vague
**User Frustration**: Gets unhelpful response or generic products

**Defense**:
- Recognize vague queries
- Respond conversationally: "I'd love to help! Can you tell me more about what's wrong with your car? Is it:"
  - Paint damage (scratches, chips)
  - Rust or corrosion
  - Faded/dull paint
  - Something else
- Use visual options when words fail

---

### Persona D: "The Specification Hunter"
**Profile**: Wants exact technical specs, safety data
**Attack**: "What's the VOC content of your 2K primers?"

**Failure Mode**: AI tries to guide them through project flow
**User Need**: Technical documentation, not purchasing guidance

**Defense**:
- Recognize spec/technical queries
- Route to product pages with spec tabs
- Or provide direct answer if available
- Don't force into project flow

---

### Persona E: "The Budget Optimizer"
**Profile**: Wants cheapest option that works
**Attack**: "Cheapest way to fix a scratch"

**Failure Mode**: AI recommends premium products
**User Frustration**: "I asked for cheap!"

**Defense**:
- Detect budget signals: "cheap", "budget", "affordable", "minimum"
- Ask budget question early or infer from language
- Present budget-tier options first
- Show "upgrade" options as secondary

---

## 2. Conversation Flow Attacks

### Attack: User Changes Mind Mid-Flow
**Scenario**: User starts with "scratch repair", halfway through realizes it's actually rust

**Failure Mode**: System locks them into wrong path, requires restart

**Defense**:
- Allow answer changes at any point
- "Actually, I see some rust" should be handleable mid-flow
- Context panel shows all answers, all are editable
- Changing critical answers triggers re-evaluation

---

### Attack: User Wants to Add More Problems
**Scenario**: User gets solution for scratch, then says "also I have a dent on the fender"

**Failure Mode**: System only handles one problem at a time

**Defense**:
- After solution presented, offer "Add another issue?"
- Or detect compound queries: "scratch AND rust AND dent"
- Generate combined solution with shared products

---

### Attack: User Abandons Mid-Flow, Returns Later
**Scenario**: User answers 3 questions, leaves, comes back tomorrow

**Failure Mode**: All progress lost, must start over

**Defense**:
- Save consultation state in local storage/account
- On return: "Welcome back! You were getting help with a scratch repair. Continue?"
- Option to start fresh

---

### Attack: User Gives Contradictory Answers
**Scenario**: Says "no rust" but later describes "orange spots"

**Failure Mode**: System trusts first answer, gives wrong solution

**Defense**:
- AI should catch contradictions
- "You mentioned orange spots - that sounds like rust. Should I update your plan to include rust treatment?"
- Don't silently fail

---

## 3. Product & Inventory Attacks

### Attack: Recommended Product is Out of Stock
**Scenario**: AI recommends specific primer, it's unavailable

**Failure Mode**: User can't complete the recommended solution

**Defense**:
- Real-time stock check BEFORE recommending
- If out of stock, recommend equivalent alternative
- Show ETA if restocking soon
- Never put out-of-stock in primary recommendation

---

### Attack: No Exact Color Match Available
**Scenario**: User's car is "2019 Toyota Camry Celestial Silver Metallic"
**Reality**: We don't have that exact color code

**Failure Mode**: AI recommends wrong color, user buys wrong paint

**Defense**:
- If exact color not in stock: "We don't have code 1J9 in stock, but:"
  - Offer to order it
  - Suggest universal silver metallic for touch-up
  - Recommend professional color mixing service
- Never recommend a similar color without flagging it

---

### Attack: Product Compatibility Issues
**Scenario**: AI recommends primer that's incompatible with the clear coat also recommended

**Failure Mode**: User buys products that don't work together, project fails

**Defense**:
- Maintain compatibility matrix in database
- Verify all products in solution are compatible
- Use product lines from same manufacturer when possible
- Flag any compatibility caveats

---

## 4. Technical Edge Cases

### Attack: User Asks Impossible Question
**Scenario**: "Can I spray 2K clear coat indoors without ventilation?"

**Failure Mode**: AI answers helpfully with dangerous advice

**Defense**:
- Safety rules must override helpfulness
- Detect safety-critical queries
- "I can't recommend that - 2K products require proper ventilation. Here's why: [safety info]"
- Offer safe alternatives

---

### Attack: User's Problem Can't Be DIY Fixed
**Scenario**: "I have rust holes in my floor pan"

**Failure Mode**: AI tries to recommend products for unfixable DIY job

**Defense**:
- Recognize limits of DIY
- "This sounds like structural rust damage. I'd recommend a professional inspection before DIY repair. Would you like tips on finding a body shop?"
- Don't sell products for jobs that will fail

---

### Attack: Multi-Vehicle/Multi-Material Scenario
**Scenario**: "I'm repainting my car bumper (plastic) and door (metal)"

**Failure Mode**: Single material assumption gives wrong products

**Defense**:
- Detect multi-material scenarios
- Ask about each surface separately if needed
- Provide combined solution with different primers for each

---

## 5. UX Flow Attacks

### Attack: Progress Feels Endless
**Scenario**: User answered 5 questions, AI asks a 6th, 7th...

**Failure Mode**: User abandons, feels like interrogation

**Defense**:
- Hard cap on mandatory questions (max 4-5)
- Always show progress (3/5 complete)
- After core questions: "I have enough to help you! Optional: answer more for a more precise recommendation"
- "Skip to solution" always available after minimum questions

---

### Attack: Visual Options Don't Match User's Reality
**Scenario**: "How deep is the scratch?" shows 3 images, user's scratch looks different

**Failure Mode**: User picks wrong option or abandons

**Defense**:
- "None of these match my situation" option
- Alternative input methods (describe in words, upload photo)
- Photo analysis: "Send a photo and I'll help assess the damage"

---

### Attack: Mobile Keyboard Covers Input
**Scenario**: User types in search, can't see suggestions

**Failure Mode**: Missed functionality, poor experience

**Defense**:
- Suggestions appear ABOVE keyboard
- Input scrolls into view
- Test on actual mobile devices, not just emulators

---

## 6. Business Logic Attacks

### Attack: Always Recommends Premium Products
**Scenario**: AI consistently recommends expensive options

**Failure Mode**: Users feel upsold, lose trust

**Defense**:
- Default to mid-tier products
- Only show premium as "upgrade" option
- Budget-sensitive by default
- Explain value proposition for premium: "[Premium] lasts 2x longer, worth it if you want showroom finish"

---

### Attack: Over-recommends Products
**Scenario**: AI suggests 15 products for a simple scratch

**Failure Mode**: User overwhelmed, feels like cash grab

**Defense**:
- Categorize: "Essential" vs "Nice to Have"
- Minimal viable product list by default
- "Add professional-grade items" as expansion option
- Always explain why each product is included

---

### Attack: Under-recommends Products
**Scenario**: AI forgets to include sandpaper, user's project fails

**Failure Mode**: User has bad experience, blames store

**Defense**:
- Comprehensive checklists per project type
- "Don't forget" section for commonly missed items
- Better to over-communicate than under-deliver

---

## 7. Synthesis: Robust Design Principles

From this red-team analysis, our design must:

### 1. INTELLIGENT ROUTING
- Not everything needs consultation
- Detect intent: Product search, Project help, Technical question, Browse
- Route appropriately, don't force paths

### 2. ESCAPE HATCHES
- Skip to products always available
- Exit consultation without losing progress
- "Just show me everything" option

### 3. TRANSPARENCY
- Show WHY products are recommended
- Show WHAT assumptions are being made
- Allow easy correction of misunderstandings

### 4. SAFETY BOUNDARIES
- Never give dangerous advice
- Recognize DIY limits
- Err on side of caution with safety

### 5. STATE MANAGEMENT
- Save consultation progress
- Allow mid-flow changes
- Handle contradictions gracefully

### 6. INVENTORY AWARENESS
- Real-time stock checking
- Alternatives always ready
- Never recommend unavailable items

### 7. HUMBLE AI
- Know when to ask for clarification
- Know when to involve human support
- Don't pretend certainty when uncertain

---

## NEXT: Final Consolidated Design Specification
