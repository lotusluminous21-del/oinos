# Defaults & Uncertainty Handling: A Deep Dive

## The Core Tension

Without rigid question sequences, we face a constant decision:

> **When the user doesn't provide information X, do we:**
> A) Ask about X
> B) Assume a default for X
> C) Proceed without X and flag the uncertainty

This document explores the nuances of this decision.

---

## The Cost-Benefit Framework

### Cost of Asking
- User effort (answering takes time)
- Friction (might abandon)
- Annoyance (feels like interrogation)
- Perceived incompetence ("why can't you figure this out?")

### Cost of Wrong Assumption
- Wrong product recommendation
- User buys incorrect items
- Project fails
- Returns/complaints
- Lost trust

### The Equation

```
Decision = f(importance of X, confidence in default, user patience)
```

If X is **critical** and default confidence is **low** → ASK
If X is **optional** and default confidence is **high** → ASSUME
If X is **important** and default confidence is **medium** → INFORM + OFFER TO CHANGE

---

## Variable-by-Variable Analysis

### 1. DAMAGE DEPTH

| Aspect | Value |
|--------|-------|
| Importance | CRITICAL |
| Consequence of wrong | Wrong entire approach |
| Can we infer? | Sometimes from description ("I see metal") |
| Can we infer from image? | Often with medium confidence |
| Safe default? | NO - there is no safe default |

**Strategy**: 
- If clear from input: Accept
- If inferable from image (high confidence): Confirm briefly
- If unclear: Must ask - but use visual options

### 2. SURFACE MATERIAL (Metal vs Plastic)

| Aspect | Value |
|--------|-------|
| Importance | CRITICAL for primer selection |
| Consequence of wrong | Wrong primer = adhesion failure |
| Can we infer? | From location ("door" = metal, "bumper" = often plastic) |
| Can we infer from image? | Sometimes |
| Safe default? | NO |

**Strategy**:
- If location given: Infer with confidence statement
- "Sounds like your door (usually metal). Is that right, or is it plastic?"
- Don't assume silently

### 3. RUST PRESENCE

| Aspect | Value |
|--------|-------|
| Importance | HIGH - adds entire treatment phase |
| Consequence of wrong | If we miss rust: Repair fails later |
| Can we infer? | From description ("orange spots") |
| Can we infer from image? | Yes, usually high confidence |
| Safe default? | Default NO for fresh damage, ask for older damage |

**Strategy**:
- If recent damage ("just scratched", "yesterday"): Assume no rust
- If older/unknown timing: Ask or infer from image
- From image: Usually clearly visible

### 4. COLOR TYPE (Solid/Metallic/Pearl)

| Aspect | Value |
|--------|-------|
| Importance | HIGH - determines paint system |
| Consequence of wrong | Wrong paint type = visible mismatch |
| Can we infer? | From description ("silver" implies metallic) |
| Can we infer from image? | With medium confidence |
| Safe default? | Lean toward metallic (more common, worst case use metallic system on solid) |

**Strategy**:
- If color name given, infer type:
  - Silver, gray, blue metallic → Metallic
  - White, black, red often solid but varies
- Show what we think + ask if uncertain
- For touch-ups, exact type matters; for primer selection, less so

### 5. EXACT COLOR CODE

| Aspect | Value |
|--------|-------|
| Importance | MEDIUM - affects color match quality |
| Consequence of wrong | Color doesn't match perfectly |
| Can we infer? | From make/model/year |
| Safe default? | Offer color lookup tool or close match |

**Strategy**:
- Not critical for consultation
- Offer lookup service/tool
- Can proceed with "your color" and recommend generic or lookup later

### 6. DAMAGE SIZE

| Aspect | Value |
|--------|-------|
| Importance | MEDIUM - affects application method and quantities |
| Consequence of wrong | Wrong format (touch-up pen vs spray) or quantities |
| Can we infer? | From image (with caveats) |
| Safe default? | "Medium" is safe - covers most cases |

**Strategy**:
- Ask if will significantly change approach (touch-up pen vs spray)
- Otherwise estimate from context or default to medium

### 7. EQUIPMENT AVAILABLE

| Aspect | Value |
|--------|-------|
| Importance | MEDIUM - affects product format |
| Consequence of wrong | User gets spray-gun product without gun, or vice versa |
| Can we infer? | Not really, unless user mentions |
| Safe default? | Aerosol for DIY (most accessible) |

**Strategy**:
- Default to aerosol for DIY users
- Note assumption in solution: "Using aerosol cans (have a spray gun? let me know)"
- If project is large, proactively ask

### 8. SKILL LEVEL

| Aspect | Value |
|--------|-------|
| Importance | LOW - affects guidance detail, not products |
| Consequence of wrong | Too much or too little guidance |
| Can we infer? | From language (technical terms = experienced) |
| Safe default? | Beginner (better to over-explain) |

**Strategy**:
- Default to beginner guidance
- Infer from technical language
- Offer "show advanced tips" option

### 9. BUDGET

| Aspect | Value |
|--------|-------|
| Importance | LOW - affects product tier |
| Consequence of wrong | User sees products outside budget |
| Can we infer? | Only if explicitly mentioned |
| Safe default? | Mid-range (show alternatives) |

