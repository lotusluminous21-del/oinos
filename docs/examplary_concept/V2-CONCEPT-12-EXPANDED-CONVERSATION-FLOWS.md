# Expanded Conversation Flows

## Overview

This document provides conversation flow examples for each project type, demonstrating how the system adapts its questions and responses.

---

## Flow 1: New Parts Painting

### Example: Unpainted Bumper

```
User: "I just bought a new rear bumper for my Audi A4 and need to paint it"

System: [Detects: new_parts project type, part: bumper]
         
         "I can help you paint your new bumper! Let me understand what you're working with."
         
         [Understanding Card]
         ✓ Project: Paint new part
         ✓ Part: Rear bumper
         ~ Material: Plastic (bumpers are typically plastic)
         ~ Vehicle: Audi A4
         
         [Question]
         "Is the bumper already primed (gray coating) or completely bare plastic (black/unpainted)?"
         • Pre-primed (gray coating)
         • Bare plastic (black/unpainted)

User: [Selects "Bare plastic"]

System: "Thanks! Bare plastic needs an adhesion promoter before primer—that's the secret to paint that won't peel."

         [Question]
         "Do you have your paint code? It's usually on a sticker in the door jamb."
         • Yes, I have the code
         • No / I'll look it up
         • Help me find it

User: "It's LY9B - Brilliant Black"

System: "Brilliant Black is a solid color—nice choice, and one of the easier ones to work with!"

         [Understanding Card]
         ✓ Part: Rear bumper (bare plastic)
         ✓ Color: Brilliant Black (LY9B)
         ✓ Color type: Solid
         
         "I have everything I need. Creating your painting guide..."
         
         [Generates Solution: "New Bumper Painting - Brilliant Black"]
         
         Steps:
         1. Clean & Degrease - Remove mold release agents
         2. Light Sanding - Scuff with 400-grit for adhesion
         3. Adhesion Promoter - Essential for paint to stick to plastic
         4. Primer - Apply plastic-compatible primer
         5. Base Coat - Apply Brilliant Black in thin coats
         6. Clear Coat - 2-3 coats for protection and gloss
         7. Final Polish - After curing
         
         Products: Plastic cleaner, 400-grit sandpaper, adhesion promoter,
                   flexible primer, black base coat, 2K clear coat,
                   cutting compound, polishing compound
```

---

## Flow 2: Protection / Ceramic Coating

### Example: Ceramic Coating Application

```
User: "I want to ceramic coat my car"

System: [Detects: protection project type, subtype: ceramic_coating]
         
         "Ceramic coating is a great choice for long-lasting protection! The key to a good ceramic coat is proper paint preparation."
         
         [Question]
         "How would you describe your paint's current condition?"
         • Excellent - no visible scratches or swirls
         • Good - some light swirl marks visible in sun
         • Fair - visible scratches and swirl marks
         • Poor - heavy oxidation or damage

User: [Selects "Good - some light swirl marks"]

System: "Light swirl marks are common—we'll correct those before coating so you're sealing in a perfect finish, not imperfections."

         [Question]
         "Will you be using a machine polisher or doing this by hand?"
         • Machine polisher (dual-action)
         • By hand
         • I don't have one yet

User: [Selects "Machine polisher"]

System: "With a DA polisher, you'll get professional results. Here's your ceramic coating prep and application guide!"

         [Generates Solution: "Ceramic Coating with Paint Correction"]
         
         Steps:
         1. Thorough Wash - Remove all dirt and contaminants
         2. Decontamination - Clay bar to remove bonded particles
         3. Paint Correction - Machine polish to remove swirls
         4. IPA Wipe - Remove all polishing oils
         5. Ceramic Coating Application - Panel by panel
         6. Curing - 24-48 hours protected from moisture
         
         Products: pH-neutral wash, clay bar kit, cutting compound,
                   polishing compound, IPA prep spray, ceramic coating,
                   applicators, microfiber towels
         
         Estimated time: 4-6 hours (plus 48hr cure)
         Difficulty: Intermediate
```

---

## Flow 3: Restoration

### Example: Faded Panel Restoration

