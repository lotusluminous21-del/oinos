
import httpx
import json

def get_env():
    env = {}
    with open(".env.local", "r") as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                key, val = line.strip().split("=", 1).strip()
                env[key] = val.strip('"')
    return env

# Using a more robust env parser
def get_env_robust():
    env = {}
    with open(".env.local", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                env[key.strip()] = val.strip().strip('"')
    return env

def debug_storefront():
    env = get_env_robust()
    domain = env.get("SHOPIFY_STORE_DOMAIN")
    token = env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
    
    url = f"https://{domain}/api/2025-04/graphql.json"
    headers = {
        "X-Shopify-Storefront-Access-Token": token,
        "Content-Type": "application/json"
    }
    
    query = """
    {
      products(first: 100, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
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
    
    print(f"Total Products: {len(products)}\n")
    
    for i, edge in enumerate(products):
        node = edge["node"]
        img = node.get("featuredImage")
        price = node.get("priceRange", {}).get("minVariantPrice", {})
        print(f"[{i:02}] Title: {node['title']}")
        print(f"     Image: {'YES' if img else 'MISSING'}")
        print(f"     Price: {price.get('amount')}")
        print("-" * 30)

if __name__ == "__main__":
    debug_storefront()
