import requests
import json
from typing import List, Dict, Any, Optional
from .client import ExpertShopifyClient
from core.logger import get_logger

logger = get_logger("expert.tools")

def search_products(
    category: Optional[str] = None, 
    chemical_base: Optional[str] = None, 
    surfaces: Optional[List[str]] = None,
    query: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Search the Shopify store for products using technical attributes.
    
    Args:
        category: General category (e.g., 'Αστάρια & Υποστρώματα', 'Χρώματα Βάσης').
        chemical_base: The chemical type (e.g., 'Ακρυλικό', 'Εποξικό').
        surfaces: List of suitable surfaces (e.g., ['Πλαστικό', 'Μέταλλο']).
        query: Optional free-text keywords.
    """
    client = ExpertShopifyClient()
    logger.info(f"Expert Tool: Searching with filters (cat={category}, base={chemical_base}, surf={surfaces})")
    try:
        results = client.search_technical_products(
            category=category,
            chemical_base=chemical_base,
            surfaces=surfaces,
            query=query
        )
        # Simplify results for the LLM to save tokens
        simplified = []
        for p in results:
            simplified.append({
                "title": p["title"],
                "handle": p["handle"],
                "category": p["metafields"].get("category", p["product_type"]),
                "chemical_base": p["metafields"].get("chemical_base"),
                "sequence_step": p["metafields"].get("sequence_step"),
                "surfaces": p["metafields"].get("surfaces"),
                "price": p["variants"][0]["price"] if p["variants"] else "N/A",
                "variant_id": p["variants"][0]["id"] if p["variants"] else None
            })
        return simplified
    except Exception as e:
        logger.error(f"expert_tool.search_products failed: {e}")
        return []
        
    # Fallback: If no results, try a broader keywords search
    if not results and (category or query):
        logger.info(f"Expert Tool: No results for specific filters. Retrying with broad query")
        results = client.search_technical_products(
            query=f"{category or ''} {query or ''}".strip(),
            limit=5
        )
        # Simplify results for the LLM
        simplified = []
        for p in results:
            simplified.append({
                "title": p["title"],
                "handle": p["handle"],
                "category": p["metafields"].get("category", p["product_type"]),
                "chemical_base": p["metafields"].get("chemical_base"),
                "sequence_step": p["metafields"].get("sequence_step"),
                "surfaces": p["metafields"].get("surfaces"),
                "price": p["variants"][0]["price"] if p["variants"] else "N/A",
                "variant_id": p["variants"][0]["id"] if p["variants"] else None
            })
        return simplified
    
    return simplified

def get_paint_rules() -> Dict[str, Any]:
    """
    Returns the static 'Physics of Paint' rules for the shop.
    Useful for grounding the agent's general knowledge.
    """
    return {
        "sequences": {
            "bare_metal": ["Etching Primer (Ενισχυτικό Πρόσφυσης)", "Primer (Αστάρι)", "Base Coat", "Clear Coat"],
            "plastic": ["Plastic Adhesion Promoter", "Primer", "Base Coat", "Clear Coat"],
            "wood": ["Wood Primer", "Base Coat", "Clear Coat"]
        },
        "compatibility": [
            {"rule": "No lacquer over enamel", "reason": "Will lift or wrinkle if enamel is not fully cured and sealed."},
            {"rule": "2K products require activator/hardener", "reason": "Will not cure otherwise."},
            {"rule": "Always degrease before painting", "reason": "Prevent adhesion failure."}
        ]
    }

def lookup_vin(vin: str) -> Dict[str, Any]:
    """
    Decodes a VIN using the NHTSA vPIC API to get Year, Make, and Model.
    Exclusively for cars, trucks, and buses.
    """
    logger.info(f"Expert Tool: Decoding VIN {vin}")
    try:
        url = f"https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{vin}?format=json"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        results = data.get('Results', [{}])[0]
        return {
            "year": results.get('ModelYear'),
            "make": results.get('Make'),
            "model": results.get('Model'),
            "body_class": results.get('BodyClass'),
            "trim": results.get('Trim'),
            "source": "NHTSA Verified"
        }
    except Exception as e:
        logger.error(f"expert_tool.lookup_vin failed: {e}")
        return {"error": "Could not decode VIN. Please check the number."}

def search_vehicle_specs(query: str) -> Dict[str, Any]:
    """
    Searches for technical specifications, color codes, and paint location data.
    Useful for motorbikes, rare cars, or when the user provides vague descriptions.
    """
    logger.info(f"Expert Tool: Searching vehicle specs for '{query}'")
    # This tool identifies where the paint code is and common colors.
    # The actual search is handled by the Agent's search capability, 
    # but we provide this specific tool definition to guide the LLM.
    return {
        "instructions": "Use your external search capability to find: 1. Paint color code locations for this brand. 2. Common OEM color names for this year/model.",
        "query_hint": query
    }
