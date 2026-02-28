import os
import firebase_admin
from firebase_admin import credentials, firestore

def list_products():
    # Initialize Firebase Admin if not already initialized
    if not firebase_admin._apps:
        # Try to find a service account key or use default credentials
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    docs = db.collection("staging_products").stream()
    
    products = []
    for doc in docs:
        data = doc.to_dict()
        sku = doc.id
        ai_data = data.get("ai_data", {})
        title = ai_data.get("title", data.get("name", "No Title"))
        category = ai_data.get("category", "No Category")
        products.append({
            "sku": sku,
            "title": title,
            "category": category
        })
    
    print("--- START PRODUCT LIST ---")
    for p in products:
        print(f"SKU: {p['sku']} | Category: {p['category']} | Title: {p['title']}")
    print("--- END PRODUCT LIST ---")

if __name__ == "__main__":
    try:
        list_products()
    except Exception as e:
        print(f"ERROR: {e}")
