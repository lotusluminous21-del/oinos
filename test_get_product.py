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

def test():
    env = get_env_robust()
    domain = env.get("SHOPIFY_STORE_DOMAIN")
    token = env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
    
    url = f"https://{domain}/api/2025-04/graphql.json"
    headers = {
        "X-Shopify-Storefront-Access-Token": token,
        "Content-Type": "application/json"
    }
    
    query = """
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        title
        handle
      }
    }
    """
    
    handle = "hb-body-εποξειδικό-αστάρι-σπρέι-γκρι-p981"
    
    print(f"Testing handle: {handle}")
    response = httpx.post(url, headers=headers, json={
        "query": query,
        "variables": {"handle": handle}
    })
    
    print("Response:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    test()
