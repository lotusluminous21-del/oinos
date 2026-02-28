
import httpx
import json

# Fetching from .env.local
def get_env():
    env = {}
    with open(".env.local", "r") as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                key, val = line.strip().split("=", 1)
                env[key] = val.strip('"')
    return env

def debug_storefront():
    env = get_env()
    domain = env.get("SHOPIFY_STORE_DOMAIN")
    token = env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
    
    url = f"https://{domain}/api/2025-04/graphql.json"
    headers = {
        "X-Shopify-Storefront-Access-Token": token,
        "Content-Type": "application/json"
    }
    
    query = """
    {
      products(first: 20, sortKey: CREATED_AT, reverse: true) {
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
          }
        }
      }
    }
    """
    
    response = httpx.post(url, headers=headers, json={"query": query})
    data = response.json()
    
    products = data.get("data", {}).get("products", {}).get("edges", [])
    
    print(f"Found {len(products)} products in Storefront API.\n")
    
    for i, edge in enumerate(products):
        node = edge["node"]
        img = node.get("featuredImage")
        price = node.get("priceRange", {}).get("minVariantPrice", {})
        print(f"[{i}] {node['title']}")
        print(f"    Image: {'YES' if img else 'MISSING'}")
        print(f"    Price: {price.get('amount')} {price.get('currencyCode')}")
        print("-" * 20)

if __name__ == "__main__":
    debug_storefront()
