# Dynamic Consultation: Rethinking the Core Paradigm

## The Flaw in Previous Design

I designed a **wizard flow** disguised as a conversation:

```
Question 1 → Question 2 → Question 3 → Question 4 → Solution
```

This is fundamentally wrong because:

1. **Users don't communicate in structured steps** - They dump information chaotically
2. **Information density varies wildly** - One user gives everything, another gives nothing
3. **Context is non-linear** - User might answer Q4 before Q1 organically
4. **Questions depend on answers** - Can't predefine the sequence

---

## What Real Expert Consultation Looks Like

### Scenario A: Information-Rich User

**User**: "I scratched my silver metallic BMW 3 series door pretty deep, I can see shiny metal, there's no rust yet but it's been a few days. I have some spray cans but no spray gun. It's maybe 8cm long."

**Expert's mental model after this**:
- ✓ Damage type: Deep scratch
- ✓ Depth: Down to metal
- ✓ Color: Silver metallic
- ✓ Vehicle: BMW 3 series (can look up color codes)
- ✓ Rust: Not yet, but time-sensitive
- ✓ Equipment: Aerosol cans
- ✓ Size: ~8cm (spot repair territory)
- ? Material: Probably metal door, but should confirm
- ? Budget: Unknown

**Expert response**: "Thanks for the details! Quick question - is this on the metal door panel or the plastic bumper/trim? That affects the primer I'll recommend."

ONE question. Not five.

### Scenario B: Information-Sparse User

**User**: "my car paint is messed up"

**Expert's mental model after this**:
- ? What kind of damage: Unknown
- ? Depth: Unknown
- ? Color: Unknown
- ? Surface: Unknown
- ? Everything: Unknown

**Expert response**: "I can help with that! Can you describe what's happening with the paint? Or even better, share a photo if you can."

Open-ended because we have nothing to work with.

### Scenario C: User With Image

**User**: [uploads photo of rusty scratch] "how do I fix this?"

**Expert's mental model after analyzing image**:
- ✓ Damage type: Scratch with rust (visible in image)
- ✓ Depth: Through to metal (rust confirms this)
- ✓ Rust: Yes, visible
- ~ Size: Appears to be 10-15cm (estimated from image)
- ? Color: Hard to determine exactly from photo
- ? Surface material: Appears to be metal but should confirm
- ? Equipment: Unknown

**Expert response**: "I can see that scratch has developed some rust - good that you're addressing it now! A couple of quick questions:
1. What color is your car? (Hard to tell from the photo)
2. Do you have spray painting equipment, or would you prefer aerosol cans?"

Image analysis reduces questions needed.

---

## The New Mental Model: State Machine with Inference

### Knowledge State Structure

```typescript
interface KnowledgeState {
  // What we know with confidence
  confirmed: {
    damageType?: 'scratch' | 'rust' | 'dent' | 'chip' | 'fade' | 'multiple';
    damageDepth?: 'surface' | 'throughClear' | 'toPrimer' | 'toMetal';
    material?: 'metal' | 'plastic' | 'fiberglass' | 'mixed';
    rustPresent?: boolean;
    rustSeverity?: 'surface' | 'moderate' | 'severe';
    colorType?: 'solid' | 'metallic' | 'pearl' | 'tricoat';
    colorCode?: string;
    colorDescription?: string;
    size?: 'tiny' | 'small' | 'medium' | 'large';
    sizeEstimate?: string;
    equipment?: 'aerosol' | 'sprayGun' | 'none';
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    budget?: 'economy' | 'midRange' | 'premium';
    vehicle?: { make?: string; model?: string; year?: string; };
  };
  
  // What we've inferred but aren't certain about
  inferred: {
    [key: string]: {
      value: any;
      confidence: number; // 0-1
      source: 'text' | 'image' | 'context';
    };
  };
  
  // What we're missing
  gaps: {
    critical: string[];  // Must have for any solution
    important: string[]; // Significantly affects solution
    optional: string[];  // Would refine but can default
  };
  
  // Raw inputs
  inputs: {
    messages: Message[];
    images: ImageAnalysis[];
  };
}
```

