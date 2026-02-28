# Solution Generation System

## Overview

When sufficient information is gathered, the system generates a personalized repair plan. This is the "output" of the expert consultation—a comprehensive guide with exact product recommendations.

---

## Solution Structure

### Summary Section

| Field | Description | Example |
|-------|-------------|--------|
| Title | Descriptive name for the repair | "Metallic Silver Rust Repair" |
| Estimated Time | Total time investment | "2-4 hours + 24hr cure time" |
| Difficulty | Skill level required | Beginner / Intermediate / Advanced |
| Price Range | Min-max total cost | "€45 - €55" |
| Based On | Key inputs that shaped the solution | Material, depth, color type, rust |
| Assumptions | Any defaults used | "Using aerosol spray cans" |

### Step-by-Step Guide

Each step contains:
- **Step number and title**
- **Description:** What to do and why
- **Pro tips:** Expert advice for better results
- **Warnings:** Important safety or quality notes (when applicable)
- **Duration:** Estimated time for this step
- **Products:** Items needed for this step, with quantities

---

## Solution Paths

The system generates different repair paths based on damage depth:

### Path 1: Surface Damage Only

Simplest repair—no paint required.

**Steps:**
1. Clean & Assess - Evaluate true extent of damage
2. Polish Out Scratches - Use cutting and polishing compound

**Products:** Degreaser, scratch remover kit

**Difficulty:** Beginner

### Path 2: Clear Coat Damage (No Metal Exposed)

Spot repair with paint application.

**Steps:**
1. Preparation - Clean and degrease
2. Sanding - Smooth surface and feather edges
3. Masking - Protect surrounding areas
4. Prime - Apply appropriate primer
5. Base Coat - Apply color coats
6. Clear Coat - Protective finish
7. Polish - Final refinement

**Products:** Full range depending on material and color

**Difficulty:** Intermediate

### Path 3: Metal-Exposed Damage (No Rust)

Full repair from bare metal.

**Steps:** Same as Path 2, with emphasis on metal primer

**Difficulty:** Intermediate

### Path 4: Rust Damage

Most complex—requires rust treatment.

**Steps:**
1. Preparation - Clean and degrease
2. **Rust Treatment** - Remove loose rust, apply converter
3. Sanding - After rust cure (24 hours)
4. Masking
5. **Rust-Inhibiting Primer** - Prevent recurrence
6. Filler Primer - Build surface
7. Base Coat
8. Clear Coat
9. Polish

**Products:** Everything from Path 2 + rust converter + rust-inhibiting primer

**Difficulty:** Intermediate to Advanced

---

## Product Selection Logic

### Primer Selection

| Material | Damage Depth | Rust? | Primer Product |
|----------|--------------|-------|----------------|
| Metal | To primer/metal | No | 2K Metal Primer |
| Metal | Any | Yes | Rust Inhibitor + Metal Primer |
| Plastic | Any | N/A | Adhesion Promoter + Universal Primer |
| Any | Through clear | N/A | Universal Primer Filler |

### Base Coat Selection

Based on color information:
- If color description includes "silver"/"gray" → Silver Metallic
- If color description includes "white" → Solid White
- If color description includes "black" → Solid Black
- Otherwise → Custom Color (mixable)

Quantity adjustment:
- Tiny/Small: 1 can
- Medium: 1 can
- Large: 2 cans

### Clear Coat Selection

Default to 2K clear coat for durability. Same quantity logic as base coat.

### Finishing Products

Always included for full repairs:
- Cutting compound (for leveling orange peel)
- Polishing compound (for final gloss)

Optional (for best results):
- Wet sandpaper 1500 + 2000 grit

---

## Difficulty Rating

| Base Level | Modifiers |
|------------|----------|
| Beginner | Surface scratches only |
| Intermediate | Standard clear/base/primer repair |
| +Intermediate | Plastic surfaces (requires adhesion promoter technique) |
| +Intermediate | Rust present (additional steps) |
| Advanced | Pearl or tricoat colors (difficult blending) |
| Advanced | Rust + deep damage combination |

---

## Time Estimation

| Component | Time |
|-----------|------|
| Surface polish only | 30-45 mins |
| Standard spot repair | 2-4 hours |
| + Rust treatment | + 30 mins + 24hr cure |
| + Large area | + 1-2 hours |
| Final curing (before wet sand) | 24-48 hours |

---

## Price Calculation

1. Sum all product prices × quantities
2. Apply ±10% range for price display
3. Essential vs optional product distinction

**Essential products:** Added to cart with "Add All" button

**Optional products:** Can be added individually for best results

---

## Solution Presentation

### Summary Card
- Title with emoji indicator
- Time, difficulty, price at a glance
- Tags showing key inputs (material, rust status, etc.)
- Any assumptions made

### Expandable Steps
- Accordion-style step sections
- First step expanded by default
- Each step shows:
  - Numbered badge
  - Title
  - Duration (when collapsed)
  - Full content when expanded

### Product Cards Within Steps
- Product image
- Name and price
- Quantity needed
- Reason for inclusion
- Add to cart button (individual)
- Visual indicator if already in cart

### Call-to-Action
- "Add All Essential to Cart" prominent button
- Total products and price
- Note about essential vs optional distinction
