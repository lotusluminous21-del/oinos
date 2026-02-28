
import os
import json
from functions.shopify.client import ShopifyClient

# Setup environment variables for the client
# (They should be available in the environment already, but let's be safe)

def debug_products():
    client = ShopifyClient()
    
    query = """
    {
      products(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 5) {
              edges {
                node {
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
    
    # Using the protected method for debugging
    result = client._graphql_request(query)
    
    if not result:
        print("Failed to fetch products from Shopify.")
        return

    products = result.get("data", {}).get("products", {}).get("edges", [])
    
    print(f"Found {len(products)} products.\n")
    
    for i, edge in enumerate(products):
        node = edge["node"]
        print(f"[{i}] Title: {node['title']}")
        print(f"    ID: {node['id']}")
        print(f"    Handle: {node['handle']}")
        print(f"    Image: {node['featuredImage']['url'] if node['featuredImage'] else 'MISSING'}")
        print(f"    Price Range Min: {node['priceRange']['minVariantPrice']['amount']} {node['priceRange']['minVariantPrice']['currencyCode']}")
        
        variants = node.get("variants", {}).get("edges", [])
        for v_edge in variants:
            v = v_edge["node"]
            print(f"      Variant SKU: {v['sku']} - Price: {v['price']}")
        print("-" * 40)

if __name__ == "__main__":
    debug_products()
