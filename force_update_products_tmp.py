import firebase_admin
from firebase_admin import credentials, firestore

UPGRADE_MAPPING = {
    "HB015205": "Αστάρια & Υποστρώματα",
    "HB090503": "Βερνίκια & Φινιρίσματα",
    "HB090640": "Βερνίκια & Φινιρίσματα",
    "HB100601": "Χρώματα Βάσης",
    "HB100803": "Αστάρια & Υποστρώματα",
    "HB100889": "Βερνίκια & Φινιρίσματα",
    "HB100890": "Χρώματα Βάσης",
    "HB100901": "Προετοιμασία & Καθαρισμός",
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

def force_update():
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    collection_ref = db.collection("staging_products")
    
    print("--- START FORCE UPDATE ---")
    for sku, new_category in UPGRADE_MAPPING.items():
        doc_ref = collection_ref.document(sku)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            ai_data = data.get("ai_data", {})
            current_cat = ai_data.get("category")
            
            # Update fields
            ai_data["category"] = new_category
            
            doc_ref.update({
                "ai_data": ai_data,
                "status": "READY_FOR_PUBLISH",
                "enrichment_message": f"Auto-categorized to {new_category}. System fix applied."
            })
            print(f"SKU: {sku} | Old: {current_cat} | New: {new_category} | Status: READY_FOR_PUBLISH")
        else:
            print(f"SKU: {sku} NOT FOUND")
    print("--- END FORCE UPDATE ---")

if __name__ == "__main__":
    try:
        force_update()
    except Exception as e:
        print(f"ERROR: {e}")
