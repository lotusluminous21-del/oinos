import time
from firebase_admin import firestore
from core.logger import get_logger

logger = get_logger("expert.persistence")

def save_project_to_firestore(uid: str, data: dict) -> dict:
    """
    Saves the expert system project state and generated roadmap to the user's Firestore collection.
    """
    try:
        db = firestore.client()
        
        # Use provided ID or generate one
        solution = data.get("solution", {})
        project_id = solution.get("id") or f"proj_{int(time.time() * 1000)}"
        
        doc_ref = db.collection("users").document(uid).collection("projects").document(project_id)
        
        payload = {
            "title": solution.get("title", "New Project"),
            "projectType": solution.get("projectType", "general"),
            "difficulty": solution.get("difficulty", "beginner"),
            "expert_state": data.get("state", {}),
            "solution": solution,
            "status": "active",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        # Check if project exists to prevent replacing created_at
        doc_snap = doc_ref.get()
        if doc_snap.exists:
            payload.pop("created_at", None)
            doc_ref.update(payload)
        else:
            doc_ref.set(payload)
            
        logger.info(f"Successfully saved project {project_id} for user {uid}")
        
        return {"success": True, "project_id": project_id}
    except Exception as e:
        logger.error(f"Failed to save expert project for uid {uid}: {e}", exc_info=True)
        raise e
