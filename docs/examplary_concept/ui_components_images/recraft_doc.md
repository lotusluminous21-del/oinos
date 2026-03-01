This image shows our vibrant, minimal and clean UI style. We need to get inspiration from it (BUT NOT USE THE FLUID SIMULATION - THE FLUID SIMULATION IS JUST A FEATURE OF THE HERO SECTION, although it clearly defines the accent colors and contrast qualities that we should use). The following doc describes all screens that we need to generate images for: [# V2 App Screens & Navigation Specification

**Document ID:** V2-SCREENS-NAV  
**Version:** 1.0  
**Date:** February 2026

---

## Table of Contents

1. [Navigation Architecture](#navigation-architecture)
2. [Screen Inventory](#screen-inventory)
3. [Detailed Screen Specifications](#detailed-screen-specifications)
4. [Navigation Flows](#navigation-flows)
5. [Persistent UI Elements](#persistent-ui-elements)

---

## Navigation Architecture

### Route Tree

```
/                           → Home Screen
│
├── /expert                 → AI Expert Consultation
│   └── (inline states)     → Gathering → Analyzing → Solution Ready
│
├── /solution               → Solution Display (full page)
│
├── /categories             → All Categories Grid
│   └── /categories/[slug]  → Category Product Listing
│       └── e.g. /categories/primers
│       └── e.g. /categories/clear-coats
│
├── /product/[slug]         → Product Detail Page
│   └── e.g. /product/adhesion-promoter
│   └── e.g. /product/2k-clear-coat
│
├── /search                 → Search Results
│   └── ?q={query}          → With search query
│
├── /cart                   → Shopping Cart
│
├── /account                → User Account
│   ├── /account/orders     → Order History (future)
│   ├── /account/saved      → Saved Products (future)
│   ├── /account/projects   → My Projects (future)
│   └── /account/settings   → Settings (future)
│
└── /checkout               → Checkout Flow (future, likely Shopify)
```

### Primary Navigation Paradigm

**Mobile (< 768px):**
- Fixed bottom navigation bar with 4 tabs
- Floating action indicators (active solution, active project)
- Back navigation via header chevron on detail pages

**Desktop (≥ 768px):**
- Fixed top header with horizontal navigation
- Breadcrumb navigation on category/product pages
- Same floating indicators as mobile

### Navigation Entry Points

| From | To | Trigger |
|------|----|---------|
| Any screen | Home | Bottom nav "Home" / Header logo |
| Any screen | Expert | Bottom nav "Expert" / Header "Expert Guide" / Home CTA |
| Any screen | Categories | Bottom nav "Browse" / Header "Products" |
| Any screen | Cart | Bottom nav "Cart" / Header cart icon |
| Any screen | Account | Bottom nav "Account" / Header account icon |
| Any screen | Search | Header search icon / Search bar submission |
| Any screen | Solution | Floating solution indicator (when available) |

---

## Screen Inventory

| # | Screen Name | Route | Purpose | Priority |
|---|-------------|-------|---------|----------|
| 1 | Home | `/` | Landing, discovery, expert entry point | P0 |
| 2 | Expert Consultation | `/expert` | AI-guided product recommendation | P0 |
| 3 | Solution Display | `/solution` | Show generated repair plan | P0 |
| 4 | Categories Grid | `/categories` | Browse all product categories | P0 |
| 5 | Category Products | `/categories/[slug]` | Products within a category | P0 |
| 6 | Product Detail | `/product/[slug]` | Full product information | P0 |
| 7 | Search Results | `/search` | Product search results | P1 |
| 8 | Cart | `/cart` | Shopping cart management | P0 |
| 9 | Account | `/account` | User profile & settings | P1 |
| 10 | Checkout | `/checkout` | Payment flow | P0 (Shopify) |

---

## Detailed Screen Specifications

---

### 1. Home Screen

**Route:** `/`

**Purpose:** Landing page that introduces the expert system and provides multiple entry points to the app.

#### Content Sections (Top to Bottom)

1. **Hero Section**
   - Animated gradient background with fluid shapes
   - Main headline: "Your Personal Paint Expert"
   - Subheadline: Brief value proposition
   - Primary CTA button: "Start Expert Consultation" → `/expert`

2. **Smart Search Bar**
   - Prominent search input with AI badge
   - Placeholder text: "Describe your project or search products..."
   - Quick suggestion chips below:
     - "Fix a scratch"
     - "Paint new bumper"
     - "Ceramic coating"
     - "Touch up chips"
   - Camera icon for image upload
   - Microphone icon (future: voice input)

3. **Trust Indicators**
   - Row of badges/icons:
     - "Expert AI Guidance"
     - "Quality Products"
     - "Fast Shipping"

4. **Shop by Category**
   - Horizontal scrollable row of category cards
   - Each card: Icon + Category name
   - "View All" link → `/categories`

5. **Featured Products**
   - Grid of 4-8 product cards
   - Product card: Image, name, price, "Add to Cart" button
   - "View All Products" link

6. **How It Works** (Optional)
   - 3-step visual explanation:
     1. Describe your project
     2. Get expert recommendations
     3. Order everything you need

#### UI Patterns

- **Layout:** Single column, full-width sections
- **Animation:** Staggered fade-in on scroll (Framer Motion)
- **Cards:** Glass-morphism effect with subtle borders
- **Colors:** Dark background with teal/purple accents

#### Actions

| Element | Action | Destination |
|---------|--------|-------------|
| "Start Expert" CTA | Navigate | `/expert` |
| Search submission | Smart route | `/expert` or `/search` based on query |
| Category card tap | Navigate | `/categories/[slug]` |
| Product card tap | Navigate | `/product/[slug]` |
| "Add to Cart" button | Add item | Cart state update + toast |
| "View All" links | Navigate | `/categories` or product listing |

---

### 2. Expert Consultation Screen

**Route:** `/expert`

**Purpose:** The core AI-powered consultation experience where users describe their project and receive guidance.

**Reference:** `V2-CONCEPT-04-CONVERSATION-FLOW.md`, `V2-CONCEPT-12-EXPANDED-CONVERSATION-FLOWS.md`

#### Layout Structure

```
┌─────────────────────────────────┐
│ Header (fixed)                  │
│ "Expert Consultation" + status  │
├─────────────────────────────────┤
│                                 │
│  Message Area (scrollable)      │
│  - Message bubbles              │
│  - Understanding cards          │
│  - Question cards               │
│  - Typing indicator             │
│                                 │
│                                 │
├─────────────────────────────────┤
│ Input Area (fixed at bottom)    │
│ [Text input] [Camera] [Send]    │
│ Quick suggestions (when empty)  │
└─────────────────────────────────┘
```

#### Content Elements

1. **Header Bar**
   - Back button (to home)
   - Title: "Expert Consultation"
   - Status indicator: "Gathering info" / "Analyzing" / "Solution ready"
   - Reset/restart button (icon)

2. **Message Area**
   - **User Messages:** Right-aligned, teal background bubble
   - **Assistant Messages:** Left-aligned, glass-card bubble with brain emoji avatar
   - **Image Messages:** Inline image thumbnail within bubble
   - **Understanding Card:** Appears after AI processes input
     - Shows "What I understand:" with confirmed facts (green checks)
     - Shows inferred facts with confidence indicators
     - "Something wrong?" correction link
   - **Question Card:** Interactive question from AI
     - Question text
     - Option buttons (single or multi-select)
     - "Not sure?" help toggle
     - Text input variant for open questions
   - **Typing Indicator:** Three animated dots when AI is "thinking"

3. **Input Area**
   - Multi-line text input (expands as needed)
   - Camera button → opens image picker
   - Image preview (when image attached)
   - Send button (teal, active when input present)
   - Quick suggestion chips (when input empty):
     - "I scratched my car door"
     - "Upload a photo"
     - "I have a new bumper to paint"

#### Conversation States

| State | Visual Indicators | Behavior |
|-------|-------------------|----------|
| **Idle** | Welcome message displayed | Waiting for first input |
| **Gathering** | Status: "Gathering info" | Processing inputs, showing questions |
| **Analyzing** | Status: "Analyzing..." | AI processing, typing indicator |
| **Ready** | Status: "Solution ready" | CTA to view solution appears |

#### Actions

| Element | Action | Result |
|---------|--------|--------|
| Send text | Process input | Parse text → update knowledge → respond |
| Send image | Analyze image | Extract info from image → update knowledge |
| Tap question option | Answer question | Confirm fact → next question or solution |
| "Not sure?" toggle | Show help | Reveal help text for current question |
| "Something wrong?" | Correction mode | Allow user to correct inferences |
| "View Solution" CTA | Navigate | `/solution` |
| Reset button | Clear state | Restart conversation |

#### UX Patterns

- **Auto-scroll:** New messages scroll into view
- **Keyboard handling:** Input pushes up on mobile
- **Progressive disclosure:** Show understanding gradually
- **Non-linear flow:** No fixed question order (see V2-CONCEPT-04)
- **Graceful defaults:** Proceed with assumptions when user unsure

---

### 3. Solution Display Screen

**Route:** `/solution`

**Purpose:** Present the generated repair/project plan with all steps and recommended products.

**Reference:** `V2-CONCEPT-05-SOLUTION-GENERATION.md`, `V2-CONCEPT-06-UI-COMPONENTS.md`

#### Layout Structure

```
┌─────────────────────────────────┐
│ Header (fixed)                  │
│ "Your Repair Plan" + back       │
├─────────────────────────────────┤
│ Solution Summary Card           │
│ [Title] [Difficulty] [Time]     │
│ [Total Price] [Add All to Cart] │
├─────────────────────────────────┤
│                                 │
│  Steps (scrollable accordion)   │
│  ├─ Step 1: [Title]             │
│  │  └─ Products for step        │
│  ├─ Step 2: [Title]             │
│  │  └─ Products for step        │
│  └─ Step N: [Title]             │
│                                 │
├─────────────────────────────────┤
│ Assumptions / Notes             │
├─────────────────────────────────┤
│ Actions: Start Over | Save      │
└─────────────────────────────────┘
```

#### Content Elements

1. **Solution Header Card**
   - Solution title (e.g., "Fix Deep Scratch on Metal Surface")
   - Difficulty badge: Beginner / Intermediate / Advanced
   - Time estimate badge: "2-3 hours"
   - Total price display
   - "Add All to Cart" button (prominent, teal)
   - Products count

2. **Steps Accordion**
   - Each step is an expandable section
   - **Step Header:**
     - Step number (circled)
     - Step title
     - Products count for step
     - Expand/collapse chevron
   - **Step Content (expanded):**
     - Description paragraph
     - Pro tips (highlighted)
     - Product cards (horizontal scroll or grid)
     - "Add Step Products to Cart" button

3. **Product Card (within step)**
   - Product image thumbnail
   - Product name (tappable → product detail)
   - Price
   - Quantity needed (e.g., "×2")
   - Essential indicator (star) or "Optional" tag
   - Reason text (e.g., "For plastic surfaces")
   - Individual "Add" button

4. **Assumptions Section**
   - List of assumptions made (when user didn't specify)
   - Example: "Assumed solid color (not metallic)"
   - Link to go back and provide more detail

5. **Action Footer**
   - "Start Over" → clears state, returns to `/expert`
   - "Save for Later" (future feature)
   - "Share" (future feature)

#### UI Patterns

- **Accordion:** Only one step expanded at a time (optional)
- **Sticky summary:** Solution header stays visible while scrolling
- **Progress feel:** Steps numbered to show journey
- **Trust signals:** Show why each product is recommended

#### Actions

| Element | Action | Result |
|---------|--------|--------|
| "Add All to Cart" | Bulk add | All essential products added + toast |
| "Add Step Products" | Step add | Products for step added + toast |
| Individual "Add" | Single add | One product added + toast |
| Product card tap | Navigate | `/product/[slug]` |
| Step header tap | Toggle | Expand/collapse step |
| "Start Over" | Reset | Clear state → `/expert` |
| Back button | Navigate | `/expert` (preserves state) |

---

### 4. Categories Grid Screen

**Route:** `/categories`

**Purpose:** Display all product categories for browsing.

#### Content Elements

1. **Header**
   - Title: "Shop by Category"
   - Optional: Search shortcut

2. **Categories Grid**
   - 2-column grid (mobile), 3-4 columns (desktop)
   - Each card:
     - Category icon (large, centered)
     - Category name
     - Product count badge
     - Glass-card styling
   - Entrance animation (staggered fade-in)

3. **Expert CTA Banner** (Optional)
   - "Not sure what you need? Let our expert guide you"
   - Button → `/expert`

#### Category List (from V2-CONCEPT-13)

1. Preparation & Cleaning
2. Decontamination
3. Sanding Supplies
4. Rust Treatment
5. Primers
6. Base Coats
7. Clear Coats
8. Finishing & Polishing
9. Protection Products
10. Masking Supplies
11. Application Tools
12. Equipment

#### Actions

| Element | Action | Destination |
|---------|--------|-------------|
| Category card tap | Navigate | `/categories/[slug]` |
| Expert CTA | Navigate | `/expert` |

---

### 5. Category Products Screen

**Route:** `/categories/[slug]`

**Purpose:** Display all products within a specific category.

#### Content Elements

1. **Header**
   - Back button
   - Category name as title
   - Filter/sort toggle

2. **Category Pills** (Horizontal scroll)
   - All categories as pills
   - Current category highlighted
   - Tap to switch category (no page reload feel)

3. **Active Project Banner** (Conditional)
   - If user has active project/solution
   - "Working on: [Project Title]" 
   - "View your project" link

4. **Sort/Filter Bar**
   - Sort dropdown: Relevance, Price ↑, Price ↓, Name
   - Filter toggles (future): In Stock, Price Range

5. **Products Grid**
   - 2-column grid (mobile), 3-4 columns (desktop)
   - Product cards with:
     - Image
     - Name
     - Price
     - "Add to Cart" button
     - "For your project" badge (if product in active solution)

6. **Empty State**
   - If no products in category
   - Friendly message + link to other categories

#### Actions

| Element | Action | Result |
|---------|--------|--------|
| Product card tap | Navigate | `/product/[slug]` |
| "Add to Cart" | Add item | Cart update + toast |
| Category pill tap | Navigate | `/categories/[other-slug]` |
| Sort selection | Re-sort | Products reorder (client-side) |
| Back button | Navigate | Previous page or `/categories` |

---

### 6. Product Detail Screen

**Route:** `/product/[slug]`

**Purpose:** Show complete product information and purchase options.

#### Content Elements

1. **Header**
   - Back button
   - Product name (truncated if long)
   - Share button

2. **Product Image**
   - Large hero image
   - Image gallery dots (if multiple images)
   - Swipeable gallery

3. **Product Info**
   - Brand name (if applicable)
   - Product title (full)
   - SKU / Product code
   - Price (prominent)
   - Stock status indicator

4. **Expert Tip Card** (Conditional)
   - If product has expert tip
   - Highlighted card with tip icon
   - Actionable advice for using product

5. **Active Project Link** (Conditional)
   - If this product is in user's active solution
   - "Part of your project: [Title]" link

6. **Quantity & Add to Cart**
   - Quantity selector (- / number / +)
   - "Add to Cart" button (full width, teal)

7. **Description**
   - Full product description
   - Features list
   - Technical specifications

8. **Compatible Products** (Conditional)
   - Horizontal scroll of related products
   - "Works well with this product"

9. **Related Products**
   - Horizontal scroll or grid
   - "You might also like"

#### Actions

| Element | Action | Result |
|---------|--------|--------|
| Image swipe | Gallery nav | Show next/prev image |
| Quantity +/- | Adjust qty | Update quantity state |
| "Add to Cart" | Add item | Add with quantity + toast |
| Share button | Share | Native share sheet or clipboard |
| Compatible product tap | Navigate | `/product/[other-slug]` |
| Expert tip product link | Navigate | `/solution` |
| Back button | Navigate | Previous page |

---

### 7. Search Results Screen

**Route:** `/search?q={query}`

**Purpose:** Display products matching a search query.

#### Content Elements

1. **Header**
   - Back button
   - Search input (pre-filled with query)
   - Clear button

2. **Results Count**
   - "X results for '{query}'"

3. **Sort/Filter Bar**
   - Same as category products

4. **Results Grid**
   - Product cards in grid layout
   - Same card format as category products

5. **No Results State**
   - Friendly message
   - Suggestions:
     - Try different keywords
     - Browse categories
     - Ask the expert
   - CTA to expert: "Let our AI help you find what you need"

6. **Expert Suggestion** (Smart)
   - If query seems project-related
   - "Looking for help with '{query}'? Try our Expert Guide"
   - CTA button → `/expert` with query context

#### Actions

| Element | Action | Result |
|---------|--------|--------|
| Search input submit | New search | Refresh results |
| Clear button | Clear query | Empty input, show suggestions |
| Product card tap | Navigate | `/product/[slug]` |
| "Add to Cart" | Add item | Cart update + toast |
| Expert CTA | Navigate | `/expert` |

---

### 8. Cart Screen

**Route:** `/cart`

**Purpose:** Review and manage shopping cart before checkout.

#### Content Elements

1. **Header**
   - Title: "Your Cart"
   - Item count
   - "Clear All" action (with confirmation)

2. **Active Project Banner** (Conditional)
   - If has active solution
   - "You have a repair plan. Missing anything?"
   - Link to solution

3. **Cart Items List**
   - Each item row:
     - Product image thumbnail
     - Product name (tappable)
     - Unit price
     - Quantity controls (- / qty / +)
     - Line total
     - Remove button (X or swipe)
   - Swipe-to-delete gesture
   - Animated removal

4. **Order Summary Card**
   - Subtotal
   - Shipping estimate (or "Calculated at checkout")
   - Total
   - Promo code input (future)

5. **Checkout Button**
   - Full-width CTA: "Proceed to Checkout"
   - Shows total price

6. **Continue Shopping Link**
   - "Continue Shopping" → home or categories

7. **Empty Cart State**
   - Friendly illustration
   - "Your cart is empty"
   - CTA: "Start Shopping" → `/categories`
   - CTA: "Get Expert Help" → `/expert`

#### Actions

| Element | Action | Result |
|---------|--------|--------|
| Quantity +/- | Adjust qty | Update cart + recalculate |
| Remove button | Remove item | Animated removal + toast |
| "Clear All" | Clear cart | Confirmation → empty cart |
| Item image/name tap | Navigate | `/product/[slug]` |
| "Checkout" button | Navigate | Shopify checkout |
| Solution link | Navigate | `/solution` |

---

### 9. Account Screen

**Route:** `/account`

**Purpose:** User profile, settings, and quick access to personal features.

#### Content Elements

1. **Profile Section**
   - Avatar placeholder
   - User name (or "Guest")
   - Email (if logged in)
   - "Sign In / Register" button (if guest)
   - "Edit Profile" link (if logged in)

2. **Quick Stats**
   - Cart items count
   - Active projects count
   - Orders count (if logged in)

3. **Active Project Card** (Conditional)
   - If has active solution
   - Project title
   - "View Project" button

4. **Menu Items**
   - Order History → `/account/orders`
   - Saved Products → `/account/saved`
   - My Projects → `/account/projects`
   - Settings → `/account/settings`
   - Help & Support → `/account/help`
   - Sign Out (if logged in)

5. **App Info Footer**
   - App version
   - Terms & Privacy links

#### Actions

| Element | Action | Result |
|---------|--------|--------|
| "Sign In" | Auth flow | Authentication modal/page |
| Menu item tap | Navigate | Respective page |
| "View Project" | Navigate | `/solution` |
| "Sign Out" | Logout | Clear session, refresh |

---

## Navigation Flows

### Flow 1: Expert Consultation to Purchase

```
Home → Expert → [Conversation] → Solution → Add to Cart → Cart → Checkout
  │                                  │
  │                                  └─→ Product Detail → Add → Cart
  │
  └─→ Search Bar → [If project query] → Expert
```

### Flow 2: Direct Browse to Purchase

```
Home → Categories → Category Products → Product Detail → Add to Cart → Cart → Checkout
  │         │
  │         └─→ Category Pills → [Switch Category]
  │
  └─→ Featured Products → Product Detail
```

### Flow 3: Search to Purchase

```
Home → Search → Results → Product Detail → Add to Cart → Cart
  │                │
  │                └─→ Expert CTA → Expert Consultation
  │
  └─→ Search Bar (smart routing) → Expert (if project-like query)
```

### Flow 4: Return to Active Project

```
[Any Screen] → Floating Indicator → Solution
                      │
[Category Products] → "For your project" banner → Solution
                      │
[Cart] → "Missing anything?" banner → Solution
                      │
[Account] → Active Project card → Solution
```

---

## Persistent UI Elements

### Bottom Navigation (Mobile)

**Always visible on:** All screens except checkout

```
┌─────┬─────┬─────┬─────┐
│Home │Browse│Cart │Acct │
│ 🏠  │ 🔍  │ 🛒  │ 👤 │
└─────┴─────┴─────┴─────┘
```

- **Home:** Navigate to `/`
- **Browse:** Navigate to `/categories` (or toggle search)
- **Cart:** Navigate to `/cart`, shows badge with count
- **Account:** Navigate to `/account`

### Floating Solution Indicator

**Visible when:** Solution exists and user is NOT on `/solution` or `/expert`

```
┌────────────────────────────┐
│ ✨ Your Repair Plan Ready  │
│ 8 products • €45.99        │
│ [View Plan →]              │
└────────────────────────────┘
```

- Animated entrance (slide up)
- Tappable → navigates to `/solution`
- Dismissible (X button) - hides for session
- Re-appears on new solution

### Header (Desktop)

**Always visible on:** All screens on desktop

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]    Products   Expert Guide    [🔍] [🛒 badge] [👤]  │
└─────────────────────────────────────────────────────────────┘
```

- **Logo:** Navigate to `/`
- **Products:** Navigate to `/categories`
- **Expert Guide:** Navigate to `/expert` (highlighted)
- **Search icon:** Open search or navigate to `/search`
- **Cart icon:** Navigate to `/cart`, shows count badge
- **Account icon:** Navigate to `/account`

### Toast Notifications

**Triggered by:** Add to cart, errors, confirmations

- Bottom-positioned (above bottom nav on mobile)
- Auto-dismiss after 3 seconds
- Swipe to dismiss
- Types: Success (green), Error (red), Info (teal)

---

## Screen State Summary

| Screen | Auth Required | Data Source | Cache Strategy |
|--------|---------------|-------------|----------------|
| Home | No | Server (categories, featured) | Revalidate on nav |
| Expert | No | Client (conversation state) | Persist locally |
| Solution | No | Client (from expert state) | Persist locally |
| Categories | No | Server | Revalidate on nav |
| Category Products | No | Server | Revalidate on nav |
| Product Detail | No | Server | Revalidate on nav |
| Search | No | Server | No cache |
| Cart | No | Client (Zustand) | Persist locally |
| Account | Partial | Server + Client | Revalidate on nav |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Bottom nav, single column, full-width inputs |
| Tablet | 768px - 1024px | Bottom nav, 2-3 column grids, wider cards |
| Desktop | > 1024px | Top header, 3-4 column grids, sidebar potential |

---

## Animation Guidelines

| Context | Animation | Duration |
|---------|-----------|----------|
| Page enter | Fade in + slight slide up | 300ms |
| List items | Staggered fade in | 50ms stagger |
| Modals/overlays | Scale up + fade | 200ms |
| Cards on tap | Subtle scale down | 100ms |
| Cart item remove | Slide out + fade | 200ms |
| Floating indicator | Slide up from bottom | 300ms |
| Toast appear | Slide in from bottom | 200ms |
| Accordion expand | Height animate | 200ms |

---

**END OF DOCUMENT**
]... Create the MOBILE VIEW SCREENS ONLY AND MAKE SURE WE USE AN ASPECT RATIO FOR THE GENERATIONS THAT IS RESEMBLING THE MOBILE SCREENS. 