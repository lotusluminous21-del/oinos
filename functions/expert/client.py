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
            # Wrap the exact category in quotes for product_type matching
            filter_parts.append(f'(tag:"{category}" OR product_type:"{category}")')
        if query:
            filter_parts.append(query)
            
        search_string = " ".join(filter_parts) if filter_parts else None

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

        logger.info(f"ExpertClient: executing GraphQL search", search_string=search_string, limit=limit)
        
        result = self.core_client._graphql_request(full_query, {"query": search_string, "first": limit})
        if not result:
            logger.warning("ExpertClient: GraphQL request returned empty/None result")
            return []
            
        if "errors" in result:
            logger.error(f"ExpertClient: GraphQL request returned errors", errors=result["errors"])
            
        raw_edges = result.get("data", {}).get("products", {}).get("edges", [])
        logger.info(f"ExpertClient: GraphQL request returned {len(raw_edges)} raw products before post-filtering")
            
        products = []
        filtered_by_base = 0
        filtered_by_surface = 0
        
        for edge in raw_edges:
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
            
            # 1. Chemical Base check (only if product explicitly has a different one)
            if chemical_base:
                prod_base = metafields.get("chemical_base")
                if prod_base and prod_base != chemical_base:
                    match = False
                    filtered_by_base += 1
            
            # 2. Surface Suitability check (only if product explicitly lists surfaces)
            if surfaces and match:
                prod_surfaces_raw = metafields.get("surfaces")
                if prod_surfaces_raw:
                    try:
                        prod_surfaces = json.loads(prod_surfaces_raw)
                        if prod_surfaces and not any(s in prod_surfaces for s in surfaces):
                            match = False
                            filtered_by_surface += 1
                    except:
                        pass # Don't filter on malformed JSON
                        
            if match:
                products.append(prod_data)
                
        if len(raw_edges) > 0:
            logger.info("ExpertClient: post-filtering complete", 
                        kept=len(products), 
                        filtered_by_base=filtered_by_base, 
                        filtered_by_surface=filtered_by_surface)
                
        return products