### The Processing Loop

```
[User Input (text + images)]
         ↓
[Parse & Extract Information]
         ↓
[Update Knowledge State]
         ↓
[Identify Remaining Gaps]
         ↓
[Decision Point]
         ↓
    ┌────┴────┐
    ↓         ↓
[Enough info] [Need more info]
    ↓         ↓
[Generate    [Generate 
 Solution]    Question]
```

### Gap Prioritization

Not all missing information is equal:

**CRITICAL (Cannot proceed without)**:
- Damage depth (if repair needed)
- Material type (if primer needed)

**IMPORTANT (Significantly affects solution)**:
- Rust presence (adds steps)
- Color type (affects paint system)
- Size (affects application method)

**OPTIONAL (Can default if missing)**:
- Equipment (default to aerosol for DIY)
- Budget (default to mid-range)
- Skill level (default to beginner)

---

## Question Generation Strategy

### Principle: Ask the Most Valuable Question

"Most valuable" = Reduces the most uncertainty with the least user effort.

### Question Types

**1. Disambiguation Question**
When we have partial information that could mean multiple things:

"You mentioned the scratch shows a different color underneath - is that:
- A darker/lighter shade (probably primer showing)
- Shiny silver/gray (bare metal)
- Orange/brown tint (rust developing)"

**2. Confirmation Question**
When we've inferred something and want to verify:

"From your photo, it looks like the damage is on a metal panel. Is that correct, or is it on a plastic part like the bumper?"

**3. Gap-Filling Question**
When we're missing critical information:

"What color is your car? This determines which paint we'll recommend."

**4. Compound Question**
When multiple pieces are missing and related:

"Two quick things I need to know:
1. Is there any rust visible in the damaged area?
2. What color is your car?"

### Never Ask What We Know

If user said "my silver car", NEVER ask "what color is your car?"
Instead, confirm if ambiguous: "You mentioned silver - is that a metallic silver or solid silver?"

---

## Multimodal Input Handling

### Image Analysis Pipeline

```
[User uploads image]
         ↓
[Image Analysis]
├── Damage detection
│   ├── Type (scratch, dent, rust, chip)
│   ├── Severity estimate
│   └── Location on vehicle
├── Surface analysis
│   ├── Material type guess
│   └── Existing paint condition
├── Color extraction
│   ├── Dominant color
│   ├── Metallic/solid/pearl indicators
│   └── Potential color match suggestions
└── Context clues
    ├── Vehicle type/make if visible
    └── Environment (outdoor/indoor)
         ↓
[Merge with text information]
         ↓
[Update Knowledge State with confidences]
```

### Confidence Handling for Image-Derived Info

- High confidence (>0.8): Accept as confirmed
- Medium confidence (0.5-0.8): Accept as inferred, may confirm
- Low confidence (<0.5): Note as possibility, ask user

### Example Image Analysis Result

```json
{
  "damage": {
    "type": "scratch",
    "confidence": 0.92,
    "depth": "to_metal",
    "depthConfidence": 0.78,
    "sizeEstimate": "10-15cm",
    "sizeConfidence": 0.65
  },
  "rust": {
    "present": true,
    "confidence": 0.95,
    "severity": "surface",
    "severityConfidence": 0.70
  },
  "surface": {
    "material": "metal",
    "confidence": 0.85
  },
  "color": {
    "detected": "#4A5568",
    "type": "metallic",
    "typeConfidence": 0.60,
    "description": "gray metallic"
  }
}
```

---

## The "Understanding Display"

### Key UX Innovation

Show users what the AI understood, making it correctable.

