# PAVLICEVITS V2 - Conceptual Design Documentation

## Document Index

This documentation suite comprehensively describes the PAVLICEVITS V2 system—an AI-powered automotive paint e-commerce platform with expert consultation capabilities.

---

## Core Documents

### 1. [System Overview](./V2-CONCEPT-01-OVERVIEW.md)
High-level introduction to the system, the problem it solves, core components, user journey, and differentiators.

### 2. [Knowledge State System](./V2-CONCEPT-02-KNOWLEDGE-STATE.md)
The central data structure tracking confirmed vs. inferred information, gap analysis, confidence thresholds, and state evolution.

### 3. [Information Taxonomy](./V2-CONCEPT-03-INFORMATION-TAXONOMY.md)
Complete definition of all information dimensions: damage type, depth, material, color type, size, rust presence, equipment, and supplementary fields.

### 4. [Conversation Flow Logic](./V2-CONCEPT-04-CONVERSATION-FLOW.md)
How the non-linear consultation works: input processing pipeline, question generation, understanding display, and detailed conversation examples.

### 5. [Solution Generation System](./V2-CONCEPT-05-SOLUTION-GENERATION.md)
How repair plans are created: solution structure, different repair paths based on damage severity, product selection logic, difficulty rating, and time/price calculations.

### 6. [UI Components & Interactions](./V2-CONCEPT-06-UI-COMPONENTS.md)
Description of all interface elements: chat interface, understanding cards, question cards, solution view, product cards, navigation—without prescribing visual styling.

### 7. [Product Catalog Structure](./V2-CONCEPT-07-PRODUCT-CATALOG.md)
How products are organized: categories, attributes, solution matching logic, and minimum viable catalog specification.

### 8. [Image Analysis Capabilities](./V2-CONCEPT-08-IMAGE-ANALYSIS.md)
What the system can detect from photos: damage type, depth, rust, material, size—plus confidence handling and quality fallbacks.

### 9. [Data Model](./V2-CONCEPT-09-DATA-MODEL.md)
Conceptual data entities: Category, Product, Cart, Message, Knowledge State, Solution, and persistence model.

---

## Expanded Scope Documents (v2.1)

These documents extend the system beyond damage repair to handle all automotive paint/coating scenarios.

### 10. [Expanded Project Scenarios](./V2-CONCEPT-10-EXPANDED-SCENARIOS.md)
Five project types: Damage Repair, New Parts Painting, Restoration, Protective Coatings, and Custom Finishes—with detection logic and solution implications.

### 11. [Unified Knowledge State](./V2-CONCEPT-11-UNIFIED-KNOWLEDGE-STATE.md)
Extended knowledge state structure supporting all project types, with project-specific gaps and ready-for-solution criteria.

### 12. [Expanded Conversation Flows](./V2-CONCEPT-12-EXPANDED-CONVERSATION-FLOWS.md)
Detailed conversation examples for each project type, including mixed-intent handling and clarification flows.

### 13. [Expanded Product Catalog](./V2-CONCEPT-13-EXPANDED-PRODUCT-CATALOG.md)
Full product taxonomy covering all project types: preparation, decontamination, sanding, rust treatment, primers, base coats, clear coats, finishing, protection, masking, and application tools.

---

## Reading Order

**For understanding the concept:**
1. System Overview
2. Conversation Flow Logic
3. Knowledge State System
4. Information Taxonomy

**For understanding the output:**
5. Solution Generation System
6. Product Catalog Structure

**For understanding implementation needs:**
7. UI Components & Interactions
8. Data Model
9. Image Analysis Capabilities

---

## Key Innovations Summary

### Multi-Project Type Support (v2.1)
The system handles five distinct project types:
- **Damage Repair** - Scratches, chips, rust, dents
- **New Parts Painting** - Unpainted bumpers, fenders, trim
- **Restoration** - Faded paint, full respray, classic cars
- **Protective Coatings** - Ceramic, wax, sealant, PPF prep
- **Custom Finishes** - Color change, metallic, pearl, effects

### Non-Linear Expert Consultation
Unlike wizard-style questionnaires, the system:
- Detects project type from natural language
- Extracts information from text and images
- Only asks questions when necessary
- Adapts question flow based on project type and what's already known
- Handles mixed intents (e.g., "paint new bumper AND ceramic coat whole car")

### Confidence-Based Reasoning
- Distinguishes between confirmed (explicit) and inferred (extracted) facts
- Uses confidence scores to decide when to assume vs. ask
- Transparently shows users what the system understood

### Dynamic Solution Generation
- Creates step-by-step guides specific to project type and situation
- Matches products based on material, project type, color, conditions
- Scales quantities based on scope (spot repair → full vehicle)
- Provides difficulty ratings to set expectations

### Multimodal Input
- Accepts text descriptions
- Accepts photos for automatic analysis
- Combines both for comprehensive understanding
- Handles poor-quality images gracefully

---

## Implementation Notes for Developers

### Must-Haves
1. **Project Type Detection** - Identify which of the 5 project types user needs
2. **Knowledge State management** with confirmed/inferred/gaps structure
3. **Text parsing** for project-type-specific terminology extraction
4. **Image analysis integration** (or mock for prototype)
5. **Solution generator** with project-type-aware product mapping
6. **Conversational UI** with message history
7. **Understanding card** display and correction
8. **Question card** with tap-to-select options
9. **Product catalog** covering all project types (~65-70 products minimum)

### Can Be Simplified for Prototype
- Image analysis can use mock scenarios
- Text parsing can be keyword-based
- Product catalog can be seeded data
- Start with 2-3 project types, expand later
- No authentication/payment needed initially

### Should Not Be Changed
- The non-linear conversation philosophy
- The confidence-based inference model
- The gap analysis driving question flow
- The step-by-step solution structure
- Project-type-specific question and product logic

---

## Glossary

| Term | Definition |
|------|------------|
| Project Type | One of five categories: Damage Repair, New Parts, Restoration, Protection, Custom |
| Knowledge State | Data structure tracking everything known about user's situation |
| Project Context | Section of Knowledge State identifying project type and goals |
| Confirmed | Information explicitly stated by user |
| Inferred | Information extracted from text/images with confidence score |
| Gap | Information still needed, categorized by priority (varies by project type) |
| Solution | Generated guide with steps and products (format varies by project type) |
| Understanding Card | UI element showing current system understanding |
| Question Card | UI element for gathering specific information |
| Adhesion Promoter | Essential product for painting plastic surfaces |
| Paint Code | Manufacturer's color code for exact color matching |
| Ceramic Coating | Long-lasting protective layer applied over paint |
| Paint Correction | Process of removing swirls/scratches before protection |
