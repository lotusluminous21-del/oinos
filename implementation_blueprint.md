# Pavlicevits E-Shop & Agentic Expert System Implementation Blueprint

This document serves as the exhaustive, step-by-step implementation guide for porting the "new age e-commerce" prototype UX (`example_ui_ux`) into the production Pavlicevits application. It covers architecture translation, state management, AI engine integration, Shopify database tethering, and UI/UX replication using our stylized design system.

## 0. Philosophy Overview

The prototype showcases a paradigm shift from traditional "category browsing" to an **intent-driven, agentic expert system**. 

**Core Philosophies:**
1. **Smart Routing:** The hero search bar detects "Project Intent" vs. "Product Search." If a user asks "how to fix a scratch", it hijacks the traditional search flow, initializing an AI conversation (`/expert`).
2. **Knowledge State & Gap Filling:** The expert system does not rely on rigid conversation trees or pure free-form text generation. It operates on a **`KnowledgeState`** containing `confirmed` (explicit) and `inferred` (deduced with confidence) variables. 
3. **Dynamic Solution Generation:** Once all critical variables (damage depth, material, etc.) are fulfilled, the system generates a structured `Solution` made of `SolutionStep`s. 
4. **Actionable Outcomes:** Every step in the solution maps cleanly to essential and optional products, moving the user seamlessly from consultation to checkout. 

---

## Phase 1: Foundation & State Architecture

The heart of the application is the `Zustand` store and the TypeScript type definitions. We must bring these into our actual application first, setting the backbone for both the UI and the AI.

### 1.1 Core Type Definitions
- Port `lib/types.ts` into our project (e.g., `src/types/expert.ts`).
- Ensure we maintain:
  - `KnowledgeState` (Confirmed, Inferred, and Gaps).
  - Variable typings: `DamageType`, `DamageDepth`, `MaterialType`, `ColorType`.
  - Conversation Types: `Message`, `Question`, `QuestionOption`.
  - Solution Structure: `Solution`, `SolutionStep`, `SolutionProduct`.