```
User: "The hood on my truck is really faded and oxidized, rest of the truck looks fine"

System: [Detects: restoration OR protection, needs clarification]
         
         "Faded hoods are common, especially on horizontal panels that get more sun. Let me help figure out the best approach."
         
         [Question]
         "Can you describe the oxidation? This helps me know if we can restore it or need to repaint."
         • Dull/chalky but smooth (no peeling)
         • Rough texture, clear coat peeling
         • Paint flaking off, primer or metal showing

User: [Selects "Dull/chalky but smooth"]

System: "That's the best news! Chalky oxidation without peeling usually means we can restore the paint with compounding and polishing—no repainting needed."

         [Understanding Card]
         ✓ Project: Paint restoration
         ✓ Area: Hood (single panel)
         ✓ Condition: Oxidized, no clear coat failure
         
         "Creating your restoration guide..."
         
         [Generates Solution: "Oxidized Paint Restoration"]
         
         Steps:
         1. Wash - Remove loose oxidation and dirt
         2. Clay Bar - Remove bonded contaminants
         3. Cutting Compound - Remove oxidation layer
         4. Polishing Compound - Restore gloss
         5. Sealant or Wax - Protect the restored finish
         
         Products: Degreaser, clay bar kit, cutting compound,
                   polishing compound, paint sealant, applicators
         
         Estimated time: 2-3 hours
         Difficulty: Beginner-Intermediate
         
         ⚠️ Pro Tip: If compounding doesn't restore the shine, 
            the clear coat may be too far gone and repainting 
            would be the next step.
```

---

## Flow 4: Custom Effects

### Example: Color Change to Metallic

```
User: "I want to paint my motorcycle tank a custom metallic blue"

System: [Detects: custom project type, surface: exterior metal]
         
         "A metallic blue tank—that'll look amazing! Metallic paints have that beautiful sparkle but need careful technique for an even finish."
         
         [Understanding Card]
         ✓ Project: Custom paint
         ✓ Part: Motorcycle tank
         ~ Material: Metal
         ✓ Desired effect: Metallic blue
         
         [Question]
         "What's the current condition of the tank?"
         • Currently painted, in good condition
         • Currently painted, with damage/rust
         • Bare metal (new or stripped)

User: [Selects "Currently painted, in good condition"]

System: "We can sand and paint over the existing finish. Do you have spray equipment, or will you be using aerosol cans?"
         • Spray gun setup
         • Aerosol cans

User: [Selects "Spray gun setup"]

System: "With spray equipment, you'll get the best metallic finish. Creating your custom paint guide..."

         [Generates Solution: "Custom Metallic Blue - Motorcycle Tank"]
         
         Steps:
         1. Preparation - Sand existing paint with 400-grit
         2. Clean - Degrease thoroughly
         3. Primer - Sealer coat for uniform base
         4. Metallic Base Coat - Apply even, consistent passes
         5. Clear Coat - Multiple coats for depth
         6. Wet Sand & Polish - For show-quality finish
         
         Products: Sandpaper (400, 600 grit), degreaser, primer sealer,
                   metallic blue base coat, 2K clear coat,
                   wet sandpaper (1500, 2000 grit), cutting compound,
                   polishing compound
         
         ⚠️ Metallic Paint Tips:
         • Keep spray distance consistent (6-8 inches)
         • Use medium-wet coats—too dry causes mottling
         • Overlap 50% on each pass
         • Don't touch up wet areas—it shows in metallics
```

---

## Flow 5: Mixed Intent

### Example: New Part + Protection

```
User: "Bought a new fender, need to paint it AND I want to ceramic coat my whole car after"

System: [Detects: Multiple intents - new_parts + protection]
         
         "I can help with both! Let's tackle the fender painting first, then the ceramic coating—we'll actually want to ceramic coat AFTER the fender is installed and cured anyway."
         
         [Understanding Card]
         Project 1: Paint new fender
         Project 2: Ceramic coat entire vehicle
         
         "Let's start with the fender. Is it metal or plastic?"

         [Proceeds with new parts flow...]
         
         [...After fender solution generated...]
         
         "Here's your fender painting guide. Once that's done and cured (allow 30 days before ceramic coating new paint), we can move to the ceramic coating."
         
         [Option to view ceramic coating guide]
```

---

## Clarification Flow

### When Project Type is Ambiguous

```
User: "I need to do something about the paint on my car"

System: "I'm here to help! To point you in the right direction, what's the situation?"
         
         [Question]
         "What brings you here today?"
         • Fix damage (scratch, chip, rust)
         • Paint a new/replacement part
         • Restore faded or oxidized paint  
         • Protect my paint (wax, ceramic, etc.)
         • Custom color or special effects
         • Something else [text input]

User: [Selects option or types]

System: [Proceeds with appropriate flow]
```

---

## Initial Message Variations

### By Detected Project Type

**Damage Repair:**
> "I see you've got some paint damage to deal with. Let's figure out exactly what's needed to fix it."

**New Parts:**
> "Painting a new part is one of the most satisfying DIY jobs—let's make sure it matches perfectly."

**Restoration:**
> "Bringing faded paint back to life—or going for a full respray—let's plan this out."

**Protection:**
> "Smart thinking! Protecting your paint now saves you from repairs later."

**Custom:**
> "Custom paint is where you can really make your vehicle yours. Let's create something special."
