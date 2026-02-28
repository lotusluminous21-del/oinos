import httpx
import json

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
      products(first: 50) {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
    """
    
    response = httpx.post(url, headers=headers, json={"query": query})
    data = response.json()
    
    products = data.get("data", {}).get("products", {}).get("edges", [])
    
    with open("debug_handles.txt", "w", encoding="utf-8") as f:
        f.write(f"Total Products: {len(products)}\n\n")
        for i, edge in enumerate(products):
            node = edge["node"]
            f.write(f"[{i:02}] Title: {node['title']}\n")
            f.write(f"     Handle: {node['handle']}\n")
            f.write("-" * 30 + "\n")

if __name__ == "__main__":
    debug_storefront()
