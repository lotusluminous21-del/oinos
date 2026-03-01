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
    logger.info(f"Expert Tool: Searching with filters (cat={category}, base={chemical_base}, surf={surfaces}, q={query})")
    try:
        results = client.search_technical_products(
            category=category,
            chemical_base=chemical_base,
            surfaces=surfaces,
            query=query
        )
        logger.info(f"Expert Tool: initial targeted search returned {len(results)} raw products")
        
        if not results and (category or query):
            broad_query = f"{category or ''} {query or ''}".strip()
            logger.warning(f"Expert Tool: 0 results for specific filters. Retrying with broad query: '{broad_query}'")
            results = client.search_technical_products(
                query=broad_query,
                limit=5
            )
            logger.info(f"Expert Tool: broad query returned {len(results)} raw products")
            
        # Simplify results
        simplified = []
        for p in results:
            simplified.append({
                "title": p["title"],
                "handle": p["handle"],
                "category": p["metafields"].get("category", p["product_type"]),
                "chemical_base": p["metafields"].get("chemical_base"),
                "sequence_step": p["metafields"].get("sequence_step"),
                "surfaces": p["metafields"].get("surfaces"),
                "price": p["variants"][0]["price"] if p["variants"] else "0",
                "variant_id": p["variants"][0]["id"] if p["variants"] else None
            })
            
        logger.info(f"Expert Tool: search_products successfully simplified {len(simplified)} products")
        return simplified
    except Exception as e:
        logger.error("expert_tool.search_products failed", exc_info=e)
        return []

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

