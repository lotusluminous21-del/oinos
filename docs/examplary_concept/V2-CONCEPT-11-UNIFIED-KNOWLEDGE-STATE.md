# Unified Knowledge State System

## Overview

This document extends the original Knowledge State design to accommodate all project types, not just damage repair.

---

## Revised Knowledge State Structure

### Project Context (New Section)

```
projectContext: {
  projectType: 'damage_repair' | 'new_parts' | 'restoration' | 'protection' | 'custom'
  projectSubtype?: string  // e.g., 'scratch', 'bumper_painting', 'ceramic_coating'
  primaryGoal: string      // User's stated goal
  secondaryGoals: string[] // Additional objectives detected
}
```

### Confirmed Information (Expanded)

```
confirmed: {
  // UNIVERSAL
  material?: 'metal' | 'plastic' | 'fiberglass' | 'mixed'
  colorType?: 'solid' | 'metallic' | 'pearl' | 'tricoat'
  colorDescription?: string
  colorCode?: string
  equipment?: 'aerosol' | 'sprayGun' | 'none'
  
  // DAMAGE REPAIR SPECIFIC
  damageType?: 'scratch' | 'rust' | 'chip' | 'dent' | 'fade' | 'peel'
  damageDepth?: 'surface' | 'throughClear' | 'toPrimer' | 'toMetal'
  damageSize?: 'tiny' | 'small' | 'medium' | 'large'
  rustPresent?: boolean
  location?: string
  
  // NEW PARTS SPECIFIC
  partType?: 'bumper' | 'fender' | 'hood' | 'door' | 'mirror' | 'trim' | 'spoiler' | 'other'
  partCondition?: 'bare' | 'prePrimed' | 'coated'
  
  // RESTORATION SPECIFIC
  currentPaintCondition?: 'good' | 'faded' | 'oxidized' | 'peeling' | 'bareMetal'
  scope?: 'spot' | 'panel' | 'multiPanel' | 'fullVehicle'
  existingPaintType?: 'singleStage' | 'basecoatClearcoat' | 'unknown'
  
  // PROTECTION SPECIFIC
  existingCoating?: 'none' | 'wax' | 'sealant' | 'ceramic' | 'unknown'
  paintCorrectionNeeded?: boolean
  desiredProtection?: 'basic' | 'premium' | 'ceramic'
  
  // CUSTOM SPECIFIC
  desiredEffect?: 'solid' | 'metallic' | 'pearl' | 'candy' | 'colorShift' | 'matte'
  targetSurface?: 'exterior' | 'interior' | 'wheels' | 'accents'
  
  // VEHICLE INFO (all types)
  vehicleInfo?: {
    make?: string
    model?: string
    year?: string
  }
}
```

### Gap Analysis (Context-Dependent)

Gaps vary by project type:

#### Damage Repair Gaps
```
critical: ['damageDepth', 'material'*]
important: ['colorType', 'rustPresent'*, 'damageSize']
optional: ['equipment', 'colorCode', 'vehicleInfo']

* material not needed for surface damage
* rustPresent only for metal + non-surface damage
```

#### New Parts Gaps
```
critical: ['material', 'partCondition']
important: ['colorCode', 'colorType']
optional: ['equipment', 'vehicleInfo']
```

#### Restoration Gaps
```
critical: ['currentPaintCondition', 'scope']
important: ['material', 'colorType', 'existingPaintType']
optional: ['colorCode', 'equipment', 'vehicleInfo']
```

#### Protection Gaps
```
critical: []  // Can always provide basic protection plan
important: ['paintCorrectionNeeded', 'desiredProtection']
optional: ['existingCoating']
```

#### Custom Gaps
```
critical: ['targetSurface', 'desiredEffect']
important: ['colorType', 'material']
optional: ['equipment', 'vehicleInfo']
```

---

## Project Type Detection Logic

### Detection Priority

1. **Explicit Keywords** (highest confidence)
   - "paint my new bumper" → New Parts (0.95)
   - "ceramic coating" → Protection (0.95)
   - "respray my car" → Restoration (0.90)

2. **Contextual Phrases** (high confidence)
   - "bought a replacement" + part name → New Parts (0.85)
   - "faded paint" + "whole panel" → Restoration (0.80)
   - "scratched" + location → Damage Repair (0.85)

3. **Image Analysis** (medium confidence)
   - Visible damage → Damage Repair (0.70-0.90)
   - New part (no damage, clean) → New Parts (0.60)
   - Faded/chalky surface → Restoration (0.70)

4. **Ambiguous** (ask for clarification)
   - "need to paint" → Could be any type
   - "fix my paint" → Damage or Restoration?

### Clarification Questions

When project type is ambiguous:

```
"I'd love to help! To give you the best guidance, could you tell me more about your project?"

Options:
• Repair damage (scratch, chip, rust)
• Paint a new/replacement part
• Restore faded paint / full respray
• Protect paint (wax, ceramic coating)
• Custom color or effects
```

---

## State Transitions

### Initial State
```
projectContext: { projectType: null }
confirmed: {}
inferred: {}
gaps: { critical: ['projectType'] }  // Must determine project type first
```

### After Project Type Determined
```
projectContext: { projectType: 'new_parts', projectSubtype: 'bumper' }
confirmed: { partType: 'bumper' }
inferred: { material: { value: 'plastic', confidence: 0.85 } }
gaps: {
  critical: ['partCondition'],  // Is it bare or pre-primed?
  important: ['colorCode', 'colorType'],
  optional: ['equipment']
}
```

---

## Cross-Project Considerations

### Universal Products

Some products span multiple project types:
- Degreasers (all types)
- Tack cloths (all painting types)
- Microfiber towels (all types)
- Masking tape/paper (all painting types)

### Material-Dependent Products

These vary by material regardless of project type:
- Metal → Metal primer, rust treatment options
- Plastic → Adhesion promoter mandatory
- Fiberglass → Flexible primer

### Color-Dependent Products

These vary by color type regardless of project type:
- Solid → Standard base coat
- Metallic → Metallic base coat, careful application
- Pearl → Pearl base coat, white underbase often needed
- Tricoat → Multi-stage system, advanced skill

---

## Ready-for-Solution Criteria by Project Type

### Damage Repair
- ✓ Damage depth known (confirmed or high-confidence inferred)
- ✓ Material known OR damage is surface-only
- Ready to generate solution

### New Parts
- ✓ Part material known
- ✓ Part condition known (bare vs. pre-primed)
- ✓ Color information available (or can recommend custom-match)
- Ready to generate solution

### Restoration
- ✓ Current condition known
- ✓ Scope known (panel vs. full vehicle)
- Ready to generate solution (with appropriate warnings for advanced projects)

### Protection
- Always ready (can provide basic wax recommendation)
- Better solution with: correction needs known, protection level preference

### Custom
- ✓ Target surface known
- ✓ Desired effect known
- Ready to generate solution
