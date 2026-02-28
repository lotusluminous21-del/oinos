
import os
import sys
import json
import io

# Set stdout/stderr to utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add 'functions' directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
functions_path = os.path.join(current_dir, "functions")
if functions_path not in sys.path:
    sys.path.insert(0, functions_path)

# Manually load .env.local
env_file = os.path.join(current_dir, ".env.local")
if os.path.exists(env_file):
    with open(env_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip().strip('"')

from shopify.client import ShopifyClient

def debug_products():
    client = ShopifyClient()
    
    # GraphQL Query for products including metafields in the 'pavlicevits' namespace
    query = """
    {
      products(first: 5, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            productType
            tags
            metafields(first: 30, namespace: "pavlicevits") {
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
                  sku
                  price
                  title
                }
              }
            }
          }
        }
      }
    }
    """
    
    result = client._graphql_request(query)
    
    if not result:
        print("Failed to fetch products from Shopify.")
        return

    products_data = result.get("data", {}).get("products", {}).get("edges", [])
    
    print(f"Found {len(products_data)} products.\n")
    
    debug_info = []
    for i, edge in enumerate(products_data):
        node = edge["node"]
        metafields = {}
        for m_edge in node.get("metafields", {}).get("edges", []):
            m = m_edge["node"]
            metafields[m["key"]] = {
                "value": m["value"],
                "type": m["type"]
            }
        
        prod_info = {
            "title": node['title'],
            "id": node['id'],
            "handle": node['handle'],
            "productType": node['productType'],
            "tags": node['tags'],
            "metafields": metafields,
            "variants": [v["node"] for v in node.get("variants", {}).get("edges", [])]
        }
        debug_info.append(prod_info)
        
        print(f"[{i}] Title: {node['title']}")
        print(f"    Type: {node['productType']}")
        print(f"    Tags: {json.dumps(node['tags'])}")
        print(f"    Metafields: {json.dumps(metafields, indent=4, ensure_ascii=False)}")
        print("-" * 40)
    
    # Save to file for further analysis
    with open("actual_shopify_products_debug.json", "w", encoding="utf-8") as f:
        json.dump(debug_info, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    debug_products()
