
import json
import os
from functions.shopify.client import ShopifyClient

shopify = ShopifyClient()

def check_first_products():
    # Use GraphQL to get the first few products as they would appear on the home page
    query = """
    query {
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
    
    # We need to use the Shopify client's request method
    # Since the client in functions/shopify/client.py might be different, let's check it.
    
    try:
        # Assuming the library is installed and configured
        from functions.shopify.client import ShopifyClient
        client = ShopifyClient()
        # The client usually handles the authentication
        # Let's see if it has a way to run raw queries or if we should use its methods
        pass
    except Exception as e:
        print(f"Error initializing client: {e}")
        return

    # Actually, let's just use the existing methods in the client if possible
    # But get_products in the client might not give us everything.
    
    # Wait, I'll just look at the client implementation first.
    pass

if __name__ == "__main__":
    # check_first_products()
    pass