```
┌─────────────────────────────────────────┐
│  🧠 Here's what I understand:           │
├─────────────────────────────────────────┤
│                                         │
│  Damage: Deep scratch to bare metal     │
│          ✓ Confident (from your photo)  │
│                                         │
│  Surface: Metal panel                   │
│          ~ Likely (appears metallic)    │
│                                         │
│  Rust: Yes, surface rust visible        │
│        ✓ Confident (orange tint seen)   │
│                                         │
│  Color: Gray metallic                   │
│         ? Uncertain - please confirm    │
│                                         │
│  Size: Medium (~10-15cm)                │
│        ~ Estimated from photo           │
│                                         │
│  ────────────────────────────────────   │
│  [Something wrong? Tap to correct]      │
│                                         │
└─────────────────────────────────────────┘
```

### Correction Flow

When user taps "Something wrong?":

```
┌─────────────────────────────────────────┐
│  Correct my understanding:              │
├─────────────────────────────────────────┤
│                                         │
│  Damage depth:                          │
│  [Surface] [Through clear] [●To metal]  │
│                                         │
│  Surface material:                      │
│  [●Metal] [Plastic] [Not sure]          │
│                                         │
│  Rust present:                          │
│  [●Yes] [No]                            │
│                                         │
│  Color type:                            │
│  [Solid] [●Metallic] [Pearl] [Unsure]   │
│                                         │
│  Color: [Gray      ▼] or type: [____]   │
│                                         │
│  [Update My Situation]                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Conversational Flow Examples

### Flow 1: Efficient Path (Rich Initial Input)

```
USER: "I have a 15cm scratch on my white Honda door, goes through 
to metal but no rust yet. I want to use spray cans."

AI: [Shows understanding panel]
"Great, I've got a clear picture:
✓ Deep scratch (through to metal)
✓ Metal door panel  
✓ No rust yet
✓ White color
✓ Using aerosol cans
✓ Size: ~15cm

One quick question: Is the white a solid/flat white, or does it have 
a metallic/pearl shimmer to it?

[Solid white] [Metallic white] [Pearl white] [Not sure]"

USER: [Taps "Solid white"]

AI: [Shows solution]
"Perfect! Here's your repair plan for a solid white spot repair..."
```

**Total questions asked: 1**

### Flow 2: Exploratory Path (Image + Minimal Text)

```
USER: [Uploads photo of rusty scratch] "what do I need for this?"

AI: [Analyzes image, shows understanding]
"I can see from your photo:
✓ Scratch with rust developing
~ Appears to be on metal
~ Damage is medium-sized
? Color is hard to tell from the lighting

To give you the right products, I need to know:

What color is your car?
[Show color options / or type it]"

USER: "It's blue, like a dark blue metallic"

AI: [Updates understanding]
"Got it - dark blue metallic. And I'm assuming this is on a metal 
panel (like a door or fender), not plastic (like a bumper). 
Is that right?

[Yes, it's metal] [No, it's plastic]"

USER: [Taps "Yes, it's metal"]

AI: [Shows solution]
"Here's your rust repair plan for dark blue metallic..."
```

**Total questions asked: 2** (color, material confirmation)

### Flow 3: Guidance Path (Vague Input)

```
USER: "my car looks bad, needs help"

AI: "I'd love to help! To point you in the right direction, 
can you tell me more about what's going on?

Or share a photo and I can take a look!

[Upload a photo]

Or describe the issue:
• Is the paint scratched or chipped?
• Is there rust anywhere?
• Has the color faded or dulled?
• Something else?"

USER: "there's rust spots on the hood and some scratches on the bumper"

AI: "Okay, sounds like we have two things to address:

1. Rust spots on hood (metal)
2. Scratches on bumper (usually plastic)

Let me help you with both. For the rust spots - are they:

[Small spots, mostly surface rust]
[Larger areas with deeper rust]
[Rust bubbling under the paint]"

... continues based on answers ...
```

**Questions adapt to the situation entirely.**

---

## Handling Multi-Problem Scenarios

### Detection

Watch for signals of multiple issues:
- "and also..."
- "plus there's..."
- Listing multiple locations
- Photo showing multiple damage areas

### Response

```
AI: "I see you've got a few things going on:

1. 🔴 Rust on the hood
2. 🟡 Scratch on the bumper
3. 🟡 Chip on the fender

I can create a plan that covers all of these. Some products 
(like sandpaper, degreaser) will be shared across repairs.

Want me to create a combined plan, or focus on one at a time?

[Combined plan] [Start with rust] [Start with scratch]"
```

---

## Decision Threshold: When to Generate Solution

### Minimum Viable Knowledge

We can generate a solution when:

**For surface damage (polish/compound):**
- Know it's surface-level damage
- That's it - can recommend polishing kit

**For paint repair:**
- Damage depth: Confirmed
- Material type: Confirmed or high-confidence inferred
- Color type: Confirmed (solid/metallic/pearl)
- Rust status: Confirmed or reasonably assumed (if recent damage, assume no)

**Can default if missing:**
- Exact color (recommend color-match service or lookup)
- Equipment (default to aerosol for DIY)
- Size (affects quantities, not products)
- Budget (default to mid-tier)

### Generating with Assumptions

When we default, be explicit:

```
"Based on what you've shared, here's your repair plan.

⚠️ I've made some assumptions:
• Using aerosol cans (let me know if you have spray gun)
• Mid-range products (budget or premium options available)
• Standard color match (you may need exact code for perfect match)

[Adjust these assumptions]"
```

---

## Red-Teaming This New Approach

### Attack 1: AI Misunderstands, User Doesn't Correct

**Risk**: AI thinks "metal" but it's plastic, user doesn't notice, buys wrong primer.

**Defense**: 
- Show confidence levels
- For low-confidence inferences, ASK rather than assume
- Make correction UI prominent
- In solution, note assumptions: "This primer is for metal surfaces"

### Attack 2: Too Chatty

**Risk**: Multiple back-and-forth messages feels slow.

**Defense**:
- Batch questions when possible (ask 2-3 things at once if needed)
- Offer "Quick path" that uses smart defaults
- Remember preferences for returning users

### Attack 3: Image Analysis Fails

**Risk**: Photo is blurry, poor lighting, AI extracts wrong info.

**Defense**:
- Always show what AI "saw" in the image
- Ask for confirmation on image-derived info
- Allow easy re-upload or manual correction
- Fallback to text questions if image unclear

### Attack 4: User Keeps Changing Inputs

**Risk**: User says "silver", then "actually blue", then "wait, gray". State becomes confused.

**Defense**:
- Latest input wins
- Show current state clearly
- Log changes for debugging
- Don't punish changes - "No problem, updated to gray"

### Attack 5: User Wants to Browse, Not Consult

**Risk**: User just wants to see products, AI keeps asking questions.

**Defense**:
- "Just show me products" escape hatch always visible
- If query is clearly product-focused, skip consultation
- Don't force conversation on unwilling users

---

## Implementation Architecture

### Core Components Needed

1. **Input Parser**
   - Text analysis (keyword extraction, intent detection)
   - Image analysis (damage detection, color extraction)
   - Voice transcription (optional, Phase 2)

2. **Knowledge State Manager**
   - Maintains what we know/don't know
   - Tracks confidence levels
   - Identifies gaps

3. **Question Generator**
   - Given gaps, produces contextual questions
   - Adapts tone and complexity to conversation
   - Batches related questions

4. **Solution Generator**
   - Given knowledge state, produces repair plan
   - Matches products from catalog
   - Calculates quantities and alternatives

5. **Conversation UI**
   - Chat-like interface
   - Image upload
   - Understanding display
   - Correction interface
   - Solution display

### Mock vs Real AI

For the prototype:
- **Mock image analysis**: Predefined responses based on uploaded image hash or random
- **Mock text parsing**: Enhanced keyword detection with synonym handling
- **Mock question generation**: Template-based with context insertion
- **Real solution generation**: Rule-based from knowledge state

---

## Next Steps

1. Design the conversation UI in detail (mobile wireframes)
2. Define the mock AI behaviors
3. Implement from scratch in clean directory
4. Test with 3-4 scenario types
