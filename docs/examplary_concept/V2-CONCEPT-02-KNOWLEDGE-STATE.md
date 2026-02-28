# Knowledge State System

## Core Concept

The Knowledge State is the central data structure that tracks everything the system knows (or believes it knows) about the user's paint repair situation. It evolves throughout the conversation and ultimately determines the solution generated.

---

## Information Categories

### 1. Confirmed Information
Facts the user has explicitly stated or directly confirmed. These are treated as ground truth.

**Examples:**
- User types "it's on my bumper" → Material: Plastic (confirmed)
- User selects "Down to bare metal" from question options → Damage Depth: toMetal (confirmed)
- User says "yes there's some rust" → Rust Present: true (confirmed)

### 2. Inferred Information
Facts the system has extracted from context with a confidence score (0-1). The system expresses uncertainty appropriately.

**Examples:**
- User mentions "silver car" → Color Type: Metallic (inferred, confidence: 0.85)
- Image shows orange discoloration → Rust Present: true (inferred, confidence: 0.95)
- User says "on my door" → Material: Metal (inferred, confidence: 0.80)

### 3. Gap Analysis
What the system still needs to know, prioritized by importance:

**Critical Gaps:** Must be resolved before generating a solution
- Damage depth (determines entire repair approach)
- Material type (determines primer selection)

**Important Gaps:** Significantly affect solution quality
- Color type (affects paint selection and blending technique)
- Rust presence (adds treatment steps if present)
- Size of damage (affects product quantities)

**Optional Gaps:** Can use sensible defaults
- Equipment type (default: aerosol spray cans)
- Color code (can recommend custom-mix products)
- Vehicle info (nice-to-have for records)

---

## Confidence Thresholds

| Threshold | Behavior |
|-----------|----------|
| ≥ 0.8 | Treat as known fact, display in "understanding card" |
| 0.6 - 0.79 | Mention tentatively, open to correction |
| < 0.6 | Do not assume, ask for clarification |

---

## Dynamic Gap Adjustment

Gaps are not static—they adjust based on what's already known:

### Example 1: Surface-Only Damage
```
If damage depth = "surface"
  Then:
    - Material becomes optional (polish works on all)
    - Color type becomes optional (no paint needed)
    - Solution simplifies to just polishing
```

### Example 2: Plastic Bumper
```
If material = "plastic"
  Then:
    - Rust presence becomes irrelevant (plastic doesn't rust)
    - System should not ask about rust
```

---

## State Evolution Example

### Initial State (conversation start)
```
Confirmed: {}
Inferred: {}
Gaps:
  Critical: [damageDepth, material]
  Important: [colorType, rustPresent, size]
  Optional: [equipment, colorCode, vehicleInfo]
```

### After user says: "I have a scratch on my car door, I can see metal"
```
Confirmed: {
  damageType: scratch
  damageDepth: toMetal
  location: door
}
Inferred: {
  material: { value: metal, confidence: 0.85, source: text }
}
Gaps:
  Critical: []  ← damageDepth confirmed, material inferred high-confidence
  Important: [colorType, rustPresent, size]
  Optional: [equipment, colorCode, vehicleInfo]
```

### After user uploads photo showing rust
```
Confirmed: {
  damageType: scratch
  damageDepth: toMetal
  location: door
  rustPresent: true  ← promoted from inference due to high confidence
}
Inferred: {
  material: { value: metal, confidence: 0.85 }
  size: { value: medium, confidence: 0.70, source: image }
}
Gaps:
  Critical: []  ← Ready for solution!
  Important: [colorType]
  Optional: [equipment, colorCode, vehicleInfo]
```

---

## Ready-for-Solution Determination

The system can generate a solution when:

1. **All critical gaps are resolved** (confirmed OR inferred with confidence ≥ 0.7)
2. **At least one damage attribute is confirmed** (can't generate from nothing)

Important and optional gaps can use defaults:
- Equipment → aerosol spray cans
- Size → medium
- Color type → metallic (most common)
- Rust present → false (optimistic assumption)

---

## Correction Mechanism

Users can always correct system understanding:

1. **Understanding Card** displays current state
2. User can tap any item to change it
3. Correction updates confirmed state
4. Gaps recalculate
5. Solution regenerates if already generated

---

## State Persistence

The Knowledge State persists only for the session duration. Each new conversation starts fresh. Cart contents persist across sessions.
