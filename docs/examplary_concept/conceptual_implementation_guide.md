PAVLICEVITS → Brownleaf Conceptual Implementation Guide
A blueprint for integrating the PAVLICEVITS prototype UI/UX with Brownleaf's Shopify + Firebase infrastructure.

Part 1: Understanding the Prototype
1.1 What This Prototype Represents
PAVLICEVITS is an AI-guided car care consultation and shopping experience. The core innovation is the Expert Flow — a conversational interface that gathers information about a user's paint damage problem and generates a personalized, step-by-step repair solution with recommended products.

The prototype uses:

Mock AI analysis (keyword parsing and random image scenarios)

Hardcoded product catalog in the solution generator

Local state management with Zustand (persisted to localStorage)

No real database queries for the AI flow

Your task is to replace the mock systems with real Shopify product data and Firebase-hosted AI logic while preserving the exact UI/UX patterns.

1.2 Core Concepts to Preserve
The Knowledge State
The heart of the consultation is the Knowledge State — a structured object that tracks:

Confirmed facts: Information explicitly stated by the user

Inferred facts: Information deduced from text/images with confidence levels

Gaps: Missing information categorized as critical, important, or optional

The AI flow continues asking questions until all critical gaps are filled. Only then can a solution be generated.

The Solution Structure
A solution contains:

A descriptive title summarizing the repair

Difficulty rating and time estimate

Ordered steps, each with instructions, tips, warnings, and product recommendations

Products marked as essential or optional with quantities

Total price calculation

The Skeuomorphic Design Language
The UI uses a tactile, neumorphic aesthetic:

Raised surfaces with complex shadow systems

Pill-shaped geometry (large border radius)

Light background with teal primary accents and pink AI accents

Inset input fields, raised buttons, pressed states

Smooth animations for all transitions

Part 2: Page-by-Page Blueprint
2.1 Home Page
Purpose: Welcome users, provide multiple entry points to the experience.

Must Contain:

Hero Section

Welcoming headline with brand personality

Subheadline explaining the AI expert concept

Decorative fluid background shapes (CSS-only, animated)

Smart Search Bar

Large, prominent input field with inset styling

Camera icon button (triggers image upload for AI)

Microphone icon button (placeholder for voice input)

Send button that appears when input has content

Quick suggestion chips below the input

Search Routing Logic

If input contains project-related keywords (scratch, dent, rust, damage, paint, fix, repair, etc.) → Route to Expert page

If input is product-focused → Route to Search results page

Image uploads always route to Expert page

Trust Badges

Three horizontal badges showing value propositions

Icon + short text format (e.g., "Expert AI Guidance", "Quality Products", "Easy Process")

Category Grid

Six category cards in a responsive grid

Each card shows icon, category name, product count

Cards are raised with hover/active press effects

Links to category listing pages

Featured Products Section

Horizontal scrolling row on mobile, grid on desktop

Product cards with image, name, price, add-to-cart button

Limited to 8 products maximum

Expert CTA Card

Prominent call-to-action to start AI consultation

Different visual treatment (perhaps gradient or accent color)

Clear button linking to Expert page

Navigation

Desktop: Fixed header with logo, nav links, cart icon with count badge

Mobile: Bottom navigation bar with Home, Browse, Cart (center, prominent), Account

2.2 Expert Page (AI Consultation)
Purpose: The core AI-guided consultation experience.

Must Contain:

Chat Message Area

Scrollable container for conversation history

Auto-scrolls to newest message

Two message types: user bubbles (right-aligned, primary color) and assistant bubbles (left-aligned, neutral)

Messages can contain text and/or images

Avatar icons distinguish speakers

Typing Indicator

Shown when AI is "processing"

Animated bouncing dots with assistant avatar

Appears in the message flow area

Question Cards

Appear after assistant messages when a question is pending

Display question text prominently

Support multiple input types:

Single-select: Grid of option buttons, user picks one

Multi-select: Grid of toggleable option buttons

Text input: Text area with submit button

Options can have icons and descriptions

"Not sure?" toggle reveals help text

Confirmed Facts Display

Collapsible/expandable section showing current knowledge state

Lists confirmed facts with checkmark icons

Lists inferred facts with confidence indicators

Visual distinction between high/medium/low confidence

Chat Input

Fixed at bottom of screen

Multi-line text input that expands

Image upload button with preview capability

Send button

Quick suggestion buttons when input is empty

Solution Ready State

When all critical information gathered, show completion indicator

Prominent button/link to view the generated solution

