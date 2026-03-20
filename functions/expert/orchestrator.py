import uuid
from datetime import datetime, timezone
import json
from firebase_admin import firestore
from expert.interviewer import SommelierInterviewer
from expert.solution import CellarMaster
from expert.planner import WineQueryPlanner
from expert.retriever import CellarRetriever
from core.logger import get_logger

logger = get_logger("expert.orchestrator")

def run_pipeline(data: dict) -> dict:
    session_id = data.get("sessionId")
    user_id = data.get("userId")
    user_message = data.get("message")
    user_message_id = data.get("messageId")
    
    if not session_id or not user_id or not user_message:
        return {"status": "error", "message": "Missing required fields"}
        
    db = firestore.client()
    session_ref = db.collection("users").document(user_id).collection("expert_sessions").document(session_id)
    doc_snap = session_ref.get()
    
    # Initialize or retrieve history
    if doc_snap.exists:
        session_data = doc_snap.to_dict() or {}
        history = session_data.get("messages", [])
    else:
        history = []

    # 1. Add new user message to history if not present
    now = datetime.now(timezone.utc)
    user_msg_doc = None
    
    if user_message_id and any(m.get("id") == user_message_id for m in history):
        pass # Already synced by client
    else:
        user_msg_doc = {
            "id": user_message_id or str(uuid.uuid4()),
            "role": "user",
            "content": user_message,
            "timestamp": now
        }
        history.append(user_msg_doc)

    # 2. Run Interviewer Logic
    logger.info("Running Interviewer", session_id=session_id)
    interviewer = SommelierInterviewer()
    result = interviewer.process_chat(
        user_message=user_message,
        history=history[:-1], 
        session_id=session_id,
        user_id=user_id,
    )
    
    status = result.get("status")
    ai_response = result.get("answer", "")
    final_messages = []
    if user_msg_doc:
        final_messages.append(user_msg_doc)
    retrieved_wines = []
    wines_metadata = []

    # 3. Routing to Solution Builder (CellarMaster) 
    if status == "transition_to_retrieval":
        logger.info("Transition to retrieval triggered", session_id=session_id)
        
        # Update UI status
        session_ref.set({"agentStatus": "Αναζήτηση στην κάβα..."}, merge=True)
        
        # A. Query Planner
        logger.info("Running Query Planner", session_id=session_id)
        planner = WineQueryPlanner()
        query_json = planner.generate_query(history)
        
        # B. Retriever
        logger.info("Running Retriever", session_id=session_id)
        retriever = CellarRetriever()
        retrieved_wines = retriever.retrieve(history, query_json)

        # C. Solution Builder
        logger.info("Running CellarMaster", session_id=session_id)
        session_ref.set({"agentStatus": "Ετοιμάζω την πρότασή μου..."}, merge=True)
        
        if not retrieved_wines:
            ai_response = "Έχω κατανοήσει πλήρως τις προτιμήσεις σας, αλλά δυστυχώς δεν βρήκα κάποιο κρασί στην κάβα μας που να ταιριάζει απόλυτα αυτή τη στιγμή."
            wines_metadata = []
        else:
            cellar_master = CellarMaster()
            cm_response = cellar_master.recommend(history=history, retrieved_wines=retrieved_wines)
            
            try:
                cm_cleaned = cm_response.strip()
                if cm_cleaned.startswith("```json"):
                    cm_cleaned = cm_cleaned[7:]
                if cm_cleaned.startswith("```"):
                    cm_cleaned = cm_cleaned[3:]
                if cm_cleaned.endswith("```"):
                    cm_cleaned = cm_cleaned[:-3]
                
                parsed_response = json.loads(cm_cleaned.strip())
                ai_response = parsed_response.get("prose_recommendation", cm_response)
                wines_metadata = parsed_response.get("recommended_wines", [])
            except json.JSONDecodeError:
                ai_response = cm_response
                wines_metadata = []
            
        # Clear status
        session_ref.set({"agentStatus": firestore.DELETE_FIELD}, merge=True)

    logger.info("Pipeline complete", session_id=session_id, final_status=status)

    assistant_msg = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": ai_response,
        "timestamp": datetime.now(timezone.utc)
    }
    if wines_metadata:
        assistant_msg["wines"] = wines_metadata
        
    final_messages.append(assistant_msg)
    # Save to Firestore
    session_ref.set({
        "messages": firestore.firestore.ArrayUnion(final_messages),
        "updatedAt": datetime.now(timezone.utc)
    }, merge=True)
    
    return {
        "status": "success",
        "answer": ai_response,
        "debug_wines": [w.get("sku") for w in retrieved_wines]
    }
