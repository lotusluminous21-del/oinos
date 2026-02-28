# Product Catalog Structure

## Overview

The product catalog supports the expert guidance system by providing the products that populate repair solutions. Products are organized by category and tagged for matching to repair scenarios.

---

## Categories

### 1. Preparation
Products for cleaning and preparing surfaces.

**Products include:**
- Wax & grease remover
- Tack cloths
- Surface cleaners
- Panel wipes

### 2. Sanding
Abrasives for surface preparation and finishing.

**Products include:**
- Sandpaper various grits (320, 400, 600, 800, 1000, 1500, 2000)
- Sanding blocks
- Wet/dry sandpaper
- Scotch pads

### 3. Rust Treatment
Products for dealing with corrosion.

**Products include:**
- Rust converters
- Rust removers
- Rust-inhibiting primers
- Anti-rust sprays

### 4. Primers
Foundation layers for paint adhesion.

**Products include:**
- Metal primers
- Plastic adhesion promoters
- Universal primer fillers
- High-build primers
- Etch primers

### 5. Base Coats
Color layers.

**Products include:**
- Pre-mixed colors (silver metallic, white, black, etc.)
- Custom-mix base coats
- Metallic base coats
- Pearl base coats

### 6. Clear Coats
Protective transparent finish layers.

**Products include:**
- 1K clear coats (easy use)
- 2K clear coats (durable, professional)
- Matte clear coats
- High-gloss clear coats

### 7. Finishing
Products for final refinement.

**Products include:**
- Cutting compounds
- Polishing compounds
- Scratch removers
- Buffing pads
- Microfiber cloths

### 8. Masking
Protection for surrounding areas.

**Products include:**
- Masking tape (various widths)
- Masking paper
- Pre-taped masking film
- Plastic sheeting

---

## Product Attributes

### Core Attributes

| Attribute | Description | Example |
|-----------|-------------|--------|
| Name | Product title | "2K Metal Primer Aerosol 400ml" |
| Slug | URL-friendly identifier | "2k-metal-primer-aerosol" |
| Price | Unit price | €18.90 |
| Description | Detailed product description | Full text... |
| Image | Product photo URL | https://i.ytimg.com/vi/yiu5sCmv6M0/hqdefault.jpg |
| Brand | Manufacturer | "PAVLICEVITS" |
| SKU | Stock keeping unit | "PRM-MTL-001" |
| In Stock | Availability | true/false |

### Expert Attributes

| Attribute | Description | Example |
|-----------|-------------|--------|
| Expert Tip | Pro advice for using the product | "Apply 2-3 light coats..." |
| Compatible With | Product slugs this works with | ["base-coat-silver", "clear-coat-2k"] |
| Tags | Searchable keywords | ["metal", "primer", "aerosol", "2k"] |
| Use Cases | Scenario descriptors | ["rust-repair", "bare-metal", "professional"] |

### Solution Matching

Products are matched to solutions by:
1. **Category:** Preparation products for prep step, primers for prime step, etc.
2. **Tags:** "metal" products for metal repairs, "plastic" for bumper repairs
3. **Use Cases:** "rust-repair" products only included when rust is present

---

## Product Data Requirements

For the solution generator to function, products must have:

### Required for All Products
- Name, slug, price, image
- Category assignment

### Required for Solution Products
- At least one use case tag
- Reason text (why this product is recommended)

### Recommended
- Expert tip (enhances credibility)
- Compatible products (enables cross-sells)
- Multiple relevant tags (improves matching)

---

## Sample Product Mapping

### For Rust Repair Solution

| Solution Step | Product Category | Selection Criteria |
|---------------|-----------------|-------------------|
| Preparation | Preparation | Standard degreaser |
| Rust Treatment | Rust Treatment | Rust converter + rust-inhibiting primer |
| Sanding | Sanding | 320 grit for rust, 600 grit for feathering |
| Masking | Masking | Tape + paper |
| Prime | Primers | Metal primer (since rust = metal surface) |
| Base Coat | Base Coats | Color-matched option |
| Clear Coat | Clear Coats | 2K clear for durability |
| Polish | Finishing | Cutting + polishing compound |

### For Plastic Bumper Repair

| Solution Step | Product Category | Selection Criteria |
|---------------|-----------------|-------------------|
| Preparation | Preparation | Standard degreaser |
| Sanding | Sanding | 320 + 600 grit |
| Masking | Masking | Tape + paper |
| Prime | Primers | **Adhesion promoter** + universal primer |
| Base Coat | Base Coats | Color-matched option |
| Clear Coat | Clear Coats | 2K or flexible clear |
| Polish | Finishing | Cutting + polishing compound |

---

## Minimum Viable Catalog

For testing/prototyping, the catalog needs:

**Preparation (2 products)**
- Degreaser
- Tack cloth

**Sanding (4 products)**
- 320 grit
- 600 grit
- 1500 grit (wet)
- 2000 grit (wet)

**Rust (2 products)**
- Rust converter
- Rust-inhibiting primer

**Primers (3 products)**
- Metal primer
- Plastic adhesion promoter
- Universal primer filler

**Base Coats (4 products)**
- Silver metallic
- White solid
- Black solid
- Custom-mix base

**Clear Coats (2 products)**
- 1K clear (easy)
- 2K clear (pro)

**Finishing (3 products)**
- Cutting compound
- Polishing compound
- Scratch remover kit

**Masking (2 products)**
- Tape
- Paper

**Total: ~22-24 products minimum**
