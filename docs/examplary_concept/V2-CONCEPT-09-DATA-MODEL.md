# Data Model

## Overview

This document describes the data entities, their relationships, and purpose. This is the conceptual data model—actual database implementation may vary.

---

## Core Entities

### Category

Organizes products into logical groups.

| Field | Type | Description |
|-------|------|-------------|
| id | Identifier | Unique ID |
| name | String | Display name (e.g., "Primers") |
| slug | String | URL-safe identifier (e.g., "primers") |
| description | Text | Optional category description |
| icon | String | Icon identifier for UI display |
| order | Number | Sort order for display |

**Relationships:**
- Has many Products

---

### Product

Individual items available for purchase.

| Field | Type | Description |
|-------|------|-------------|
| id | Identifier | Unique ID |
| name | String | Product name |
| slug | String | URL-safe identifier |
| description | Text | Full product description |
| price | Decimal | Unit price |
| image | URL | Product image |
| brand | String | Manufacturer name |
| sku | String | Stock keeping unit |
| inStock | Boolean | Availability flag |
| expertTip | Text | Pro advice for this product |
| compatibleWith | Array | Slugs of compatible products |
| tags | Array | Searchable keywords |
| useCases | Array | Scenario identifiers |
| categoryId | Reference | Link to Category |

**Relationships:**
- Belongs to Category
- Referenced by Solution Steps (via catalog mapping)

---

### Cart Item (Session State)

Items in user's shopping cart.

| Field | Type | Description |
|-------|------|-------------|
| productId | Reference | Link to Product |
| productSlug | String | For URL generation |
| name | String | Product name (denormalized) |
| price | Decimal | Unit price (denormalized) |
| image | URL | Product image (denormalized) |
| quantity | Number | Quantity in cart |
| fromSolution | Boolean | Whether added from repair plan |

**Notes:**
- Session-scoped, persisted in browser storage
- Denormalized for performance (no DB lookup needed for display)

---

## Conversation Entities (Session State)

### Message

Individual message in conversation.

| Field | Type | Description |
|-------|------|-------------|
| id | Identifier | Unique ID |
| role | Enum | "user" or "assistant" |
| content | Text | Message text |
| timestamp | DateTime | When sent |
| imageUrl | URL | Attached image (if any) |
| imageAnalysis | Object | Analysis results (if image) |

---

### Knowledge State

Current understanding of user's situation.

**Confirmed section:**
| Field | Type |
|-------|------|
| damageType | Enum |
| damageDepth | Enum |
| material | Enum |
| rustPresent | Boolean |
| colorType | Enum |
| colorDescription | String |
| colorCode | String |
| size | Enum |
| equipment | Enum |
| location | String |
| vehicleInfo | Object |

**Inferred section:**
Same fields as confirmed, but each wrapped with:
| Field | Type |
|-------|------|
| value | (varies) |
| confidence | Number (0-1) |
| source | Enum ("text"/"image"/"context") |

**Gaps section:**
| Field | Type | Description |
|-------|------|-------------|
| critical | Array | Must resolve before solution |
| important | Array | Significantly affects solution |
| optional | Array | Can use defaults |

---

### Solution

Generated repair plan.

| Field | Type | Description |
|-------|------|-------------|
| id | Identifier | Unique ID |
| title | String | Solution name |
| summary.estimatedTime | String | Time estimate |
| summary.difficulty | Enum | beginner/intermediate/advanced |
| summary.priceRange | Object | {min, max} |
| basedOn | Object | Key inputs that shaped solution |
| assumptions | Array | Defaults used |
| steps | Array | SolutionStep objects |
| totalProducts | Number | Count of products |
| totalPrice | Decimal | Sum of all products |

---

### Solution Step

One step in a repair plan.

| Field | Type | Description |
|-------|------|-------------|
| order | Number | Step sequence number |
| title | String | Step name |
| description | Text | Instructions |
| proTips | Array | Expert advice strings |
| warnings | Array | Important cautions |
| duration | String | Time estimate |
| products | Array | SolutionProduct objects |

---

### Solution Product

Product recommendation within a step.

| Field | Type | Description |
|-------|------|-------------|
| productId | Identifier | Product reference |
| productSlug | String | URL identifier |
| name | String | Product name |
| price | Decimal | Unit price |
| image | URL | Product image |
| reason | String | Why this product is needed |
| isEssential | Boolean | Required vs optional |
| quantity | Number | Recommended quantity |
| alternatives | Array | Alternative product slugs |

---

## Conversation State

Overall session state for consultation.

| Field | Type | Description |
|-------|------|-------------|
| sessionId | Identifier | Unique session ID |
| messages | Array | Message objects |
| knowledgeState | Object | Knowledge State |
| currentQuestion | Object | Active Question (if any) |
| solution | Object | Generated Solution (if any) |
| status | Enum | idle/gathering/generating/complete |

---

## Persistence Model

### Persisted in Database
- Categories (admin-managed)
- Products (admin-managed)

### Persisted in Browser Storage
- Session ID
- Cart contents

### Session-Only (Not Persisted)
- Conversation messages
- Knowledge state
- Generated solution
- Current question

**Rationale:** Each visit starts a fresh conversation. Users don't expect to resume mid-consultation. Cart persists so users can continue shopping across sessions.

---

## Enumerations

### Damage Type
- scratch
- rust
- chip
- dent
- fade
- peel

### Damage Depth
- surface
- throughClear
- toPrimer
- toMetal

### Material Type
- metal
- plastic
- fiberglass
- mixed

### Color Type
- solid
- metallic
- pearl
- tricoat

### Size
- tiny
- small
- medium
- large

### Equipment Type
- aerosol
- sprayGun
- none

### Difficulty
- beginner
- intermediate
- advanced

### Message Role
- user
- assistant

### Conversation Status
- idle
- gathering
- generating
- complete
