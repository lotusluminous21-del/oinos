
import httpx
import json

def get_env():
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

def debug_storefront_titles():
    env = get_env()
    domain = env.get("SHOPIFY_STORE_DOMAIN")
    # Using STOREFRONT token this time
    token = env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
    
    url = f"https://{domain}/api/2025-04/graphql.json"
    headers = {
        "X-Shopify-Storefront-Access-Token": token,
        "Content-Type": "application/json"
    }
    
    # Exactly matching Home page query
    query = """
    query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
            }
          }
        }
      }
    }
    """
    
    variables = {
        "first": 100,
        "sortKey": "CREATED_AT",
        "reverse": True
    }
    
    response = httpx.post(url, headers=headers, json={"query": query, "variables": variables})
    data = response.json()
    
    if "errors" in data:
        print("ERRORS:", data["errors"])
        return

    products = data.get("data", {}).get("products", {}).get("edges", [])
    
    print(f"Total Products: {len(products)}\n")
    for i, edge in enumerate(products):
        node = edge["node"]
        print(f"[{i:02}] {node['title']}")
        print(f"     Image: {'YES' if node['featuredImage'] else 'NO'}")
    
if __name__ == "__main__":
    debug_storefront_titles()
