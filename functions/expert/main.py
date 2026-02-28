import os
import asyncio
from firebase_functions import https_fn, options
from core.logger import get_logger
from .agent import PaintExpertAgent
from .schema import ExpertChatRequest

logger = get_logger("expert.main")

def expert_chat(req: https_fn.CallableRequest) -> dict:
    """
    Firebase Function endpoint for the Paint Expert Agent.
    """
    try:
        # Validate request data using Pydantic
        chat_req = ExpertChatRequest(**req.data)
        
        # Instantiate agent using the global Vertex AI context configured via core.llm_config
        agent = PaintExpertAgent()
        
        # Execute chat logic (async)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(agent.chat(
            user_message=chat_req.message,
            history=chat_req.history,
            current_state=chat_req.state
        ))
        loop.close()
        
        if hasattr(response, 'dict'):
            return response.dict()
        return response
        
    except Exception as e:
        logger.error(f"expert_chat function failed: {e}", exc_info=True)
        # Fallback ensuring the Frontend doesn't crash from missing schema fields
        return {
            "answer": "Εντοπίστηκε πρόβλημα στο σύστημα κατά την ανάλυση. Μπορείτε να μου δώσετε περισσότερες λεπτομέρειες για να προσπαθήσω ξανά;",
            "suggested_products": [],
            "step_by_step_recipe": [],
            "safety_warnings": [],
            "understanding_summary": None,
            "question": None,
            "clarification_needed": True,
            "ready_for_solution": False,
            "solution": None,
            # Pass back the original state so we don't wipe the user's progress
            "state": chat_req.state.dict() if hasattr(chat_req.state, 'dict') else chat_req.state
        }

def save_expert_project(req: https_fn.CallableRequest) -> dict:
    """
    Saves a generated expert roadmap and user state to Firestore.
    Requires authentication.
    """
    if not req.auth or not req.auth.uid:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="User must be authenticated to save a project."
        )
        
    try:
        from .persistence import save_project_to_firestore
        return save_project_to_firestore(req.auth.uid, req.data)
    except Exception as e:
        logger.error(f"save_expert_project failed: {e}", exc_info=True)
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=str(e)
        )
