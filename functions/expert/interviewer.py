import asyncio
import uuid
from typing import List, Dict, Any, Optional

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.events import Event
from google.adk.models import Gemini
from google.genai import types as genai_types
from core.logger import get_logger

logger = get_logger("expert.interviewer")

APP_NAME = "sommelier_adk_v1"

SYSTEM_PROMPT = """Είσαι ένας Master Sommelier σε βραβευμένο με αστέρι Michelin εστιατόριο (Top Class Establishment). Η συμπεριφορά σου πρέπει να αποπνέει απόλυτη φινέτσα, διακριτικότητα, ταπεινότητα και την υψηλότερη ποιότητα φιλοξενίας (high-end hospitality).

ΡΟΛΟΣ: Elite Conversational Expert & Interviewer
ΔΕΝ ΕΧΕΙΣ πρόσβαση στην κάβα μας ακόμα. Η μόνη σου δουλειά είναι να καταλάβεις το context (φαγητό, περίσταση, budget) για να ψάξεις στην κάβα, διατηρώντας πάντα το επίπεδο ενός κορυφαίου εστιατορίου. 

### ΑΥΣΤΗΡΟΙ ΚΑΝΟΝΕΣ & ΠΕΡΙΟΡΙΣΜΟΙ (CRITICAL RULES)
1. ΥΦΟΣ & ΧΑΡΑΚΤΗΡΑΣ: Μίλα αυστηρά στον πληθυντικό ευγενείας. Χρησιμοποίησε λέξεις που αποπνέουν φιλοξενία και κομψότητα (π.χ. "Χαίρετε", "Θα ήταν μεγάλη μου χαρά να σας εξυπηρετήσω", "Εξαιρετική επιλογή").
2. ΑΠΑΓΟΡΕΥΕΤΑΙ Η ΑΝΑΚΡΙΣΗ: ΠΟΤΕ μην ρωτάς τον πελάτη για το τι κρασί του αρέσει (π.χ. λευκό/κόκκινο, φρουτώδες/ξηρό) ΑΝ σου έχει ήδη πει ότι δεν γνωρίζει ή ότι ζητάει την καθοδήγησή σου.
3. ΑΝΑΛΑΒΕ ΔΡΑΣΗ: Αν ο πελάτης πει "δεν ξέρω" ή "τι προτείνεις εσύ;", ΣΤΑΜΑΤΑ τις ερωτήσεις. Βγάλε εσύ το συμπέρασμα με την εμπειρία σου και ΚΑΛΕΣΕ ΑΜΕΣΩΣ το εργαλείο `search_cellar`.
4. ΑΠΑΓΟΡΕΥΕΤΑΙ Η ΕΠΑΝΑΛΗΨΗ: Μην επαναλαμβάνεις τα ίδια πράγματα. Πήγαινε τη συζήτηση μπροστά με χάρη.
5. ΟΡΟΛΟΓΙΑ: ΜΗΝ χρησιμοποιείς ορολογία (τανίνες, σώμα, οξύτητα) αν δεν την χρησιμοποιήσει πρώτος ο πελάτης. Εξήγησε τις γεύσεις με απλές, ποιητικές και κομψές εικόνες.
6. ΜΑΡΚΕΣ: ΠΟΤΕ μην αναφέρεις συγκεκριμένα κρασιά ακόμα. Δεν ξέρεις τι έχουμε στην κάβα.

### ΣΤΟΧΟΣ (ΤΙ ΨΑΧΝΟΥΜΕ)
ΔΕΝ χρειάζεται να τα ρωτήσεις όλα. Αν έχεις έστω ΕΝΑ από τα παρακάτω, μπορείς να ψάξεις:
- Φαγητό (Food Pairing)
- Περίσταση ή Διάθεση (π.χ. "χαλαρό βράδυ", "ρομαντικό δείπνο", "δώρο")
- Προϋπολογισμός (Budget - προαιρετικό)

### ΠΑΡΑΔΕΙΓΜΑ ΣΩΣΤΗΣ ΣΥΜΠΕΡΙΦΟΡΑΣ (FEW-SHOT EXAMPLE)
User: Ψάχνω κρασί για καρμπονάρα.
Sommelier: Η καρμπονάρα είναι μια εξαιρετική, κλασική επιλογή. Θα προτιμούσατε να κινηθούμε σε λευκό, ή κόκκινο, ή θα θέλατε να σας προτείνω εγώ το ιδανικό ταίριασμα για τη βραδιά;
User: Δεν ξέρω, πες μου εσύ.
Sommelier: Με μεγάλη μου χαρά. Η πλούσια, βελούδινη υφή της καρμπονάρας ζητάει ένα δροσερό λευκό κρασί με ευχάριστη οξύτητα για να εξισορροπήσει τον ουρανίσκο. Επιτρέψτε μου μια στιγμή να αναζητήσω τις καλύτερες επιλογές από την κάβα μας για εσάς! [ΚΑΛΕΙ ΤΟ TOOL: search_cellar]

### ΟΛΟΚΛΗΡΩΣΗ & ΜΕΤΑΒΑΣΗ
Όταν έχεις το context, ΥΠΟΧΡΕΩΤΙΚΑ πρέπει να καλέσεις το εργαλείο `search_cellar`. Το εργαλείο είναι ο ΜΟΝΟΣ τρόπος να προχωρήσει η διαδικασία.

Θυμήσου: Είσαι ο ειδικός. Αν ο πελάτης ζητάει βοήθεια, μην τον ρωτάς τι θέλει, πες του τι χρειάζεται και ψάξε την κάβα!
"""

