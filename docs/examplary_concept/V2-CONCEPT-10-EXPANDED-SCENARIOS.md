# Expanded Project Scenarios

## Overview

The original V2 design focused exclusively on **damage repair**. This document expands the system to handle the full spectrum of automotive paint/coating projects that bring customers to an e-shop.

---

## Project Type Taxonomy

### 1. DAMAGE REPAIR (Original Focus)
Someone has damage they want to fix.

**Subtypes:**
- Scratch repair (surface to deep)
- Stone chip repair
- Rust treatment and repair
- Dent-related paint repair
- Faded/peeling paint restoration

**Key Variables:** Damage type, depth, rust presence, material, color type, size

**Product Categories:** Rust treatment, sanding, primers, base coats, clear coats, finishing

---

### 2. NEW PARTS PAINTING
Someone purchased an unpainted or pre-primed replacement part and needs to paint it to match their vehicle.

**Subtypes:**
- Unpainted plastic parts (bumpers, mirror caps, trim)
- Unpainted metal parts (fenders, hoods, doors)
- Pre-primed parts (already have factory primer)
- Bare parts (no primer at all)

**Key Variables:**
- Part type (bumper, fender, mirror, etc.)
- Material (plastic, metal, fiberglass)
- Pre-primed or bare
- Color to match (color code needed)
- Equipment available

**Product Categories:**
- Adhesion promoters (essential for plastic)
- Primers (plastic primer, metal primer, primer filler)
- Base coats (color-matched)
- Clear coats
- Finishing compounds
- Masking supplies

**Key Differences from Damage Repair:**
- No rust treatment (new part)
- No damage assessment
- Full part coverage (not spot repair)
- Color code becomes critical
- Adhesion promoter mandatory for plastic

---

### 3. RESTORATION / FULL RESPRAY
Someone wants to restore or completely repaint a vehicle or panel.

**Subtypes:**
- Classic car restoration (bare metal respray)
- Panel refresh (faded/oxidized paint)
- Full respray (color refresh)
- Bare metal painting

**Key Variables:**
- Current paint condition (faded, oxidized, peeling, bare metal)
- Scope (panel, multiple panels, entire vehicle)
- Original vs. custom color
- Single-stage vs. basecoat/clearcoat paint
- Time/skill commitment

**Product Categories:**
- Paint strippers (chemical or mechanical)
- Heavy-duty sanding supplies (80-600 grit range)
- Rust treatment (for bare metal)
- Epoxy primers (moisture barrier for bare metal)
- High-build primer fillers
- Base coats (large quantities)
- Clear coats (large quantities)
- Finishing and polishing supplies

**Key Differences:**
- Much larger product quantities
- More emphasis on preparation
- Higher skill level required
- May need professional equipment recommendation

---

### 4. PROTECTIVE COATINGS
Someone wants to protect or enhance their existing paint without repainting.

**Subtypes:**
- Ceramic coating application
- Traditional waxing
- Paint sealant application
- PPF (clear bra) preparation
- Paint refresh (polish and protect)

**Key Variables:**
- Current paint condition (good, light oxidation, swirls)
- Protection goal (durability, ease of cleaning, shine)
- Time commitment
- Application method (hand vs. machine)
- Prior coatings present

**Product Categories:**
- Pre-cleaners and degreasers
- Clay bars and lubricants
- Cutting compounds (for paint correction)
- Polishing compounds
- IPA (isopropyl alcohol) prep spray
- Ceramic coatings
- Waxes and sealants
- Applicators and microfiber towels

**Key Differences:**
- No primers or paints
- Focus on surface preparation
- Paint correction before protection
- Maintenance and longevity focus

---

### 5. CUSTOM / SPECIAL FINISHES
Someone wants to change their vehicle's appearance or add special effects.

**Subtypes:**
- Full color change
- Accent painting (stripes, graphics)
- Special effects (metallic, pearl, candy, color-shift)
- Interior color change
- Wheels/calipers painting

**Key Variables:**
- Current color
- Desired color/effect
- Surface type (exterior body, interior vinyl/leather, wheels)
- Coverage area
- Equipment available

