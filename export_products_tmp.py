import json
import firebase_admin
from firebase_admin import credentials, firestore

def export_products():
    if not firebase_admin._apps:
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
            "category": category,
            "description": ai_data.get("description", "")
        })
    
    with open("products_to_categorize.json", "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"Exported {len(products)} products to products_to_categorize.json")

if __name__ == "__main__":
    try:
        export_products()
    except Exception as e:
        print(f"ERROR: {e}")
