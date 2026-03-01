# functions/expert_v2/conversationalist.py — synchronous version
# Owns: Warm Greek conversational text generation.
# temperature=0.7, <=2 sentences. Never makes structural decisions.

from __future__ import annotations
from google import genai
from google.genai import types

from .question_bank import QUESTIONS
from core.logger import get_logger
from core.llm_config import LLMConfig

log = get_logger("expert_v2.conversationalist")

_MODEL_CONVERSE = LLMConfig.get_model_name(complex=False)  # gemini-2.5-flash-lite

SYSTEM_PROMPT = """
Είσαι ένας φιλικός και έμπειρος ειδικός βαφής που βοηθά πελάτες στα Ελληνικά.

ΚΑΝΟΝΕΣ:
- Μέγιστο 1-2 προτάσεις
- Πάντα στα Ελληνικά  
- Επιβεβαίωσε αυτό που κατάλαβες, αν υπάρχει κάτι νέο
- ΜΗΝ επαναλαμβάνεις ολόκληρη την ερώτηση — η κάρτα επιλογών εμφανίζεται αυτόματα
- ΜΗΝ αναφέρεις προϊόντα ή τιμές
- Μην χρησιμοποιείς emojis
"""


def generate_response_sync(
    newly_confirmed: dict,
    next_question_id: str | None,
    next_question_text: str | None,
    is_ready: bool,
    client: genai.Client,
    history: list[dict] | None = None,
    confirmed_facts: dict | None = None,
) -> str:
    """
    Synchronous generation of a warm Greek 1-2 sentence acknowledgment.
    Grounded in actual confirmed facts — never hallucinates context.
    """
    # Summarize what we now know
    facts_summary = []
    for k, v in (newly_confirmed or {}).items():
        facts_summary.append(f"{k}={v}")
    facts_str = ", ".join(facts_summary) if facts_summary else ""

    # Total known facts (to frame how far along we are)
    total_known = len(confirmed_facts or {})

    if is_ready:
        prompt = f"""Ο χρήστης έδωσε όλες τις πληροφορίες (σύνολο: {total_known}).
Νέα στοιχεία: {facts_str or 'κανένα νέο'}.
Γράψε ΜΙΑ ζεστή πρόταση στα Ελληνικά: επιβεβαίωσε την ολοκλήρωση και πες ότι ετοιμάζεις το πλάνο."""
    elif next_question_text:
        prompt = f"""Ο χρήστης απάντησε{'· μάθαμε: ' + facts_str if facts_str else ''}.
Επόμενη ερώτηση: "{next_question_text}"
Γράψε ΜΙΑ σύντομη, φυσική πρόταση στα Ελληνικά που επιβεβαιώνει την απάντηση ΚΑΙ κάνει την επόμενη ερώτηση με φυσικό τρόπο.
ΑΠΟΦΥΓΕ το meta-talk όπως "θα προχωρήσουμε στην επόμενη ερώτηση".
Παράδειγμα: "Ωραία! Και τι υλικό είναι η επιφάνεια που θα βάψετε;" (αν η ερώτηση είναι για υλικό)."""
    else:
        prompt = f"""Ο χρήστης απάντησε. Νέα στοιχεία: {facts_str or 'κανένα νέο'}.
Γράψε ΜΙΑ ζεστή, σύντομη πρόταση στα Ελληνικά."""

    try:
        response = client.models.generate_content(
            model=_MODEL_CONVERSE,
            contents=[prompt],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.7,
                max_output_tokens=128,
            )
        )
        text = response.text.strip()
        log.info("conversationalist: generated", preview=text[:80], is_ready=is_ready)
        return text
    except Exception as e:
        log.error("conversationalist: LLM failed", exc_info=e)
        if is_ready:
            return "Εξαιρετικά! Έχω όλες τις πληροφορίες που χρειάζομαι."
        elif next_question_id:
            return "Εντάξει! Χρειάζομαι ακόμα μία πληροφορία."
        return "Κατάλαβα!"
