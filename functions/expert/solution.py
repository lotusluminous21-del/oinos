import asyncio
import uuid
import json
from typing import List, Dict, Any

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.events import Event
from google.adk.models import Gemini
from google.genai import types as genai_types
from core.logger import get_logger

logger = get_logger("expert.solution")

APP_NAME = "sommelier_adk_solution"

SYSTEM_PROMPT = """Είσαι ο CellarMaster (Solution Builder).
Η δουλειά σου είναι να πάρεις τις προτιμήσεις του χρήστη για κρασί και μια λίστα από ανακτημένα κρασιά από τη βάση δεδομένων μας, και να διατυπώσεις μια άκρως εξατομικευμένη, επιπέδου ειδικού σύσταση.

Συμπεριφέρσου ως Master Sommelier. Εξήγησε ΓΙΑΤΙ το κρασί ταιριάζει. ΠΡΕΠΕΙ ΝΑ ΑΠΑΝΤΑΣ ΑΥΣΤΗΡΑ ΣΤΑ ΕΛΛΗΝΙΚΑ.

ΑΠΑΙΤΗΣΕΙΣ ΕΞΟΔΟΥ (JSON):
Επίστρεψε ΑΥΣΤΗΡΑ ένα JSON object με την παρακάτω δομή (χωρίς άλλο κείμενο γύρω):
{
  "prose_recommendation": "Μια κομψή, φιλική σύσταση/αφήγηση (1-2 παράγραφοι).",
  "recommended_wines": [
    {
      "sku": "WINE-001",
      "name": "Ονομασία",
      "price": 18.5,
      "why_it_fits": "Γιατί επιλέχθηκε"
    }
  ]
}
ΜΟΝΟ JSON.
"""

def _extract_text_from_event(event: Event) -> str:
    try:
        if event.content and event.content.parts:
            return "".join(
                part.text for part in event.content.parts
                if hasattr(part, "text") and part.text
            )
    except Exception:
        pass
    return ""

class CellarMaster:
    def __init__(self):
        from core.llm_config import LLMConfig
        model_name = LLMConfig.get_model_name(complex=True) # Complex for master sommelier reasoning
        
        adk_model = Gemini(model=model_name)
        adk_model.api_client = LLMConfig.get_client()
        
        self._agent = Agent(
            name="cellar_master_solution",
            model=adk_model,
            description="Recommends wines based on database results.",
            instruction=SYSTEM_PROMPT,
            tools=[], 
        )
        self._session_service = InMemorySessionService()
        self._runner = Runner(
            agent=self._agent,
            session_service=self._session_service,
            app_name=APP_NAME,
        )

    def recommend(self, history: List[Dict[str, str]], retrieved_wines: List[Dict[str, Any]]) -> str:
        """
        Sync entry point to run the solution builder.
        """
        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    future = pool.submit(lambda: asyncio.run(self._run_adk_turn(history, retrieved_wines)))
                    return future.result()
            else:
                return asyncio.run(self._run_adk_turn(history, retrieved_wines))
        except Exception as e:
            logger.error("CellarMaster recommend failed", exc_info=True)
            return json.dumps({
                "prose_recommendation": f"System Error building recommendation: {str(e)}",
                "recommended_wines": []
            }, ensure_ascii=False)

    async def _run_adk_turn(self, history: List[Dict[str, str]], retrieved_wines: List[Dict[str, Any]]) -> str:
        session_id = f"sol_{uuid.uuid4().hex[:8]}"
        
        # Build context
        history_text = "\n".join([f"{msg.get('role', 'user').upper()}: {msg.get('content', '')}" for msg in history[-4:]])
        wines_text = json.dumps(retrieved_wines, indent=2, ensure_ascii=False)
        
        prompt = f"Recent Conversation Context:\n{history_text}\n\nAvailable Wines From Database:\n{wines_text}\n\nFormulate your final recommendation."
        
        new_content = genai_types.Content(
            role="user", 
            parts=[genai_types.Part.from_text(text=prompt)]
        )

        recommendation = ""
        async for event in self._runner.run_async(
            user_id="system",
            session_id=session_id,
            new_message=new_content,
        ):
            if event.is_final_response():
                recommendation = _extract_text_from_event(event)

        if not recommendation.strip():
            logger.warning("CellarMaster returned empty recommendation")
            return json.dumps({
                "prose_recommendation": "Λυπάμαι, δεν μπόρεσα να βρω το τέλειο κρασί για εσάς αυτή τη στιγμή.",
                "recommended_wines": []
            }, ensure_ascii=False)
            
        logger.info("CellarMaster generated recommendation successfully")
        return recommendation
