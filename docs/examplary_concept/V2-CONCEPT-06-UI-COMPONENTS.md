# UI Components & Interactions

## Overview

This document describes the user interface components and interaction patterns, without prescribing visual styling.

---

## Expert Consultation Interface

### Chat Container

The main conversation area with:
- Scrollable message history
- Auto-scroll to newest content
- Input area fixed at bottom

### Message Bubbles

**User messages:**
- Right-aligned
- Contains text content
- If image attached: shows image thumbnail above text

**Assistant messages:**
- Left-aligned
- Avatar/icon indicator
- Can contain:
  - Plain text
  - Understanding card (embedded)
  - Question card (embedded)
  - Solution-ready CTA (embedded)

### Understanding Card

Displayed inline in conversation when system updates its understanding.

**Structure:**
- Header: "Here's what I understand:"
- List of confirmed items (solid indicator)
- List of inferred items (tentative indicator + confidence implication)
- Footer: "Tap any item to correct"

**Interactions:**
- Each item is tappable
- Tapping opens edit modal or inline correction
- Corrections update knowledge state

### Question Card

Presented when system needs specific information.

**Structure:**
- Question text
- Help text (optional, expandable)
- Answer options as tappable cards

**Option Card:**
- Icon/emoji
- Label (primary text)
- Description (secondary text)
- Selected state visual

**Interactions:**
- Single-tap to select and submit
- No separate "submit" button needed
- Selection triggers processing and next response

### Chat Input

**Components:**
- Text input field
- Camera/image button
- Send button

**Behaviors:**
- Placeholder text changes based on context
- Disabled state when processing or solution complete
- Image button opens camera/gallery picker
- Send button enabled only when content present

**Image Upload Flow:**
1. User taps camera button
2. System picker (camera or gallery)
3. Selected image shows as preview above input
4. User can add text or send image-only
5. Clear button to remove image before sending

### Typing Indicator

Shown while system is processing.

**Appearance:** Animated dots or similar indicator

**Placement:** Where next assistant message will appear

### Solution-Ready CTA

Displayed when solution is generated.

**Structure:**
- Success indicator
- Solution title
- Quick stats (products, price)
- "View Your Repair Plan" button

---

## Solution View Interface

### Header Section

Back navigation + title

### Summary Card

**Primary info:**
- Solution title with icon
- Time estimate
- Difficulty rating (with color indicator)

**Based-on tags:** Visual tags showing key inputs

**Assumptions:** Italic text listing any defaults used, with edit option

### Steps Accordion

**Section header:** "STEP-BY-STEP GUIDE"

**Each step:**
- Collapsed state: Number, title, duration
- Expanded state: Full content
- Tap to toggle
- First step expanded by default

**Expanded step content:**
1. Description paragraph
2. Pro Tips box (highlighted background)
   - Icon + "Pro Tips" label
   - Bulleted list of tips
3. Warnings box (if applicable, different highlight)
   - Icon + "Important" label
   - Bulleted list of warnings
4. Products grid
   - Product cards in 2-column grid
   - Each card: image, name, price × quantity, add button

### Product Cards (in solution)

**Structure:**
- Small product image
- Product name (truncated if long)
- Price × quantity
- Add button (circular)

**States:**
- Default: Plus icon, primary color
- In cart: Check icon, success color, disabled

### Total & Add All Section

**Structure:**
- "Complete Shopping List" label
- Product count + total price
- Large "Add All to Cart" button
- Clarification note about essential vs optional

---

## E-Commerce Components

### Product Card (Catalog)

**Structure:**
- Product image (with aspect ratio container)
- Category badge (optional)
- Product name
- Price
- Add to Cart button

**States:**
- Default
- Hover (subtle effect)
- "From your project" badge (if user has active project)

### Category Card

**Structure:**
- Icon
- Category name
- Product count

**Interaction:** Link to category page

### Cart Item

**Structure:**
- Product image (small)
- Name
- Unit price
- Quantity controls (+/- buttons)
- Line total
- Remove button

**States:**
- "From your repair plan" badge (if from solution)

### Search Bar (Homepage)

**Structure:**
- "Expert AI" badge indicator
- Input field
- Camera icon (for image search)
- Microphone icon (for voice, future)

**Behavior:**
- On submit, navigates to Expert Guide with query

---

## Navigation

### Mobile Bottom Navigation

**Items:**
- Home
- Browse (categories)
- Cart (with item count badge)
- Account

**Active Project Indicator:**
Floating card above nav when user has active project from solution.
- "Active Project" label
- "View Plan" action
- Dismiss option

### Desktop Header

**Items:**
- Logo (links to home)
- Products dropdown
- Search bar
- Cart icon (with count)
- Account icon

---

## Global Patterns

### Loading States
- Skeleton placeholders for content
- Spinner for actions in progress
- Typing indicator for AI responses

### Empty States
- Illustrative message + suggested action
- Examples: empty cart, no search results, no solution yet

### Toasts/Notifications
- "Added to cart" confirmation
- Error messages
- Success confirmations

### Modals/Sheets
- Product quick view
- Correction/edit interfaces
- Confirmation dialogs
