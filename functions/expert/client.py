import json
from typing import List, Dict, Any, Optional
from shopify.client import ShopifyClient
from core.logger import get_logger

logger = get_logger("expert.client")

class ExpertShopifyClient:
    """
    Dedicated client for the Expert System.
    Wraps the core ShopifyClient to provide specialized technical searches.
    """
    def __init__(self):
        self.core_client = ShopifyClient()

    def search_technical_products(
        self, 
        category: Optional[str] = None, 
        chemical_base: Optional[str] = None, 
        surfaces: Optional[List[str]] = None,
        query: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Advanced search for products using technical filters (metafields).
        """
        filter_parts = []
        if category:
            filter_parts.append(f'tag:{category} OR product_type:{category}')
        if query:
            filter_parts.append(query)
            
        full_query = """
        query($query: String, $first: Int) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                tags
                productType
                metafields(first: 20, namespace: "pavlicevits") {
                  edges {
                    node {
                      key
                      value
                      type
                    }
                  }
                }
                variants(first: 5) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                    }
                  }
                }
              }
            }
          }
        }
        """
        
        search_string = " AND ".join(filter_parts) if filter_parts else None
        
        result = self.core_client._graphql_request(full_query, {"query": search_string, "first": limit})
        if not result:
            return []
            
        products = []
        for edge in result.get("data", {}).get("products", {}).get("edges", []):
            node = edge["node"]
            
            # Extract metafields
            metafields = {}
            for m_edge in node.get("metafields", {}).get("edges", []):
                m = m_edge["node"]
                metafields[m["key"]] = m["value"]
            
            prod_data = {
                "id": node["id"],
                "title": node["title"],
                "handle": node["handle"],
                "tags": node["tags"],
                "product_type": node["productType"],
                "metafields": metafields,
                "variants": [v["node"] for v in node.get("variants", {}).get("edges", [])]
            }
            
            # Post-retrieval filtering for technical precision
            match = True
            if chemical_base:
                if metafields.get("chemical_base") != chemical_base:
                    match = False
            
            if surfaces and match:
                prod_surfaces_raw = metafields.get("surfaces", "[]")
                try:
                    prod_surfaces = json.loads(prod_surfaces_raw)
                    # Check if any of the requested surfaces are in the product suitability list
                    if not any(s in prod_surfaces for s in surfaces):
                        match = False
                except:
                    match = False
                    
            if match:
                products.append(prod_data)
                
        return products
