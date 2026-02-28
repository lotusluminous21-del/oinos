# Conversation Flow Logic

## Philosophy

The conversation is **not a wizard** with fixed steps. It's a natural dialogue where:
- Users can volunteer information freely
- System extracts what it can from any input
- Questions are asked only when necessary
- The goal is gathering sufficient information with minimum friction

---

## Input Processing Pipeline

### Step 1: Receive User Input

User input can be:
- **Text only:** Natural language description
- **Image only:** Photo of the damage
- **Text + Image:** Both together
- **Question response:** Selection from presented options

### Step 2: Text Parsing

For any text input, extract information by pattern matching:

```
Input: "I scratched my silver car on the door, it goes down to the metal"

Extracted:
- Damage Type: scratch (from "scratched")
- Color Description: silver
- Color Type: metallic (inferred from "silver")
- Location: door
- Material: metal (inferred from "door")
- Damage Depth: toMetal (from "down to the metal")
```

### Step 3: Image Analysis

For image input, analyze for:
- Damage type (scratch, chip, rust, etc.)
- Damage depth (based on visible layers)
- Rust presence (orange/brown coloration)
- Material type (texture and location clues)
- Size estimate (based on surrounding features)
- Color information (if visible)

Each extraction includes a confidence score.

### Step 4: Update Knowledge State

- Merge new information into current state
- Confirmed facts from explicit statements
- Inferred facts from parsed/analyzed content
- Recalculate gaps

### Step 5: Generate Response

Based on updated state, choose response type:

| State Condition | Response Type |
|-----------------|---------------|
| No critical gaps remaining | Solution-ready message + generate solution |
| Critical gaps exist | Ask question for most important gap |
| Just received image | Summarize what was seen in image |
| Initial/vague input | Prompt for more details |

---

## Question Presentation

When the system needs specific information:

### Question Format
- Clear, conversational question text
- Optional help text explaining why it matters
- **Tap-to-select options** (not text input) when possible
- Icon + label + description for each option

### Question Priority Order
1. **Damage Depth** - Most critical for determining approach
2. **Material** - Second most critical (unless depth is surface-only)
3. **Color Type** - Important for paint selection
4. **Rust Presence** - Important if metal and not surface damage
5. **Size** - Affects quantities
6. **Equipment** - Usually can default to aerosol

### Contextual Question Skipping

| Condition | Questions to Skip |
|-----------|------------------|
| Damage depth = surface | Material, color type, rust |
| Material = plastic | Rust presence |
| Already confirmed | Don't ask again |
| High-confidence inference | Don't ask (but allow correction) |

---

## Understanding Display

After processing input, show user what the system understood:

### Understanding Card Contents

**Confirmed items:** Display with solid styling
```
✓ Damage Type: Scratch
✓ Damage Depth: Down to bare metal
✓ Location: Door
```

**Inferred items:** Display with indicator that it's an interpretation
```
~ Surface: Metal panel (from location)
~ Color: Metallic (from "silver")
```

**User correction:** Each item is tappable to change

---

## Conversation Examples

### Example 1: Rich Initial Input + Photo

```
User: "Someone keyed my car, scratched right through to the metal. 
       Here's a photo. [attaches image]"

System: [Analyzes image]
         "I can see that's a nasty scratch with some rust starting to form. 
          The damage goes down to bare metal, and it looks like it's on a 
          metal panel - probably about 10cm long."
         
         [Shows understanding card]
         ✓ Damage: Scratch
         ✓ Depth: Down to metal  
         ✓ Rust: Yes (from image)
         ~ Material: Metal (from photo)
         ~ Size: Medium
         
         "I have enough to create your repair plan! One question though:"
         
         [Shows question card]
         "What type of color is your car?"
         • Solid/Flat - no sparkle
         • Metallic - has sparkle
         • Pearl - color shifts at angles

User: [Taps "Metallic"]

System: "Perfect! Creating your repair plan..."
         [Generates and displays solution]
```

### Example 2: Minimal Input, Needs Questions

```
User: "I need to fix my bumper"

System: "I'd be happy to help with your bumper! 
         Can you tell me more about the damage?
         Or share a photo and I'll take a look."

User: "There's a big scratch"

System: [Shows understanding card]
         ✓ Damage: Scratch
         ~ Material: Plastic (bumpers are usually plastic)
         
         "Scratches on bumpers are very common. Let me ask:"
         
         [Shows question card]
         "How deep is the scratch?"
         • Surface marks only
         • Through the clear coat (different color showing)
         • Down to bare plastic (raw plastic visible)

User: [Taps "Through the clear coat"]

System: "Got it! One more thing:"
         
         [Shows question card]
         "How big is the damaged area?"
         • Tiny (< 1cm)
         • Small (1-5cm)
         • Medium (5-15cm)
         • Large (15cm+)

User: [Taps "Large"]

System: "I have everything I need! Creating your repair plan..."
         [Generates solution]
```

### Example 3: Surface Damage (Simple Path)

```
User: "My car has some light scratches, you can barely feel them"

System: [Shows understanding card]
         ✓ Damage: Scratches
         ✓ Depth: Surface marks only
         
         "Good news! If you can barely feel them, these are likely just 
          clear coat scratches. These are the easiest to fix - you just 
          need to polish them out."
          
         "Creating your repair plan..."
         [Generates simplified polish-only solution]
```

---

## Edge Cases

### User Changes Mind
If user corrects previously confirmed information:
- Update knowledge state
- Recalculate gaps
- If solution was generated, regenerate it

### Conflicting Information
If new input contradicts existing state:
- Prefer more recent information
- Explicitly confirmed > inferred
- High confidence > low confidence

### Unanswerable Question
If user doesn't know answer to question:
- Offer to skip with default value
- Explain implications of defaulting
