import json
from typing import Dict, Any, List
from core.llm_config import LLMConfig
from google.genai import types as genai_types
from core.logger import get_logger

logger = get_logger("expert.planner")

PLANNER_SYSTEM_PROMPT = """Είσαι ένα εσωτερικό σύστημα ανάλυσης δεδομένων για ένα ψηφιακό Sommelier.

Λαμβάνεις ένα ιστορικό συνομιλίας μεταξύ πελάτη και Sommelier.
Η δουλειά σου είναι να εξάγεις τις προτιμήσεις του πελάτη και να επιστρέψεις ΕΝΑ JSON object που θα χρησιμοποιηθεί για αναζήτηση στην κάβα (βάση δεδομένων).

ΑΠΑΙΤΗΣΕΙΣ JSON:
Επίστρεψε ΑΥΣΤΗΡΑ ένα JSON object με την παρακάτω δομή (όλα τα πεδία είναι προαιρετικά, συμπλήρωσε μόνο όσα καταλαβαίνεις από τη συζήτηση με βεβαιότητα):
{
  "colour": "Red" | "White" | "Rosé" | "Orange",
  "type": "Still" | "Sparkling" | "Fortified" | "Dessert",
  "body": "Light" | "Medium" | "Full",
  "food_pairing": "string (π.χ. 'Μοσχάρι', 'Ψάρι', 'Τυρί', 'Ριζότο')",
  "max_budget": number (π.χ. 50)
}

ΜΟΝΟ JSON, κανένα άλλο κείμενο. Παράδειγμα: {"colour": "Red", "body": "Full", "food_pairing": "Μπριζόλα"}
"""

class WineQueryPlanner:
    def __init__(self):
        pass

    def generate_query(self, history: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Generate structured search specifications from a chat transcript.
        """
        model_name = LLMConfig.get_model_name(simple=True) # Flash is faster and fine for JSON extraction
        vertex_client = LLMConfig.get_client()

        chat_transcript = "\n".join([f"{msg.get('role', 'user').upper()}: {msg.get('content', '')}" for msg in history])
        
        user_prompt = f"ΙΣΤΟΡΙΚΟ ΣΥΝΟΜΙΛΙΑΣ:\n{chat_transcript}\n\nΕξήγαγε τις παραμέτρους αναζήτησης σε JSON."

        try:
            response = vertex_client.models.generate_content(
                model=model_name,
                contents=[
                    genai_types.Content(
                        role="user",
                        parts=[genai_types.Part.from_text(text=user_prompt)]
                    )
                ],
                config=genai_types.GenerateContentConfig(
                    system_instruction=PLANNER_SYSTEM_PROMPT,
                    response_mime_type="application/json",
                ),
            )

            output_text = response.text
            if not output_text:
                raise ValueError("Empty response from Query Planner LLM")

            parsed = json.loads(output_text)
            logger.info("Planner generated query", filters=parsed)
            return parsed

        except Exception as e:
            logger.error("Query Planner failed", exc_info=True)
            return {"error": str(e)}
