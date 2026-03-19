from firebase_functions import https_fn, options, firestore_fn
from firebase_admin import initialize_app
import os

# Initialize app
try:
    initialize_app()
except ValueError:
    pass

# --- 1. Sommelier Expert Chat Callable ---
@https_fn.on_call(region="europe-west1", memory=options.MemoryOption.MB_512, timeout_sec=300)
def chat_sommelier(req: https_fn.CallableRequest) -> dict:
    """
    Main endpoint for the Flutter app to chat with the Sommelier AI.
    """
    try:
        if not req.auth or not req.auth.uid:
            return {"status": "error", "message": "Unauthenticated access"}
            
        from expert.orchestrator import run_pipeline
        # Pass the request data to the expert orchestrator, but forcefully override userId
        req_data = req.data if isinstance(req.data, dict) else {}
        req_data["userId"] = req.auth.uid
        
        return run_pipeline(req_data)
    except Exception as e:
        print(f"Error in chat_sommelier wrapper: {e}")
        return {"status": "error", "message": str(e)}

# --- 2. Lab Wine Enrichment Callable ---
@https_fn.on_call(region="europe-west1", memory=options.MemoryOption.MB_512, timeout_sec=540)
def enrich_wine_batch(req: https_fn.CallableRequest) -> dict:
    """
    Admin endpoint to trigger AI enrichment for specific wine SKUs.
    """
    try:
        skus = req.data.get("skus", [])
        if not skus:
            return {"error": "Missing SKUs"}
            
        from lab.enrichment import start_enrichment_session
        return start_enrichment_session(skus)
    except Exception as e:
        print(f"Error in enrich_wine_batch wrapper: {e}")
        return {"status": "error", "message": str(e)}

# --- 3. Lab Wine Background Sync Trigger ---
@firestore_fn.on_document_written(
    document="wines/{sku}",
    region="europe-west1",
    memory=options.MemoryOption.MB_256
)
def process_wine_updates(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]) -> None:
    """
    Optional: Triggered when a wine document is updated in Firestore.
    Could be used for vector embeddings/RAG indexing.
    """
    try:
        from lab.indexer import process_wine_update
        process_wine_update(event)
    except Exception as e:
        print(f"Error in process_wine_updates wrapper: {e}")