**Strategy**:
- Default to mid-range
- Always show "budget" and "premium" alternatives
- Note: "I've selected mid-range products. Budget options are available."

---

## The "Informed Default" Pattern

For medium-importance variables, use this pattern:

```
┌─────────────────────────────────────────┐
│  I'm assuming:                          │
│                                         │
│  • Using aerosol cans (not spray gun)   │
│  • Mid-range product quality            │
│  • You're new to this (full guidance)   │
│                                         │
│  [These assumptions are fine]          │
│  [I want to adjust something]          │
│                                         │
└─────────────────────────────────────────┘
```

This:
- Respects user time (doesn't force answers)
- Shows transparency (user knows what we assumed)
- Allows correction (if they care to change)
- Enables quick path (accept all defaults)

---

## The "Graceful Uncertainty" Pattern

For inferred information, show confidence:

```
┌─────────────────────────────────────────┐
│  From your photo, I can see:            │
│                                         │
│  ✓ Deep scratch with rust               │
│      (pretty sure about this)           │
│                                         │
│  ~ Metal panel                          │
│      (looks like it, but confirm?)      │
│      [Yes, metal] [No, it's plastic]    │
│                                         │
│  ? Color type                           │
│      (can't tell from lighting)         │
│      [Solid] [Metallic] [Pearl]         │
│                                         │
└─────────────────────────────────────────┘
```

**Key principles:**
- High confidence: State it, don't ask
- Medium confidence: State it, quick confirm option
- Low confidence: Admit it, ask for help

---

## Scenario: The "Just Do It" User

Some users will be impatient:

```
USER: "I scratched my car, what paint do I need?"

AI: "I'd love to help! To recommend the right products, I need to 
know a few things about the damage. Can you share a photo or 
describe it?"

USER: "Just show me scratch repair stuff"
```

**How to handle:**

Option A: Refuse (bad UX)
```
AI: "I really need more details to help you properly."
```

Option B: Show generic (risky)
```
AI: "Here are some scratch repair products..." 
[shows random assortment]
```

Option C: **Graceful degradation** (best)
```
AI: "No problem! Here are your options:

🟢 LIGHT SCRATCHES (surface only)
If you can barely feel it, you just need:
[Polishing compound] [Scratch remover]

🟡 MEDIUM SCRATCHES (paint damage, no rust)
If you see a different color but no rust:
[Primer] [Color match paint] [Clear coat]

🔴 DEEP SCRATCHES WITH RUST
If you see metal or rust:
[Rust treatment] [Primer] [Paint] [Clear coat]

Not sure which? [Upload a photo] or [Take the quick quiz]"
```

This respects their desire for speed while still guiding them.

---

## The Default Safety Net

### In the Solution Itself

When we've made assumptions, embed safety notes:

```
STEP 3: Apply Primer

We've recommended metal primer based on your description.

⚠️ IMPORTANT: This primer is for METAL surfaces only. 
If you're working on a plastic bumper or trim, stop and 
let us know - you'll need a different primer.

[This is plastic, not metal]
```

### Product-Level Warnings

```
┌───────────────────────┐
│  SprayMax 2K Primer       │
│  For metal surfaces       │
│                           │
│  🔍 Check your surface:    │
│  • Metal door/fender: ✓   │
│  • Plastic bumper: ✗      │
│    (you need plastic      │
│     primer instead)       │
│                           │
└───────────────────────┘
```

---

## Decision Flow Diagram

```
User provides input
        │
        ▼
Parse for variable X
        │
        ▼
┌───────────────┐
│ Is X mentioned │
│ explicitly?    │
└──────┬────────┘
       │
   YES │ NO
       │
       ├────────────────┐
       │                │
       ▼                ▼
 Accept as          Can we infer X?
 confirmed          (from context/image)
                         │
                    YES  │  NO
                         │
                    ┌────┼────┐
                    │         │
                    ▼         ▼
            High conf?    Is X critical?
                    │         │
               YES  │  NO    YES │  NO
                    │         │
               ┌────┼────┐    ┌────┼────┐
               │         │    │         │
               ▼         ▼    ▼         ▼
           Accept    Confirm  ASK    Use default
           inferred  briefly  user   + note it
```

---

## Summary: Decision Matrix

| Variable | If Explicit | If Inferable | If Missing |
|----------|-------------|--------------|------------|
| Damage depth | Accept | Confirm if <0.8 | ASK |
| Material | Accept | Confirm always | ASK |
| Rust | Accept | Accept if >0.7 | Assume NO if fresh |
| Color type | Accept | Accept/suggest | Default metallic |
| Color code | Accept | Offer lookup | Skip (offer lookup later) |
| Size | Accept | Accept estimate | Default medium |
| Equipment | Accept | N/A | Default aerosol |
| Skill | Accept | Infer from language | Default beginner |
| Budget | Accept | N/A | Default mid-range |

---

## Key Takeaway

The system should feel like a **knowledgeable friend** who:
- Notices what you've already told them
- Only asks what they actually need to know
- Makes smart guesses but checks when uncertain
- Never makes you repeat yourself
- Gets you to an answer as quickly as possible
- Admits when they're not sure

**Not** like a:
- Form that demands every field
- System that ignores what you said
- Chatbot that keeps asking the same things
- Expert who pretends to know everything
