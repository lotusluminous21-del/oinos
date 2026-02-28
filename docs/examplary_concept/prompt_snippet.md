### 🎨 Architecture & UI/UX Styling Directives (STRICTLY ENFORCED)

**CRITICAL DIRECTIVE: TABULA RASA (BLANK SLATE)**
- **START COMPLETELY FROM SCRATCH.** You must absolutely ignore the current implementation of the screen in hand. Do not refactor existing code.
- Your objective is to architect anew, delivering a sophisticated, premium UI utilizing expert-level styling that reads as an award-winning, state-of-the-art interface.

**CORE VISUAL LANGUAGE & UI PATTERNS:**
*Apply these foundational principles universally, regardless of the screen's specific content or use case.*

1. **Shape Language & Form Architecture**
   - **Maximized Radii & "Pill" Geometry:** The defining structural anomaly is the complete rejection of sharp, orthogonal boxes for primary layout containers. Predominant interactive areas, navigation clusters, and primary wrappers MUST employ "pill" or stadium shapes (e.g., `rounded-full` or extremely high border-radii values). 
   - **Decoupled / Floating Surfaces:** UI components must detach from the viewport edges. Utilize generous outer margins to float interface clusters atop the canvas, rather than anchoring them flush against screen boundaries.

2. **Depth, Dimensionality, & Contrast Mapping**
   - **Extreme Dynamic Range:** Design with a high-contrast relationship between layers. Juxtapose stark, opaque foreground surfaces (often pure brights) against deeply saturated, highly complex, or dark macro-background environments.
   - **Z-Axis Hierarchy:** Establish distinct vertical depth. Top-level floating elements require expansive, diffused drop shadows (e.g., highly customized `shadow-xl` or `shadow-2xl` with low alpha) to separate them definitively from the backplate.
   - **Contextual Glassmorphism:** For secondary UI clusters overlaying the background, implement sophisticated glassmorphism. Use low-opacity fills paired with heavy backdrop blurs (e.g., `backdrop-blur-md`) and ultra-fine translucent borders (`border-white/10`) to maintain visual harmony and legibility without hard occlusion.

3. **Visual Balance, Proportion, & Space**
   - **High Negative-to-Positive Space Ratio:** Introduce sweeping negative/white space globally. Internal padding within containers (e.g., `px-8 py-4`) and interstitial spacing between distinct UI modules must be expansive. The interface must "breathe" heavily to enforce a premium, uncrowded feel.
   - **Aggressive Typographic Scale:** Implement a steep visual hierarchy through typography. Primary anchors should be massive and geometrically bold, optionally utilizing subtle, multi-stop pastel gradients as their fill. Micro-copy and secondary text must remain highly legible, low-contrast, and geometrically clean.

4. **Component System Integration (shadcn/ui)**
   - **Aggressive Override Protocol:** While strictly utilizing `shadcn/ui` primitives for structural accessibility and behavior, you MUST heavily override their default visual tokens. Do not accept default rectangular bounds; force the components to adhere to the aforementioned floating, pill-shaped aesthetic.
   - **Seamless Component Nesting:** Aggregate distinct micro-actions (icons, badges, micro-buttons) by embedding them organically *inside* the primary rounded containers, leveraging precise flex alignments and unified internal padding to create cohesive composite elements.

5. **Iconography & Micro-Aesthetics**
   - **Monoline Constraint:** Exclusively employ thin, minimalist stroke icons (e.g., `lucide-react`). The delicate weight of the icons balances the heavy, bold geometry of the layout.
   - **Flawless Optical Alignment:** Ensure perfect mathematical and optical centering of all semantic nodes (text, icons, badges) within their respective rounded surfaces.
