import firebase_admin
from firebase_admin import credentials, firestore

# Mapping of SKU to new Category
UPGRADE_MAPPING = {
    "HB015205": "Αστάρια & Υποστρώματα",
    "HB090503": "Βερνίκια & Φινιρίσματα",
    "HB090640": "Βερνίκια & Φινιρίσματα",
    "HB100601": "Χρώματα Βάσης",
    "HB100803": "Αστάρια & Υποστρώματα", # Underbody protection is a substrate layer
    "HB100889": "Βερνίκια & Φινιρίσματα",
    "HB100890": "Χρώματα Βάσης",
    "HB100901": "Προετοιμασία & Καθαρισμός", # Cavity wax is protection/prep
    "HB101101": "Αστάρια & Υποστρώματα",
    "HB101201": "Αστάρια & Υποστρώματα",
    "HB101401": "Αστάρια & Υποστρώματα",
    "HB101501": "Χρώματα Βάσης",
    "HB101502": "Χρώματα Βάσης",
    "HB101601": "Αστάρια & Υποστρώματα",
    "HB101701": "Αστάρια & Υποστρώματα",
    "HB101801": "Αστάρια & Υποστρώματα",
    "HB101901": "Διαλυτικά & Αραιωτικά",
    "HB102001": "Προετοιμασία & Καθαρισμός",
    "HB103101": "Αστάρια & Υποστρώματα"
}

def update_products():
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    collection_ref = db.collection("staging_products")
    
    updated_count = 0
    for sku, new_category in UPGRADE_MAPPING.items():
        doc_ref = collection_ref.document(sku)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            ai_data = data.get("ai_data", {})
            
            # Update category
            ai_data["category"] = new_category
            
            # Update document
            doc_ref.update({
                "ai_data": ai_data,
                "status": "PENDING_METADATA_REVIEW" # Reset to review so user can see changes
            })
            print(f"Updated {sku} -> {new_category}")
            updated_count += 1
        else:
            print(f"SKU {sku} not found in staging_products")
    
    print(f"\nFinished. Updated {updated_count} products.")

if __name__ == "__main__":
    try:
        update_products()
    except Exception as e:
        print(f"ERROR: {e}")
