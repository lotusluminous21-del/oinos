import firebase_admin
from firebase_admin import credentials, firestore

def inspect_firestore():
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    collections = db.collections()
    
    print("--- FIRESTORE INSPECTION ---")
    for coll in collections:
        docs = list(coll.stream())
        print(f"Collection: {coll.id} | Count: {len(docs)}")
        if coll.id in ["staging_products", "products"]:
            for doc in docs:
                data = doc.to_dict()
                ai_data = data.get("ai_data", {})
                title = ai_data.get("title", data.get("name", "No Title"))
                category = ai_data.get("category", "No Category")
                print(f"  [{coll.id}] SKU: {doc.id} | Category: {category} | Title: {title}")
    print("--- END INSPECTION ---")

if __name__ == "__main__":
    try:
        inspect_firestore()
    except Exception as e:
        print(f"ERROR: {e}")
