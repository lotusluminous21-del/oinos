# Agentic Expert System Specification

This document outlines the architecture and requirements for an agentic retrieval system designed to provide expert advice on automotive paints, sprays, and accessories.

## RAG vs. Agentic Retrieval: A Comparison

### Standard RAG
- **Workflow:** Linear and static (Retrieve -> Generate).
- **Decision Making:** None. Fetches what matches the query.
- **Tool Usage:** Typically a single vector database.
- **Limitations:** Fails on complex, multi-step queries or where strict logic (chemistry/compatibility) is required.

### Agentic Retrieval
- **Workflow:** Iterative and dynamic (Plan -> Retrieve -> Evaluate -> Refine -> Generate).
- **Decision Making:** Autonomous reasoning and self-correction.
- **Tool Usage:** Multiple tools (Vector DBs, APIs, Web Search, SQL).
- **Advantages:** Handles ambiguity, breaks down complex tasks, and ensures logical consistency (e.g., chemical compatibility in painting).

---

## Why Agentic RAG for Paint Expertise?

1. **The "Recipe" Problem:** Painting requires specific sequences (Primer -> Base -> Clear). Standard RAG lacks the logic to enforce this order.
2. **Compatibility Failures:** Preventing chemical mismatches (e.g., lacquer over enamel) requires relational logic that vector searches often miss.
3. **Interactive Clarification:** The agent can ask necessary follow-up questions (e.g., "What material are you painting?") before recommending products.

---

## Proposed Architecture: Hybrid "Fast & Expert" Lane

- **Fast Lane (Standard RAG/Search):** For simple queries like "Do you have matte black in stock?" (1-2s latency).
- **Expert Lane (Agentic Loop):** For project-based queries like "How do I fix a deep scratch?" (5-8s latency).

---

## Knowledge & Data Requirements

### 1. Shopify Data Structure (Schema)
The agent must understand the specific location of metadata within the `pavlicevits` namespace, synchronized with our internal **Pydantic Models** (`ProductEnrichmentData`):

- **Standard Fields:** 
  - `title`: Semantic, neat, and brief title in Greek.
  - `productType`: General classification (Maps to `ProductCategory`).
  - `vendor`: Manufacturer (e.g., 'HB Body').
  - `tags`: List of relevant tags in Greek.
- **Custom Metafields (`pavlicevits` namespace):**
  - `short_description`: Brief summary for collections (Greek).
  - `category`: Internal classification (`ProductCategory` Literal).
    - *Available Values:* "Σπρέι Βαφής", "Χρώματα", "Ρητίνες", "Στόκοι", "Πινέλα & Ρολά", "Εργαλεία & Αξεσουάρ", "Διαλυτικά", "Καθαριστικά", "Άλλο".
  - `brand`: Manufacturer brand.
  - `ai_confidence`: AI enrichment confidence score (0-1).
  - **Technical Specs (`PaintTechnicalSpecs` Model):**
    - `chemical_base`: Literal {"Ακρυλικό", "Σμάλτο", "Λάκα", "Ουρεθάνη", "Εποξικό", "Νερού", "Διαλύτου", "Άλλο"}.
    - `sequence_step`: Literal {"Προετοιμασία/Καθαριστικό", "Αστάρι", "Ενισχυτικό Πρόσφυσης", "Βασικό Χρώμα", "Βερνίκι", "Γυαλιστικό", "Άλλο"}.
    - `surfaces`: List of Literals {"Γυμνό Μέταλλο", "Πλαστικό", "Ξύλο", "Fiberglass", "Υπάρχον Χρώμα", "Σκουριά", "Αλουμίνιο", "Γαλβανιζέ", "Άλλο"}.
    - `finish`: Literal {"Ματ", "Σατινέ", "Γυαλιστερό", "Υψηλής Γυαλάδας", "Σαγρέ/Ανάγλυφο", "Μεταλλικό", "Πέρλα", "Άλλο"}.
    - `special_properties`: List of Literals {"Υψηλής Θερμοκρασίας", "Ανθεκτικό σε UV", "Αντισκωριακό", "2 Συστατικών", "1 Συστατικού"}.
    - `drying_time_touch`: String (e.g., "10-15 λεπτά").
    - `recoat_window`: String.
    - `full_cure`: String.
    - `application_method`: List of Literals {"Σπρέι", "Πιστόλι Βαφής", "Πινέλο", "Ρολό", "Άλλο"}.
    - `mixing_ratio`: String (crucial for 2K products).
    - `pot_life`: String.
    - `voc_level`: String.
    - `spray_nozzle_type`: String (e.g., "Βεντάλια", "Κυκλικό").

### 2. Domain Logic (The Physics of Paint)
Hardcoded or grounded rules the agent must follow (leveraging internal model knowledge):
- **Sequencing:** Metal -> Etching Primer -> Base Coat -> Clear Coat.
- **Compatibility Matrix:** Rules preventing catastrophic chemical reactions (e.g., lacquer vs. enamel).
- **Safety:** Mandating respirators for 2K (two-component) products (identified by `pot_life` or `mixing_ratio` metafields).
- **Greek Localization:** The agent should handle queries in both English and Greek, as many field values (e.g., `surfaces`, `category`) are stored in Greek.

### 3. Vocabulary Mapping (The Translation Layer)
Mapping expert/general terms to store-specific data:
- **Expert Term:** "Adhesion Promoter" -> **Search Query:** `metafields.pavlicevits.category="primer" AND metafields.pavlicevits.surfaces CONTAINS "Πλαστικό"`.
- **Expert Term:** "2K Clear Coat" -> **Search Query:** `metafields.pavlicevits.category="Βερνίκι" AND metafields.pavlicevits.pot_life IS NOT EMPTY`.
- **Expert Term:** "Bare Metal" -> **Search Query:** `metafields.pavlicevits.surfaces CONTAINS "Γυμνό Μέταλλο"`.

---

## Implementation Strategies

1. **Explicit Tool Descriptions:** Defining API tools with extreme precision so the agent knows *exactly* when and how to use them.
2. **Few-Shot Prompting (ReAct):** Providing examples of the "Thought -> Action -> Observation" loop for common scenarios.
3. **Static Context Injection:** Providing a "Rules Matrix" in JSON or text format within the system prompt to ground the agent's general knowledge in store-specific constraints.

### Example Tool Signature (Draft)
```typescript
/**
 * Searches the Shopify product database based on specific technical attributes.
 * @param chemical_base - The chemical composition (e.g., 'acrylic', 'enamel', 'urethan').
 * @param surface_type - The material being painted (e.g., 'plastic', 'metal', 'fiberglass').
 * @param category - The product category (e.g., 'primer', 'base_coat', 'clear_coat').
 */
function query_paint_products(chemical_base?: string, surface_type?: string, category?: string): Product[];
```