Brief summary of what was understood

Behavioral Flow:

User lands on page (possibly with pending query from home search)

If pending query exists, process it immediately

For each user input:

Add user message to chat

Show typing indicator

Parse text for keywords → update knowledge state

If image provided, analyze it → update knowledge state

Check if ready for solution

If not ready, generate next question based on most important gap

Add assistant response to chat

When ready, generate solution and enable navigation to solution page

2.3 Solution Page
Purpose: Display the personalized repair plan with products.

Must Contain:

Solution Header

Back navigation

Solution title (describes the repair)

Metadata row: difficulty badge, time estimate, product count

Step-by-Step Plan

Accordion-style expandable sections

Each step shows:

Step number and title

Expand/collapse indicator

When expanded:

Detailed instructions (can be multiple paragraphs)

Pro tips in a highlighted callout

Warnings in a different colored callout

Product list for this step

Products Per Step

Compact horizontal product cards

Show product image, name, price

"Essential" or "Optional" badge

Quantity indicator

Add to cart button

Order Summary

Fixed or sticky section at bottom

Shows total product count and total price

"Add All to Cart" button (adds all essential products)

Visual feedback on success

Assumptions Notice

If the AI made assumptions (used defaults for optional info), list them

Helps user understand the recommendation basis

2.4 Categories Page
Purpose: Browse all product categories.

Must Contain:

Page Header

Title "Shop by Category"

Back navigation on mobile

Category Grid

All categories displayed as cards

Each card: icon, name, product count

Raised card styling with press effects

Links to category product listing

2.5 Category Products Page
Purpose: View products within a specific category.

Must Contain:

Category Header

Category name as title

Back navigation

Category Chips

Horizontal scrolling row of all categories

Current category highlighted

Allows quick switching between categories

Sort Controls

Dropdown or buttons for sort options (Name A-Z, Price low-high, etc.)

Product Grid

Responsive grid of product cards

Standard product card format (image, name, price, add-to-cart)

Empty State

Message if category has no products

2.6 Product Detail Page
Purpose: Full product information and purchase actions.

Must Contain:

Product Image

Large hero image

Consider image gallery if multiple images available

Product Info

Name prominently displayed

Price with currency formatting

Category and brand as chips/badges

Full description text

Expert Tip

If product has expert tip, display in highlighted callout

Adds value and builds trust

Quantity Selector

Plus/minus buttons with current quantity

Neumorphic styling

Add to Cart Button

Primary action button

Shows feedback on success (toast notification)

Share Button

Uses native share API if available

Fallback to copy link

Compatible Products Section

If product has compatibility data, show related products

Horizontal scroll of compact product cards

Related Products Section

Other products from same category

Excludes current product and compatibles

2.7 Search Page
Purpose: Search results for product queries.

Must Contain:

Search Input

Pre-filled with query if coming from home

Allows refinement

Results Grid

Product cards matching search

Same format as category listing

Empty State

Friendly message when no results

Suggestions to try different terms or browse categories

2.8 Cart Page
Purpose: Review and manage shopping cart.

Must Contain:

Cart Items List

Each item shows: image, name, price, quantity controls, remove button

Items from AI solution can be tagged ("From your repair plan")

Animated removal for good UX

Quantity Controls

Inline plus/minus buttons

Updates total immediately

Order Summary

Subtotal calculation

Shipping calculation (free over threshold)

Total

Checkout Button

Prominent primary button

In prototype this is mocked; in production connects to Shopify checkout

Empty Cart State

Friendly message

CTAs to browse products or get expert help

2.9 Account Page
Purpose: User profile and account navigation.

Must Contain:

Profile Card

User avatar/icon

Name or "Guest User" state

Sign in/Sign up button for guests

Quick Stats

Cart item count

Active projects count (if solution exists)

Active Project Card

If user has a solution, show quick link to it

Solution title preview

Menu Items

Order History

Saved Products

My Projects

Settings

Help & Support

Each as a card/row with chevron indicator

Sign Out Button

For authenticated users

Part 3: Implementation Order
Phase 1: Foundation Setup
Step 1.1: Design System

Set up the color palette (background, primary teal, accent pink, text colors)

Implement the shadow system (raised, pressed, inset, card variants)

Create base typography scales

Establish spacing and border radius tokens

Step 1.2: Core UI Components

Primary Button (three variants: default, secondary, outline; three sizes)

Action Card (raised surface with hover/press states)

Product Card (three variants: standard, compact, horizontal)

