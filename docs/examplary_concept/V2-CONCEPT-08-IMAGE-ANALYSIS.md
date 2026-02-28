# Image Analysis Capabilities

## Overview

The system can accept images (photos of damage) as input. Image analysis extracts information that would otherwise require user description, reducing friction and improving accuracy.

---

## What Image Analysis Detects

### 1. Damage Type
**What it looks for:**
- Linear marks → Scratch
- Circular/irregular spots → Chip or rust
- Flaking layers → Peel
- Color changes → Fade

**Confidence factors:**
- Clear, well-lit photos → Higher confidence
- Blurry or dark photos → Lower confidence

### 2. Damage Depth
**Visual indicators:**
- Surface reflection present → Surface damage
- Different color visible beneath → Through clear coat
- Gray/white showing → To primer
- Shiny or rusty metal visible → To metal

**Challenge:** Depth assessment from photos is inherently limited compared to physical inspection.

### 3. Rust Presence
**What it looks for:**
- Orange/brown coloration
- Rough, pitted texture
- Location relative to damage center

**Confidence factors:**
- Distinct rust color → High confidence
- Ambiguous brown tones → Lower confidence

### 4. Material Type
**Visual indicators:**
- Location context (bumper = plastic, door = metal)
- Surface texture
- Surrounding features

**Note:** Material is often easier to determine from location than from visual analysis.

### 5. Size Estimate
**Approach:**
- Reference objects in frame (hands, coins, panel edges)
- Proportion relative to visible area

**Accuracy:** Approximate only; user confirmation preferred for quantities.

### 6. Color Information
**What it extracts:**
- General color family (silver, white, black, blue, etc.)
- Finish type indicators (sparkle = metallic, shifts = pearl)

**Limitations:**
- Lighting affects color perception
- Camera white balance can distort
- Cannot determine paint code from image

---

## Analysis Output Format

Each detected attribute includes:

| Field | Description |
|-------|-------------|
| value | The detected value |
| confidence | 0-1 score indicating certainty |

**Example:**
```
damageType: { value: "scratch", confidence: 0.92 }
damageDepth: { value: "toMetal", confidence: 0.78 }
rustPresent: { value: true, confidence: 0.95 }
material: { value: "metal", confidence: 0.85 }
sizeEstimate: { value: "medium", confidence: 0.70 }
```

---

## Integration with Conversation

### Image Received Flow

1. User uploads image (with or without accompanying text)
2. System analyzes image
3. System generates natural language summary of findings
4. Findings update Knowledge State as inferences (with confidence)
5. High-confidence findings (≥0.8) may be promoted to confirmed
6. System proceeds with normal response generation

### Summary Message Examples

**Rust scenario:**
> "I can see a scratch with rust developing. The damage appears to go down to bare metal, and there's some surface rust starting to form. It looks like it's on a metal panel."

**Fresh scratch:**
> "I see a scratch that's gone through the clear coat. No rust visible yet - looks like fresh damage. The color appears to be metallic."

**Stone chip:**
> "This looks like a stone chip on what appears to be a plastic bumper. It's gone through to the primer layer. No rust, as expected for plastic."

---

## Confidence Handling

### High Confidence Findings (≥0.8)
- Treated as reliable
- Included in Understanding Card
- May reduce need for questions
- Example: Rust clearly visible (0.95) → Don't ask about rust

### Medium Confidence (0.5-0.8)
- Mentioned tentatively
- User correction welcomed
- May still ask for confirmation
- Example: "It looks like metal, but I wanted to confirm..."

### Low Confidence (<0.5)
- Not relied upon
- System asks for clarification
- Example: Unclear photo → "I had trouble seeing the details. Can you describe...?"

---

## Photo Quality Handling

### Good Photo Characteristics
- Clear focus on damage
- Adequate lighting
- Damage fills reasonable portion of frame
- No heavy shadows

### Poor Photo Recovery
If image quality is insufficient:
- Acknowledge the image was received
- Express difficulty seeing details
- Ask for better photo OR description
- Don't make guesses from unclear images

**Example response:**
> "Thanks for the photo! It's a bit difficult to see the details - the lighting makes it hard to assess how deep the damage goes. Could you either share another photo with better lighting, or describe what you see?"

---

## Technical Considerations

### Image Format Support
- JPEG
- PNG
- HEIF/HEIC (modern phone cameras)

### Image Size Handling
- Accept large images from phones
- Resize/compress for processing
- Display thumbnails in conversation

### Privacy
- Images processed for damage analysis only
- Not stored beyond session
- No vehicle identification attempted
- License plates/identifying features ignored