### 1.2 The Gap Analysis Engine
- Port `lib/knowledge-state.ts`.
- Implement `updateGaps()`, which dictates dynamic questioning (e.g., if damage is surface-level, we don't care about the underlying material). This is crucial for avoiding unnecessary friction.

### 1.3 Unified Context Store
- Port `lib/store.ts` to our Zustand setup.
- Store logic must combine the conversation state (`sessionId`, `messages`, `knowledgeState`, `currentQuestion`, `solution`) with e-commerce state (`cart`, `addSolutionToCart`).
- **Dev Task:** Hook this store up with persistence middleware strictly for the `cart` and user preferences, but ensure `conversation` resets logically to avoid stale session contexts between visits.

---

## Phase 2: Agentic Engine & Real AI Infrastructure

The prototype uses regex and keyword matching (`DAMAGE_TYPE_KEYWORDS`) to infer intent. We will replace this with robust AI schema extraction using our designated AI infra.

### 2.1 Intent Routing (Hero Search)
- **Component:** Hero Smart Search.
- **Logic:** We need a lightweight edge function or an initial fast LLM classification prompt to determine `hasProjectIntent`. If true -> redirect to `/expert`. If false -> redirect to standard `/search`.

### 2.2 Text Parsing via LLM Structured Outputs
- **Replacement of `parseText`:** Instead of `regex`, write a prompt for an LLM (e.g., OpenAI `gpt-4o-mini` with JSON schemas) that receives the user input and outputs partial `KnowledgeState` updates.
  - *Schema Expected:* `{ updates: {...}, inferences: {...} }`
- **Confidence Scoring:** The LLM must output confidence scores for inferences, mimicking the prototype's logic.
- **Image Analysis Routing:** Connect `analyzeImage` to a Vision LLM to return `ImageAnalysisResult` structured JSON.

### 2.3 Conversational Response Generation
- Refactor `generateResponse` logic. Once the `KnowledgeState` gaps are evaluated:
  - If gaps exist, trigger the LLM to phrase the next `Question` organically, weaving in the currently understood context.
  - Maintain the structured fallback questions (`QUESTIONS` enum) for UI rendering (e.g., clickable option buttons to ensure structured data capture).

---

## Phase 3: Shopify Integration and Solution Mapping

The prototype's `solution-generator.ts` uses an in-memory `PRODUCT_CATALOG`. We must map this generation engine directly to Shopify's real catalog using the Storefront API or a synced database.

### 3.1 Shopify Metadata & Tagging Protocol
- To map products contextually to solutions, we must ensure Shopify products are tagged correctly or use Metafields.
- **Tags needed:** `primer`, `clear-coat`, `base-coat`, `plastic`, `rust-treatment`.
- **Dev Task:** Create a synchronization script or graphQL queries that fetch matching products dynamically during the `generateSolution` phase.

### 3.2 Dynamic Solution Generator Refactor
- Modify `generateSolution(state: KnowledgeState)` to be asynchronous. 
- Step-by-step logic:
  - Step 1 (Prep): Query Shopify for "Wax & Grease remover limit 1".
  - Step 2 (Rust): Query Shopify for "Rust Converter".
  - Step 3 (Color match): Query Shopify based on `state.colorDescription`.
- Convert the fetched Shopify nodes into `SolutionProduct` types.

---

## Phase 4: Complete Website Structure & UI Porting (Mobile-First)

The prototype illustrates a comprehensive e-commerce flow. We must port this entire structure, ensuring a **Mobile-First** paradigm that scales fluidly to desktop interfaces, utilizing our premium stylistic identity (dark modes, glassmorphism, dynamic Framer Motion animations).

### 4.1 Global Navigation & Layout
- **Mobile-First Strategy:** Implement the sticky `BottomNav` (`components/bottom-nav.tsx`) for primary mobile routing (Home, Categories, Expert, Cart, Account). Ensure active states and smooth transitions. On desktop, this bottom navigation should gracefully disappear or transform into a sophisticated sidebar/header layout.
- **Top Header:** Port `components/header.tsx`. Implement a responsive glassmorphism header that includes the logo, desktop navigation links, and utility icons (search, profile, cart, language).

### 4.2 Home Page (`app/page.tsx`)
- **Fluid Hero Section:** Replicate the dynamic, fluid background shapes and the high-contrast `PAVLICEVITS` typography.
- **Smart Search/Intent Bar:** The centerpiece of the hero section. Port the `ChatInput` style (camera/mic icons) into a functional router (Phase 2.1). Include the quick suggestion pills (`📍 Fix a scratch`, `✨ Get expert help`).
- **Trust Badges:** Implement the horizontally scrolling (mobile) or grid (desktop) trust badges (Authorized Partner, Secure payments, Fast Shipping, Expert Support).
- **Category Quick-Nav:** A responsive grid showing the 6 primary categories as interactive glass cards with icons and product counts.
- **Expert System CTA Block:** A dedicated gradient card explicitly calling out the AI agent ("Not sure what you need? Start Expert Guide").

### 4.3 Traditional E-Commerce Flows
- **Categories Architecture (`app/categories/*`):** 
  - *Main Categories Page:* Grid display of all categories with rich icons and descriptions.
  - *Category Detail / Product List:* Port `CategoryContent`. Includes horizontal sub-navigation for easy category switching and a responsive product grid (2 columns on mobile, 4+ on desktop).
- **Product Detail Page (`app/product/[slug]/*`):**
  - Implement the `ProductDetail` component. Needs full image galleries, "Expert Tips" highlights, "Add to Cart" interactions, related products, and specifically the "Compatible With" logic (crucial for linking base coats to clear coats).
- **Search Results (`app/search/*`):**
  - A comprehensive product listing view populated by standard (non-project-intent) text queries.
- **Cart & Account (`app/cart/*`, `app/account/*`):**
  - Port straightforward, user-friendly cart logic showing items sourced standardly vs. items sourced from the Expert Solution.

### 4.4 The Expert Consultation UI (`app/expert/page.tsx`)
- **Chat Interface Routing:** On mobile, ensure the UI utilizes full vertical space (`min-h-screen`), hiding the global footer if necessary to maximize the chat view.
- **Message Bubbles (`components/message-bubble.tsx`):** Port with premium styling (gradients, tailored radii). 
- **Interactive Question Cards (`components/question-card.tsx`):** The core interactive element answering the `KnowledgeState` gaps. Must be highly tactile with large, easily tappable option tiles on mobile.
- **State Visualization (`components/understanding-card.tsx`):** Visual readout giving user confidence that the agent is properly tracking the parameters.
- **Input Component (`components/chat-input.tsx`):** Preserve the complex state management of having text input alongside multimodal inputs (mic/camera).

### 4.5 The Final Solution Render (`app/solution/page.tsx`)
- When `status === 'complete'`, gracefully transition the user to the generated repair plan.
- **Step-by-step Accordion:** Implement expandable steps detailing time, description, pro-tips, and warnings.
- **Actionable Checkout:** Include the "Add All Essential Products to Cart" global action, alongside granular per-product add buttons inside each step.

---

## Execution Order

1. **Sprint 1 (Immediate):** Setup Data structures (`types.ts`, `store.ts`) and Gap Analysis (`knowledge-state.ts`) locally in the main app.
2. **Sprint 2:** Build the AI wrapper (`ai-engine.ts`) passing structured schema to an LLM instead of regex, including vision analysis.
3. **Sprint 3:** Build out the conversational UI (`/expert`, `ChatInput`, `MessageBubble`, `QuestionCard`) utilizing the store.
4. **Sprint 4:** Implement `solution-generator.ts` backed by actual Shopify GraphQL queries.
5. **Sprint 5:** Final Polish (Animations, Hero smart search integration, edge case handling).