Chip component (for filters and tags)

Input fields with inset styling

Step 1.3: Layout Components

Header (desktop navigation)

Bottom Navigation (mobile, with center cart button prominence)

Page container with proper safe area handling

Phase 2: Static Pages
Step 2.1: Categories Page

Fetch categories from Shopify

Render category grid with prototype styling

Verify navigation works

Step 2.2: Category Products Page

Fetch products by collection/category from Shopify

Implement category switching chips

Implement sort functionality

Step 2.3: Product Detail Page

Fetch single product from Shopify

Render all product information

Implement add-to-cart with Shopify cart API

Fetch and display compatible/related products

Step 2.4: Search Page

Implement Shopify product search

Render results with prototype styling

Phase 3: Cart Integration
Step 3.1: Cart State

Connect to Shopify cart (or use local state synced with Shopify)

Implement add, remove, update quantity operations

Calculate totals using Shopify's pricing

Step 3.2: Cart Page

Display cart items with full controls

Connect checkout button to Shopify checkout URL

Phase 4: Home Page
Step 4.1: Static Sections

Hero with decorative elements

Trust badges

Expert CTA card

Step 4.2: Dynamic Sections

Category grid (from Shopify collections)

Featured products (from Shopify, perhaps a specific collection or tag)

Step 4.3: Smart Search

Implement search bar with routing logic

Text parsing to detect intent (product search vs. expert consultation)

Quick suggestion chips

Phase 5: AI Consultation System
This is the most complex phase. Build incrementally.

Step 5.1: Knowledge State Management

Define TypeScript types for knowledge state structure

Implement state initialization

Implement gap tracking and update logic

Implement readiness check function

Step 5.2: Chat UI Components

Chat bubble component (user and assistant variants)

Typing indicator

Chat input with image upload

Question card with all input types

Confirmed facts display

Step 5.3: Text Parsing

Port keyword lists from prototype

Implement text parsing function that extracts damage type, depth, material, etc.

Test with various user inputs

Step 5.4: Image Analysis

Connect to Firebase function for image analysis

The function should use an AI model to analyze car damage images

Map AI response to knowledge state structure

Step 5.5: Question Generation

Define question bank (questions for each information gap)

Implement logic to select next question based on most important gap

Support different question types (single-select, multi-select, text)

Step 5.6: Response Generation

Combine parsed understanding into natural language summary

Generate appropriate response message

Determine if asking question or confirming understanding

Step 5.7: Expert Page Assembly

Wire up all components

Implement message flow

Handle pending queries from home page

Test full consultation flow

Phase 6: Solution Generation
Step 6.1: Solution Logic

Create Firebase function that takes knowledge state as input

Function queries Shopify for appropriate products

Function generates step-by-step plan based on damage profile

Returns structured solution object

Step 6.2: Product Matching

Define product tags/categories in Shopify that map to solution needs

Implement logic to select:

Rust treatment products (if rust present)

Primers (based on damage depth)

Base coats (based on color type)

Clear coats

Finishing products

Tools and supplies

Step 6.3: Solution Page

Render solution with accordion steps

Display products per step

Implement "Add All to Cart" functionality

Calculate and display totals

Phase 7: Account & Polish
Step 7.1: Account Page

Implement based on Brownleaf's auth system

Show relevant user data

Step 7.2: Persistence

Save consultation state (for returning users)

Save solutions to user profile

Step 7.3: Polish

Verify all animations are smooth

Test on various devices

Optimize loading states

Handle error cases gracefully

Part 4: Data Flow Architecture
4.1 Product Data Flow
Shopify (Source of Truth)
    ↓
Shopify Storefront API
    ↓
Next.js/React Pages
    ↓
UI Components
Products, categories, prices, inventory — all come from Shopify. The frontend queries Shopify's Storefront API (or uses a Shopify SDK) to fetch this data.

4.2 Cart Data Flow
User Action (Add/Remove/Update)
    ↓
Local State Update (immediate UI feedback)
    ↓
Shopify Cart API (persist)
    ↓
Sync back to Local State
Optimistic updates provide snappy UX. Shopify is the source of truth for checkout.

4.3 AI Consultation Flow
User Input (Text/Image)
    ↓
Local Text Parsing (keywords)
    ↓
Firebase Function (if image, for AI analysis)
    ↓
Knowledge State Update (local)
    ↓
Question Generation (local logic)
    ↓
[Repeat until ready]
    ↓
Firebase Function (solution generation with Shopify product query)
    ↓
