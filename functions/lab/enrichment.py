def start_enrichment_session(skus: list) -> dict:
    """
    Trigger AI enrichment for the given wine SKUs.
    """
    from firebase_admin import firestore
    
    db = firestore.client()
    batch = db.batch()
    
    for sku in skus:
        wine_ref = db.collection("wines").document(sku)
        # Mark as pending enrichment
        batch.set(wine_ref, {
            "enrichment_status": "PENDING",
            "enrichment_message": "Queued for lab processing..."
        }, merge=True)
        
    batch.commit()
    
    return {
        "status": "success",
        "message": f"Queued {len(skus)} wines for enrichment."
    }