def search_cellar(ready: bool) -> dict:
    """
    Call this tool ONLY when you have fully understood the customer's wine needs 
    (occasion, food pairing, budget, taste preferences) and you are ready to search the cellar for recommendations.
    
    Args:
        ready: Set to True when you are ready to consult the cellar.
    """
    return {"status": "transition_triggered"}


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

class SommelierInterviewer:
    def __init__(self):
        from core.llm_config import LLMConfig
        model_name = LLMConfig.get_model_name(simple=True) # Use simple/flash for conversation
        
        adk_model = Gemini(model=model_name)
        adk_model.api_client = LLMConfig.get_client()

        self._agent = Agent(
            name="sommelier_interviewer",
            model=adk_model,
            description="Expert sommelier interviewer agent.",
            instruction=SYSTEM_PROMPT,
            tools=[search_cellar],
            generate_content_config=genai_types.GenerateContentConfig(
                tool_config=genai_types.ToolConfig(
                    function_calling_config=genai_types.FunctionCallingConfig(
                        mode="AUTO"
                    )
                )
            ),
        )
        self._session_service = InMemorySessionService()
        self._runner = Runner(
            agent=self._agent,
            session_service=self._session_service,
            app_name=APP_NAME,
        )

    def process_chat(
        self,
        user_message: str,
        history: Optional[List[Dict[str, str]]] = None,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Sync entry point to run the interviewer loop.
        """
        if history is None:
            history = []

        eff_session_id = session_id or "default_sess"
        eff_user_id = user_id or "default_user"

        logger.info("Interviewer process_chat started", session_id=eff_session_id, user_message=user_message[:50])

        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                # Event loop is already running in this thread (e.g. Firebase emulator or Cloud Run)
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    future = pool.submit(lambda: asyncio.run(self._run_adk_turn(
                        user_message, history, eff_session_id, eff_user_id
                    )))
                    return future.result()
            else:
                return asyncio.run(self._run_adk_turn(
                    user_message, history, eff_session_id, eff_user_id
                ))
        except Exception as e:
            logger.error("Interviewer process_chat failed", exc_info=True)
            raise e

    async def _run_adk_turn(
        self,
        user_message: str,
        history: List[Dict[str, str]],
        eff_session_id: str,
        eff_user_id: str,
    ) -> Dict[str, Any]:
        turn_session_id = f"{eff_session_id}_{uuid.uuid4().hex[:8]}"

        session = await self._session_service.create_session(
            app_name=APP_NAME,
            user_id=eff_user_id,
            session_id=turn_session_id,
        )

        # Seed history
        for msg in history:
            role = msg.get("role", "user")
            content_text = msg.get("content", "")
            if not content_text:
                continue
            adk_role = "user" if role == "user" else "model"
            content = genai_types.Content(
                role=adk_role, 
                parts=[genai_types.Part.from_text(text=content_text)]
            )
            evt = Event(
                invocation_id=f"hist_{uuid.uuid4().hex[:8]}",
                author=adk_role,
                content=content,
            )
            await self._session_service.append_event(session, evt)

        # Build current turn
        new_content = genai_types.Content(
            role="user", 
            parts=[genai_types.Part.from_text(text=user_message)]
        )

        result = {"status": "chat", "answer": ""}
        
        async for event in self._runner.run_async(
            user_id=eff_user_id,
            session_id=turn_session_id,
            new_message=new_content,
        ):
            if event.is_final_response():
                text = _extract_text_from_event(event)
                if text:
                    result["answer"] = text

            fn_calls = event.get_function_calls() or []
            for fn_call in fn_calls:
                if fn_call.name == "search_cellar":
                    result["status"] = "transition_to_retrieval"
                    # Capture any text generated along with the tool call
                    text = _extract_text_from_event(event)
                    if text:
                        result["answer"] = text.strip()
                    if not result["answer"].strip():
                        result["answer"] = "Εξαιρετικά! Αφήστε με να ψάξω στην κάβα μας..."
                    logger.info("Interviewer triggered transition to retrieval", answer=result["answer"])
                    return result

        if not result.get("answer") and result.get("status") != "transition_to_retrieval":
            result["answer"] = "Συγγνώμη, δεν μπόρεσα να το καταλάβω αυτό. Μπορείτε να το επαναλάβετε;"
            logger.warning("Interviewer triggered fallback message")

        return result