Solution Display
Text parsing can run locally for speed. Image analysis requires server-side AI. Solution generation needs to query real products, so it runs server-side.

4.4 State Management
Use a client-side state manager (Zustand recommended, but Context works too) for:

Current conversation messages

Knowledge state

Current question

Generated solution

Consultation status

Persist critical data (session ID, cart) to localStorage for returning users.

Part 5: Shopify Product Requirements
5.1 Product Metadata Needed
Ensure Shopify products have these metafields or tags:

Category: Which product category (primers, base coats, clear coats, etc.)

Expert Tip: A short tip for using the product (display on detail page and solution)

Compatible Products: Slugs/IDs of products that work well together

Use Cases: Tags indicating when to use (surface damage, deep scratch, rust repair, etc.)

Solution Tags: Tags that the solution generator uses to match products to needs (e.g., "rust-treatment", "primer-standard", "primer-deep", "color-solid", "color-metallic")

5.2 Collection Structure
Consider organizing Shopify collections to match categories:

Primers & Fillers

Base Coats

Clear Coats & Finishes

Tools & Equipment

Accessories

Kits & Bundles

Part 6: Firebase Function Specifications
6.1 Image Analysis Function
Input: Base64 encoded image or image URL

Process:

Send to AI vision model (GPT-4V, Claude, Gemini Vision)

Prompt to identify: damage type, severity/depth, surface condition, rust presence, approximate size

Output: Structured object with inferred values and confidence levels

6.2 Solution Generation Function
Input: Complete knowledge state object

Process:

Determine required product types based on damage profile

Query Shopify for matching products using tags/collections

Build step sequence based on repair requirements

Assign products to steps

Calculate totals

Output: Complete solution object matching the prototype structure

Part 7: Critical UX Patterns
7.1 The "Always Responsive" Principle
Never leave the user waiting without feedback:

Show typing indicator immediately on user input

Optimistic updates for cart actions

Skeleton loaders for data fetching

Smooth transitions between states

7.2 The "Progressive Disclosure" Pattern
Don't overwhelm users:

Solution steps are collapsed by default, expand on tap

Help text on questions is hidden until requested

Confirmed facts section is collapsible

Advanced options (like manual product search) are secondary

7.3 The "Clear Escape Routes" Pattern
Users should never feel trapped:

Back buttons on every sub-page

Bottom navigation always accessible on mobile

Can browse products without completing consultation

Cart accessible from anywhere

7.4 The "Celebration Moments" Pattern
Reward user progress:

Toast notifications on successful actions

Visual feedback when knowledge state updates

Satisfying animation when solution is ready

Clear success state after adding all products to cart

Part 8: Testing Checklist
Before Launch, Verify:
Home Page

[ ] Search routes correctly (expert vs. product search)

[ ] Categories load from Shopify

[ ] Featured products display correctly

[ ] All navigation links work

Expert Flow

[ ] Text parsing extracts keywords correctly

[ ] Image upload works and triggers analysis

[ ] Questions appear based on gaps

[ ] Answering questions updates knowledge state

[ ] Solution generates when ready

[ ] Can navigate to solution from expert page

Solution Page

[ ] All steps display correctly

[ ] Products load from Shopify with real prices

[ ] Individual add-to-cart works

[ ] Add all to cart works

[ ] Totals calculate correctly

Product Pages

[ ] Product detail loads fully

[ ] Add to cart works

[ ] Compatible products display

[ ] Related products display

Cart

[ ] Items display with correct data

[ ] Quantity updates work

[ ] Remove works with animation

[ ] Totals update correctly

[ ] Checkout redirects to Shopify

Mobile Experience

[ ] Bottom navigation works correctly

[ ] Cart badge updates

[ ] Solution indicator appears when appropriate

[ ] All touch targets are adequate size

[ ] Safe area padding works on notched devices

Conclusion
This guide provides the conceptual foundation for integrating the PAVLICEVITS prototype with Brownleaf's infrastructure. The key is to:

Preserve the UX patterns — the consultation flow, the skeuomorphic aesthetics, the responsive interactions

Replace mock data with real data — Shopify products, Firebase AI analysis

Build incrementally — start with static pages, then cart, then the complex AI flow

Test thoroughly — especially the AI consultation flow edge cases

The prototype code provides exact implementations for UI components and local logic. Use it as a reference for styling, animations, and user interaction patterns. The business logic (AI analysis, solution generation, product matching) needs to be rebuilt with real Shopify data and Firebase functions.

Good luck with the implementation!