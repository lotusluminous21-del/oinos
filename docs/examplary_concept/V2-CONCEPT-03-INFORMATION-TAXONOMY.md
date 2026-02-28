# Information Taxonomy

## Overview

This document defines all the information dimensions the system tracks to understand a paint repair situation and generate appropriate solutions.

---

## 1. Damage Type

**What it means:** The nature of the paint problem.

| Value | Description | Recognition Keywords |
|-------|-------------|---------------------|
| scratch | Linear damage from contact | scratch, scraped, keyed, scratched |
| rust | Corrosion damage | rust, rusted, rusty, corrosion |
| chip | Impact damage (rocks/debris) | chip, chipped, stone chip |
| dent | Physical deformation (not paint-specific but related) | dent, dented, ding |
| fade | Color degradation from sun/weather | fade, faded, dull, oxidized |
| peel | Paint layer separation | peel, peeling, flaking |

**Impact on Solution:** Each damage type has different treatment approaches.

---

## 2. Damage Depth

**What it means:** How deep the damage penetrates through the paint layers.

| Value | Description | Visual Indicators | Treatment Approach |
|-------|-------------|-------------------|-------------------|
| surface | Marks in clear coat only | Can barely feel with fingernail, no color change | Polish/compound only |
| throughClear | Penetrates clear coat into base coat | Different color visible, feels rough | Spot repair with base coat |
| toPrimer | Reaches primer layer | Gray/white showing | Full primer + base + clear |
| toMetal | Exposed bare metal | Shiny metal or rust visible | Rust treatment (if applicable) + full repaint |

**Critical Variable:** This is THE most important factor determining the entire repair approach.

---

## 3. Material Type

**What it means:** What the damaged surface is made of.

| Value | Common Locations | Special Considerations |
|-------|-----------------|------------------------|
| metal | Door, fender, hood, trunk, roof, quarter panel | Can rust; requires metal-specific primer |
| plastic | Bumper, mirror housing, trim, molding | Cannot rust; requires adhesion promoter |
| fiberglass | Sports car body panels, aftermarket parts | Special flexible primer needed |
| mixed | Area spanning multiple materials | Multiple primers required |

**Impact:** Determines primer type and whether rust is even possible.

---

## 4. Color Type

**What it means:** The paint finish type.

| Value | Visual Characteristic | Repair Complexity |
|-------|----------------------|-------------------|
| solid | Flat color, no sparkle | Easiest to blend |
| metallic | Visible sparkle/flakes in paint | Moderate - flake orientation matters |
| pearl | Color shifts at different angles | Difficult - requires skilled blending |
| tricoat | Three-layer system with tinted clear | Most difficult - multiple stages |

**Impact:** Affects product selection and technique recommendations.

---

## 5. Size

**What it means:** Physical extent of the damaged area.

| Value | Approximate Size | Product Quantity Impact |
|-------|-----------------|------------------------|
| tiny | < 1cm | Touch-up pen may suffice; minimal products |
| small | 1-5cm | Standard quantities; spot repair |
| medium | 5-15cm | Standard quantities; larger blend area |
| large | 15cm+ or full panel | Multiple cans; may need professional |

**Impact:** Affects quantities recommended and whether DIY is advisable.

---

## 6. Rust Presence

**What it means:** Whether corrosion has started.

| Value | Visual Indicator | Additional Steps Required |
|-------|-----------------|---------------------------|
| true | Orange/brown discoloration | Rust removal, rust converter, rust-inhibiting primer |
| false | Clean metal or paint only | None |

**Impact:** Adds significant steps and products to the repair plan. Changes difficulty rating.

**Note:** Only relevant for metal surfaces. Plastic/fiberglass cannot rust.

---

## 7. Equipment Available

**What it means:** What painting tools the user has access to.

| Value | Description | Product Recommendations |
|-------|-------------|------------------------|
| aerosol | No equipment; will use spray cans | Aerosol primers, base coats, clear coats |
| sprayGun | Has HVLP gun and compressor | Can recommend 2K products in mixing cans |
| none | No equipment, hasn't decided | Default to aerosol recommendations |

**Impact:** Affects product format recommendations and technique guidance.

---

## 8. Supplementary Information

### Color Description
User's description of their car color (e.g., "silver", "blue", "black").
- Helps suggest pre-mixed colors
- Silver often implies metallic type

### Color Code
Manufacturer's paint code (e.g., "LY7W", "040").
- Enables exact color matching
- Located on door jamb sticker

### Location
Where on the vehicle the damage is (e.g., "door", "bumper", "hood").
- Can infer material type from location
- Helps contextualize difficulty

### Vehicle Info
Make, model, year.
- Useful for color code lookup
- Can help identify common issues

---

## Information Priority Matrix

| Dimension | Priority | Can Default? | Default Value |
|-----------|----------|--------------|---------------|
| Damage Depth | Critical | No | - |
| Material | Critical* | No | - |
| Damage Type | Important | If evident from context | scratch |
| Color Type | Important | Yes | metallic |
| Rust Presence | Important | Yes | false |
| Size | Important | Yes | medium |
| Equipment | Optional | Yes | aerosol |
| Color Description | Optional | Yes | (custom match) |
| Color Code | Optional | Yes | (custom match) |
| Location | Optional | Yes | (unspecified) |
| Vehicle Info | Optional | Yes | (unspecified) |

*Material becomes optional if damage depth is surface-only (polish doesn't care about material).
