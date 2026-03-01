import logging
import json
from firebase_admin import firestore
from google.genai import types

from core.llm_config import LLMConfig
from core.discovery_service import DiscoveryService
from core.content_extractor import ContentExtractor

from ..models import ProductState, ProductEnrichmentData

logger = logging.getLogger(__name__)

class MetadataAgent:
    """
    Responsible for Phase 1: Scraping the web for context, and synthesizing
    pylon data + web context into strictly structured Greek metadata.
    """

    @classmethod
    def _curate_variants(cls, client, category: str, variants: list) -> list:
        """
        Post-processor that uses flash-lite to clean up generic LLM hallucinations,
        deduplicate axes, and force strict alignment between Color and Size.
        """
        if not variants:
            return []
            
        logger.info(f"MetadataAgent: Curating {len(variants)} raw variants for category '{category}' using flash-lite...")
        
        prompt = f"""You are a strict Data Quality Assurance AI for Shopify.
        You have received a raw list of product variants. Your job is to format, deduplicate, and curate them according to strict Category Rules.
        
        Product Category: {category}
        Raw Variants: {json.dumps(variants, ensure_ascii=False)}
        
        CRITICAL CATEGORY RULES:
        1. "Αστάρια & Υποστρώματα", "Χρώματα Βάσης", "Βερνίκια & Φινιρίσματα": Can have BOTH "Χρώμα" and "Χωρητικότητα/Βάρος" (Volume/Weight).
        2. "Πινέλα & Εργαλεία", "Αξεσουάρ": NO variants allowed, OR only "Μέγεθος/Διάσταση" (Size). NEVER Color.
        3. "Διαλυτικά & Αραιωτικά", "Προετοιμασία & Καθαρισμός": ONLY "Χωρητικότητα/Βάρος" allowed. NEVER Color.
        4. "Σκληρυντές & Ενεργοποιητές": Usually ONLY "Χωρητικότητα/Βάρος".
        
        AXIS CONSTRAINTS:
        - Option 1 MUST ONLY be used for "Χρώμα". If the variant does not have a color, leave Option 1 empty/null.
        - Option 2 MUST ONLY be used for "Χωρητικότητα/Βάρος" or "Μέγεθος/Διάσταση".
        - Ensure `variant_name` clearly reflects the combination.
        - Deduplicate any identical variants.
        
        CROSS-AXIS DETECTION (CRITICAL):
        Look at the SKU suffixes carefully. If they contain BOTH a color AND a size/volume component (e.g. "-BLACK-1LT", "-GREY-400ML"), 
        you MUST decompose them into TWO separate axes on each variant:
        - option1_name: "Χρώμα", option1_value: the color part (translated to Greek)
        - option2_name: "Χωρητικότητα/Βάρος", option2_value: the size/volume part
        
        EXAMPLE — If input has: ["-BLACK-1LT", "-GREY-1LT", "-BLACK-400ML", "-GREY-400ML"]
        Then output MUST have each variant with BOTH axes:
        {{sku_suffix: "-BLACK-1LT", option1_name: "Χρώμα", option1_value: "Μαύρο", option2_name: "Χωρητικότητα/Βάρος", option2_value: "1LT"}}
        {{sku_suffix: "-GREY-400ML", option1_name: "Χρώμα", option1_value: "Γκρι", option2_name: "Χωρητικότητα/Βάρος", option2_value: "400ml"}}
        
        NEVER group all variants under a single axis when they clearly span two dimensions.
        
        Return the exact curated JSON array of variants. If the category should have no variants, return an empty array.
        """
        
        try:
            response = client.models.generate_content(
                model=LLMConfig.get_model_name(complex=False), # Fast flash-lite
                contents=[prompt],
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    response_mime_type="application/json",
                    response_schema={
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "sku_suffix": {"type": "STRING"},
                                "variant_name": {"type": "STRING"},
                                "option1_name": {"type": "STRING", "nullable": True},
                                "option1_value": {"type": "STRING", "nullable": True},
                                "option2_name": {"type": "STRING", "nullable": True},
                                "option2_value": {"type": "STRING", "nullable": True},
                                "price": {"type": "NUMBER", "nullable": True}
                            },
                            "required": ["sku_suffix", "variant_name"]
                        }
                    }
                )
            )
            
            result_text = response.text
            if result_text.startswith("```json"):
                result_text = result_text.replace("```json\n", "").replace("\n```", "")
            
            curated = json.loads(result_text)
            logger.info(f"MetadataAgent Curation: Reduced {len(variants)} raw variants to {len(curated)} clean variants.")
            return curated
        except Exception as e:
            logger.error(f"Variant Curation Failed: {e}. Falling back to raw list.")
            return variants

    @classmethod
    def _validate_metadata(cls, client, original_name: str, structured_data: dict) -> dict:
        """
        Cross-validates the generated metadata against the original CSV input name
        using flash-lite. Returns independent confidence score and flagged fields.
        """
        title = structured_data.get("title", "")
        brand = structured_data.get("brand", "")
        category = structured_data.get("category", "")
        variants = structured_data.get("variants", [])
        first_variant_color = ""
        for v in variants:
            if v.get("option1_name") == "Χρώμα":
                first_variant_color = v.get("option1_value", "")
                break

        prompt = f"""You are a strict Quality Assurance auditor for a GREEK-LANGUAGE e-commerce product pipeline.
        Your job is to compare AI-generated metadata against the ORIGINAL product name from the source system and flag any FACTUAL inconsistencies.

        IMPORTANT CONTEXT: This is a Greek-only e-commerce store. Greek product titles and descriptions are EXPECTED and CORRECT.
        Do NOT flag fields simply because they are in Greek. Only flag if the content is factually WRONG relative to the original input name.
        The generated title follows the format "Brand - Product Type Attribute Code" and is ALLOWED to deviate from the raw CSV name as long as the key identity (brand, color, model code) is preserved.

        ORIGINAL CSV PRODUCT NAME: \"{original_name}\"

        AI-GENERATED METADATA:
        - Title: \"{title}\"
        - Brand: \"{brand}\"
        - Category: \"{category}\"
        - First Color Variant: \"{first_variant_color}\"

        VALIDATION RULES:
        1. Does the generated BRAND match what can be inferred from the original name? Common abbreviations: HB = HB Body, 3M = 3M, etc.
        2. Does the generated TITLE preserve the key identifiers from the original name — specifically: brand, model codes, and color keywords (e.g. BRONZE/RED/WHITE)? The title can and SHOULD be in Greek, translated naturally.
        3. If the original name contains a color keyword (e.g. BRONZE, RED, BLACK), does the first color variant match that keyword? A variant value like "Μαύρο Ματ" contains BOTH a color AND a finish — the finish should NOT be in the variant value.
        4. Is the CATEGORY reasonable for this product?

        Return a JSON object with:
        - "overall_confidence": float 0.0-1.0 (how accurate is the generated metadata relative to the original name? Be generous if the Greek translation is reasonable.)
        - "flagged_fields": list of field names that seem FACTUALLY wrong. Choose from: ["title", "brand", "category", "variants", "description"]. Only include truly wrong fields — do NOT flag correct Greek translations.
        - "reasoning": Brief explanation of what looks wrong (or "All fields look correct" if confidence > 0.8)
        """

        try:
            response = client.models.generate_content(
                model=LLMConfig.get_model_name(complex=False),
                contents=[prompt],
                config=types.GenerateContentConfig(
                    temperature=0.0,
                    response_mime_type="application/json",
                    response_schema={
                        "type": "OBJECT",
                        "properties": {
                            "overall_confidence": {"type": "NUMBER"},
                            "flagged_fields": {"type": "ARRAY", "items": {"type": "STRING"}},
                            "reasoning": {"type": "STRING"}
                        },
                        "required": ["overall_confidence", "flagged_fields", "reasoning"]
                    }
                )
            )
            result = json.loads(response.text)
            logger.info(f"MetadataAgent QA: confidence={result.get('overall_confidence')}, flagged={result.get('flagged_fields')}, reason={result.get('reasoning')}")
            return result
        except Exception as e:
            logger.error(f"Metadata Cross-Validation Failed: {e}. Defaulting to self-reported confidence.")
            return {"overall_confidence": structured_data.get("confidence_score", 0.5), "flagged_fields": [], "reasoning": "QA validation failed, using self-reported score."}

    @staticmethod
    def process(doc_ref, data: dict):
        sku = data.get("sku", "")
        pylon_data = data.get("pylon_data", {})
        name = pylon_data.get("name", "")
        price_retail = pylon_data.get("price_retail", 0.0)
        
        if not name:
            logger.error(f"Missing name for SKU {sku}")
            doc_ref.update({
                "status": ProductState.FAILED.value,
                "enrichment_message": "Missing product name. Check input data."
            })
            return

        logger.info(f"MetadataAgent initiating Grounding + Scraper Enrichment for {sku}")
        
        try:
            # Determine Refinement State
            ai_data_existing = data.get("ai_data", {})
            force_metadata = data.get("force_metadata", False)
            is_refinement = bool(ai_data_existing.get("title_el")) and not force_metadata
            search_query = data.get("search_query", "").strip()

            # Step 1: Search Context with Safety Padding
            if search_query:
                # If query is too short/generic (e.g. "bird" or "spray"), pad it with the actual product name to anchor grounding
                if len(search_query) < 15 or name.lower() not in search_query.lower():
                    search_query = f"{name} {search_query}"
            
            discovery_service = DiscoveryService()
            search_result = discovery_service.search_and_enrich(name, search_query=search_query)
            
            if search_result.get("error"):
                raise Exception(f"Discovery Service Failed: {search_result['error']}")
                
            generated_text = search_result.get("text", "")
            source_urls = search_result.get("source_urls", [])
            
            logger.info(f"MetadataAgent: Discovery complete. Found {len(source_urls)} sources.")

            # Step 1b: Extract initial candidate images from source URLs
            content_extractor = ContentExtractor()
            found_images = []
            if source_urls:
                images = content_extractor.fetch_images_from_urls(source_urls, limit=8)
                found_images = [{"url": img, "score": 0.9, "source": "web_scrape"} for img in images]

            # Step 1c: Fallback — Grounded Image Search if HTML scraping found nothing
            if not found_images:
                logger.warning(f"MetadataAgent: ContentExtractor returned 0 images for {sku}. Falling back to grounded image search.")
                try:
                    image_search_result = discovery_service._grounded_search(
                        f"""Find high-quality product images for: '{name}'.
                        Search for clear, professional product photos on manufacturer websites, e-commerce stores, and distributor catalogues.
                        Look specifically for:
                        - Official product images from the brand website
                        - E-commerce listing images (clean product shots on white backgrounds)
                        - Catalogue images showing the product label clearly
                        
                        Return a list of the best image URLs you find. Include the direct image URLs, not web page URLs."""
                    )
                    # Extract image URLs from grounding metadata
                    grounded_img_urls = image_search_result.get("source_urls", [])
                    
                    # Also try to extract image URLs mentioned in the generated text
                    import re as _re
                    text_img_urls = _re.findall(
                        r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"\'<>]*)?',
                        image_search_result.get("text", ""),
                        _re.IGNORECASE
                    )
                    
                    all_search_urls = list(dict.fromkeys(grounded_img_urls + text_img_urls))
                    
                    if all_search_urls:
                        # Try scraping images from the grounded URLs too
                        grounded_images = content_extractor.fetch_images_from_urls(all_search_urls, limit=5)
                        found_images = [{"url": img, "score": 0.7, "source": "grounded_search"} for img in grounded_images]
                        
                        # Also add any direct image URLs from text extraction
                        for img_url in text_img_urls[:5]:
                            if not any(fi["url"] == img_url for fi in found_images):
                                found_images.append({"url": img_url, "score": 0.6, "source": "grounded_text"})
                    
                    logger.info(f"MetadataAgent: Grounded image search found {len(found_images)} images for {sku}.")
                except Exception as e:
                    logger.error(f"MetadataAgent: Grounded image search failed for {sku}: {e}")

            if is_refinement:
                logger.info(f"MetadataAgent: Skipping metadata structuring for {sku} as it already exists. Advancing directly to specific image selection.")
                new_ai_data = {
                    **ai_data_existing,
                    "variant_images": {"base": found_images},
                    "grounding_sources": source_urls,
                    "grounding_text": generated_text,
                    "refined_at": firestore.SERVER_TIMESTAMP
                }
                
                doc_ref.update({
                    "status": ProductState.SOURCING_IMAGES.value,
                    "ai_data": new_ai_data,
                    "search_query": firestore.DELETE_FIELD, # Consume the query
                    "enrichment_message": f"Refined search complete. Found {len(found_images)} images."
                })
                return

            # Step 2: Extraction using Gemini Structured Outputs
            client = LLMConfig.get_client()
            model_name = LLMConfig.get_model_name(complex=True)
            
            structure_prompt = f"""You are an expert e-commerce copywriter for a premium Greek paints, sprays, and automotive tools shop.
            Extract and synthesize product information into a valid JSON structure based on the text below.

            ===== ORIGINAL PRODUCT NAME FROM SOURCE SYSTEM =====
            \"{name}\"
            ORIGINAL RETAIL PRICE: {price_retail}€
            Use this original name as a REFERENCE to extract the real brand, model code, and key attributes (e.g. color, finish).
            For example, if the name contains "HB" the brand is likely "HB Body". If it contains "BRONZE", the primary color variant should be Bronze/Μπρονζέ.
            DO NOT invent or substitute a different brand or color than what the original name implies.
            However, the generated title does NOT need to be a literal copy of this name — create a proper Greek e-shop title instead.
            =============================================================

            SOURCE TEXT (web research context):
            {generated_text}

            You must fulfill the following REQUIREMENTS (STRICTLY IN GREEK where requested):
            1. TITLE (`title`): Create a clean, structured, customer-friendly product title in Greek.
               FORMAT: "[Full Brand Name] - [Product Type in Greek] [Key Attribute] [Model Code]"
               EXAMPLES:
                - "HB Body - Χρώματα Βάσης Μπρονζέ 411"
                - "Motip - Αστάρια & Υποστρώματα Πλαστικών 500ml"
                - "3M - Βερνίκια & Φινιρίσματα Λεπτής Αλοιφής 09376"
                - "HB Body - Χρώματα Βάσης Προφυλακτήρων Texture"
               The title MUST start with the full recognized brand name (not abbreviations). Keep it brief and consistent.
               DO NOT just transliterate or copy the CSV name — make it a proper Greek e-shop title.
               MODEL CODE RULES: Only include short manufacturer model codes (1-5 characters, e.g. "411", "09376").
               NEVER include long numeric codes (6+ digits like "4120200001") — these are store inventory/ERP codes, not product identifiers.
               If the only code you find is a long store code, OMIT it entirely from the title.
            2. Extract the BRAND (`brand`) — the manufacturer's full name. Look at the original product name first, then the source text.
            3. Write a comprehensive, SEO-optimized product description in Greek (`description`). 
               CRITICAL: When referring to the product in the description, use the GENERATED TITLE you created in step 1 — NOT the original CSV name.
               For example, if the title you created is "HB Body - Χρώματα Βάσης Μπρονζέ 411", the description should say "Το HB Body - Χρώματα Βάσης Μπρονζέ 411 είναι..." — NOT "Το HB SPRAY SPECIAL BRONZE 411 είναι..."
               It should be highly readable, customer-friendly, and summarize the technical features while highlighting the main use and benefits. DO NOT use markdown code blocks or HTML tags in the text.
            4. Provide a brief summary for collections (`short_description`).
            5. CATEGORIZATION: Choose exactly one `category` from the allowed list. If unsure, choose "Άλλο".
            6. DYNAMIC VARIANTS: You MUST obey the following strict rules for variants based on the product category:
               - Categories 'Πινέλα & Εργαλεία', 'Αξεσουάρ': NO variants allowed, OR only 'Μέγεθος/Διάσταση' (Size). NEVER generate Color variants.
               - Categories 'Διαλυτικά & Αραιωτικά', 'Προετοιμασία & Καθαρισμός': ONLY allowable variant is 'Χωρητικότητα/Βάρος' (Volume/Weight). NEVER generate Color variants.
               - Categories 'Αστάρια & Υποστρώματα', 'Χρώματα Βάσης', 'Βερνίκια & Φινιρίσματα', 'Στόκοι & Πλαστελίνες', 'Σκληρυντές & Ενεργοποιητές': Can have both 'Χρώμα' and 'Χωρητικότητα/Βάρος'.
               AXIS NOMENCLATURE: `option1_name` MUST ALWAYS be "Χρώμα". `option2_name` MUST ALWAYS be "Χωρητικότητα/Βάρος" or "Μέγεθος/Διάσταση". DO NOT invent new axis names.
               VARIANT VALUE PURITY: Each variant value must contain ONLY the value for its axis. For example, a color variant value should be ONLY the color (e.g. "Μπρονζέ"), NOT "Μπρονζέ Ματ" (the finish belongs in technical_specs, not in the variant value).
               CROSS-AXIS SPLITTING (CRITICAL): If a product comes in BOTH multiple colors AND multiple sizes/volumes, you MUST create a cross-product matrix.
               For example, if a product comes in Black, Grey in both 400ml and 1LT:
               - Create 4 variants: Black/400ml, Black/1LT, Grey/400ml, Grey/1LT
               - Each variant gets BOTH option1 (Color) AND option2 (Volume)
               - SKU suffix example: "-BLACK-400ML", "-BLACK-1LT", "-GREY-400ML", "-GREY-1LT"
               NEVER put size/volume info into the Color axis. If a SKU suffix contains both color and size (e.g. "-BLACK-1LT"), split them into option1=Color and option2=Volume.
               PRICE: You MUST set the 'price' field for EVERY variant exactly to {price_retail} as a starting baseline.
            7. TECHNICAL SPECS: Strictly categorize the product based on its chemical base, finish, and surfaces. Explicitly search for and populate:
               - Coverage efficiency (Απόδοση)
               - Drying times (Χρόνος στεγνώματος / στην αφή)
               - Durability features (π.χ. πλενόμενο, αντισκωριακό)
               - Recommended environment (Εσωτερικός/Εξωτερικός χώρος)
            
            WARNING: All output data MUST be in Greek (except brand names and model codes which stay in their original form).
            You must calculate a `confidence_score` (0.0 to 1.0). Limit to < 0.7 if the source text was sparse, contradictory, or clearly missing key details.
            """
            
            # Using the strict Pydantic model for JSON schema enforcement
            structure_response = client.models.generate_content(
                model=model_name,
                contents=[structure_prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ProductEnrichmentData,
                    temperature=0.0
                )
            )
            
            structured_data = json.loads(structure_response.text)
            
            # Post-Process: Curate Variants
            raw_variants = structured_data.get("variants", [])
            if raw_variants:
                curated_variants = MetadataAgent._curate_variants(client, structured_data.get("category", "Άλλο"), raw_variants)
                structured_data["variants"] = curated_variants
            
            # Cross-Validate Metadata against original CSV name
            qa_result = MetadataAgent._validate_metadata(client, name, structured_data)
            cross_validated_confidence = qa_result.get("overall_confidence", 0.0)
            flagged_fields = qa_result.get("flagged_fields", [])
            qa_reasoning = qa_result.get("reasoning", "")
            
            # Override self-reported confidence with QA-validated confidence
            structured_data["confidence_score"] = cross_validated_confidence
            structured_data["flagged_fields"] = flagged_fields
            structured_data["qa_reasoning"] = qa_reasoning

            # Additional UI Trackers
            structured_data["grounding_sources"] = source_urls
            structured_data["generated_at"] = firestore.SERVER_TIMESTAMP
            structured_data["variant_images"] = {"base": found_images} # Storing candidates
            
            # State Machine Checkpoint Logic (using cross-validated confidence)
            next_status = ProductState.SOURCING_IMAGES.value
            enrichment_message = "Metadata generated successfully. Moving to Image Sourcing."
            
            if cross_validated_confidence < 0.7 or len(flagged_fields) > 0:
                next_status = ProductState.NEEDS_METADATA_REVIEW.value
                enrichment_message = f"QA flagged {len(flagged_fields)} field(s): {', '.join(flagged_fields)}. Reason: {qa_reasoning}"
                logger.warning(f"MetadataAgent: {sku} failed QA (confidence={cross_validated_confidence}, flags={flagged_fields}). Requires review.")
            
            # Commit transition
            doc_ref.update({
                "status": next_status,
                "ai_data": structured_data,
                "search_query": firestore.DELETE_FIELD, # Consume the query
                "enrichment_message": enrichment_message
            })

        except Exception as e:
            logger.error(f"MetadataAgent Failed for {sku}: {e}", exc_info=True)
            raise e
