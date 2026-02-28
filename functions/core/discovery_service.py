import os
import time
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
try:
    from dotenv import load_dotenv
    # Load environment variables
    load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))
except ImportError:
    # In production/cloud, variables might already be set or dotenv not needed
    pass

# Config
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "pavlicevits-9a889")
LOCATION = "us-central1" # Grounding often requires us-central1
MODEL_NAME = "gemini-2.5-flash"

class DiscoveryService:
    def __init__(self):
        self.client = genai.Client(
            vertexai=True,
            project=PROJECT_ID,
            location=LOCATION
        )
        self.google_search_tool = types.Tool(
            google_search=types.GoogleSearch()
        )

    def _grounded_search(self, prompt: str) -> Dict[str, Any]:
        """Low-level grounded search call. Returns text + source URLs."""
        try:
            response = self.client.models.generate_content(
                model=MODEL_NAME,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    tools=[self.google_search_tool],
                    temperature=0.2
                )
            )
            
            generated_text = response.text if response.text else ""
            
            source_urls = []
            if response.candidates and response.candidates[0].grounding_metadata:
                metadata = response.candidates[0].grounding_metadata
                if metadata.grounding_chunks:
                    for chunk in metadata.grounding_chunks:
                        if chunk.web and chunk.web.uri:
                            source_urls.append(chunk.web.uri)
            
            unique_urls = list(dict.fromkeys(source_urls))
            return {"text": generated_text, "source_urls": unique_urls}
        except Exception as e:
            print(f"ERROR: Grounded search failed: {e}")
            return {"text": "", "source_urls": [], "error": str(e)}

    def search_and_enrich(self, product_name: str, search_query: Optional[str] = None) -> Dict[str, Any]:
        """
        Two-phase grounded search:
          Phase 1 — Catalogue Hunt: Searches for the brand's official product page or TDS.
          Phase 2 — Broad Search:  Supplements with broader web results if Phase 1 was sparse.
        Returns merged text + deduplicated source URLs.
        """
        query_to_use = search_query if search_query else product_name

        # ── Phase 1: Official Catalogue / TDS Hunt ───────────────────────
        catalogue_prompt = f"""Find the OFFICIAL manufacturer's product page, catalog entry, or Technical Data Sheet (TDS) for: '{query_to_use}'.
        
        SEARCH STRATEGY: 
        - Prioritize the brand's own website (e.g. hbbody.com, motip.com, 3m.com).
        - Look for URLs containing keywords like /products/, /catalog/, /tds/, /data-sheet/.
        - Search in BOTH English and Greek to cover official regional sites.
        
        If you find an official page, extract ALL available information:
        1. Full product name and model/code identifiers.
        2. Complete technical specifications (chemical base, drying times, coverage, VOC, mixing ratios, etc.).
        3. All available color variants and sizes listed in the catalogue.
        4. Recommended application methods and surfaces.
        
        Format as clean, structured text. If no official page is found, say "NO_OFFICIAL_SOURCE_FOUND" and provide whatever partial info you can gather.
        """

        print(f"DiscoveryService: Phase 1 — Catalogue hunt for '{query_to_use}'")
        catalogue_result = self._grounded_search(catalogue_prompt)
        
        catalogue_text = catalogue_result.get("text", "")
        catalogue_urls = catalogue_result.get("source_urls", [])
        catalogue_is_sparse = (
            len(catalogue_text) < 300 or 
            len(catalogue_urls) < 1 or 
            "NO_OFFICIAL_SOURCE_FOUND" in catalogue_text
        )

        # ── Phase 2: Broad Web Search (supplement or fallback) ───────────
        broad_text = ""
        broad_urls = []

        if catalogue_is_sparse:
            print(f"DiscoveryService: Phase 1 sparse ({len(catalogue_text)} chars, {len(catalogue_urls)} URLs). Running Phase 2 broad search.")
        else:
            print(f"DiscoveryService: Phase 1 succeeded ({len(catalogue_text)} chars, {len(catalogue_urls)} URLs). Running supplementary Phase 2.")

        broad_prompt = f"""Conduct a deep web search for comprehensive product information about: '{query_to_use}'.
        
        CRITICAL SEARCH INSTRUCTION: 
        Search BOTH English and Greek sources. English sources often contain the most accurate deep technical specifications (like mixing ratios, pot life, nozzle types, VOCs), while Greek sources will help with local naming conventions.
        
        {"IMPORTANT: The official catalogue was NOT found. You must rely entirely on third-party sources, reviews, and distributor pages." if catalogue_is_sparse else "IMPORTANT: An official source was already found. Focus on SUPPLEMENTARY information — e-commerce listings, user reviews, alternate color/size variants, and any specs not covered by the official page."}
        
        Provide:
        1. A detailed, professional product description synthesized into Greek.
        2. A complete list of deep technical specifications.
        3. Relevant tags for an e-commerce store.
        4. ALL available variants mentioned in any catalogs (colors, sizes, specific codes).
        
        Format the output as clean, structured text.
        """
        
        broad_result = self._grounded_search(broad_prompt)
        broad_text = broad_result.get("text", "")
        broad_urls = broad_result.get("source_urls", [])
        
        # ── Merge Results ────────────────────────────────────────────────
        if catalogue_is_sparse:
            # Phase 1 failed — use Phase 2 as primary
            merged_text = broad_text
        else:
            # Phase 1 succeeded — catalogue is primary, broad supplements
            merged_text = f"=== OFFICIAL CATALOGUE DATA ===\n{catalogue_text}\n\n=== SUPPLEMENTARY WEB DATA ===\n{broad_text}"

        # Deduplicate URLs, catalogue URLs first (higher quality)
        all_urls = catalogue_urls + broad_urls
        unique_urls = list(dict.fromkeys(all_urls))
        
        print(f"DiscoveryService: Final merged result — {len(merged_text)} chars, {len(unique_urls)} unique URLs")
        
        return {
            "text": merged_text,
            "source_urls": unique_urls
        }