**Product Categories:**
- Specialized base coats (metallic, pearl, candy, color-shift)
- Effect additives
- Interior paint (vinyl/leather specific)
- Wheel/caliper paint (high-temp)
- Masking for graphics
- Clear coats

**Key Differences:**
- Creative/aesthetic focus
- May require special application techniques
- Effect paints need specific base colors
- Higher skill requirements for even application

---

## Project Type Detection

### From User Input

**Damage Repair Indicators:**
- "scratched", "damaged", "chip", "rust", "dent", "keyed"
- "fix", "repair", "restore" (in damage context)
- Photo showing visible damage

**New Parts Indicators:**
- "new bumper", "replacement part", "bought a", "purchased"
- "unpainted", "primed", "bare plastic", "aftermarket"
- "match my car", "paint code"

**Restoration Indicators:**
- "respray", "repaint", "restoration"
- "classic car", "bare metal"
- "faded", "oxidized" (whole panel context)
- "refresh", "full panel"

**Protective Coating Indicators:**
- "ceramic", "wax", "sealant", "protect"
- "shine", "gloss", "polish"
- "swirl marks", "light scratches" (detailing context)
- "PPF prep", "clear bra"

**Custom Finish Indicators:**
- "color change", "custom", "new color"
- "metallic", "pearl", "candy", "color shift"
- "stripes", "graphics", "accent"
- "wheels", "calipers", "interior"

---

## Multi-Intent Handling

Some queries span multiple project types:

**"I bought a new bumper and want to match it + protect the whole car"**
→ Primary: New Parts Painting
→ Secondary: Protective Coating
→ System can generate sequential solutions

**"My car is faded and has some scratches"**
→ If scratches are superficial: Protective Coating (polish + protect)
→ If scratches are deep: Damage Repair first, then protection

**"Restoring a classic car with some rust spots"**
→ Primary: Restoration
→ Rust treatment incorporated into restoration steps

---

## Solution Generation Implications

### Different Products Per Project Type

| Step | Damage Repair | New Parts | Restoration | Protection | Custom |
|------|---------------|-----------|-------------|------------|--------|
| Prep | Degreaser, tack cloth | Degreaser, plastic cleaner | Stripper, degreaser | Wash, clay bar | Degreaser |
| Rust | Converter, inhibitor | N/A | Converter, inhibitor | N/A | N/A |
| Sand | 320-600 grit | 320-600 grit | 80-600 grit | 2000-3000 grit | 320-600 grit |
| Prime | Per material | Adhesion promoter + primer | Epoxy + high-build | N/A | Per material |
| Color | Spot repair quantity | Full part quantity | Large quantity | N/A | Effect paints |
| Clear | 1-2 cans | 2-3 cans | Multiple cans | N/A | Per effect |
| Finish | Compound, polish | Compound, polish | Compound, polish | Compound, polish, coating | Compound, polish |

### Quantity Scaling

| Project Type | Base Coat | Clear Coat | Primer |
|--------------|-----------|------------|--------|
| Small scratch | 1 can | 1 can | 1 can |
| Medium damage | 1 can | 1-2 cans | 1 can |
| Single bumper | 2-3 cans | 2-3 cans | 2 cans |
| Single panel | 3-4 cans | 3-4 cans | 2-3 cans |
| Full vehicle | 10-15 cans | 10-15 cans | 6-8 cans |

---

## Difficulty Ratings Per Project Type

| Project Type | Typical Difficulty | Factors That Increase |
|--------------|--------------------|----------------------|
| Surface scratch polish | Beginner | - |
| Small damage repair | Intermediate | Rust, metallic paint, plastic |
| New bumper painting | Intermediate | Color matching, pearl/metallic |
| Single panel restoration | Intermediate-Advanced | Bare metal, rust |
| Full respray | Advanced | Scope, color matching |
| Ceramic coating | Intermediate | Paint correction needed |
| Waxing | Beginner | - |
| Custom effects | Advanced | Effect type complexity |
