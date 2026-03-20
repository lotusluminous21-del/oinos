"""
Quiz Engine — Dynamic, LLM-driven wine quiz with MCDA scoring.

Two main entry points:
  1. initialize_quiz(store_id) → first QuizQuestion
  2. next_question(session_id, answer) → next QuizQuestion OR QuizResult
"""

import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from firebase_admin import firestore
from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure

from core.llm_config import LLMConfig
from core.logger import get_logger
from google.genai import types as genai_types

logger = get_logger("expert.quiz_engine")

# ── System Prompt for the Quiz Orchestrator ──────────────────────────────

QUIZ_ORCHESTRATOR_PROMPT = """Είσαι ένας Master Sommelier σε βραβευμένο με αστέρι Michelin εστιατόριο.
Η δουλειά σου είναι να δημιουργείς ερωτήσεις σε μορφή quiz (multiple-choice) για να καταλάβεις τι κρασί ταιριάζει στον πελάτη.

ΚΑΝΟΝΕΣ:
1. Κάθε απάντησή σου ΠΡΕΠΕΙ να είναι ΑΥΣΤΗΡΑ JSON, χωρίς κανένα επιπλέον κείμενο.
2. Μπορείς να δημιουργήσεις ΟΣΕΣ ερωτήσεις χρειαστεί (2-8 τυπικά) — σταμάτα ΜΟΝΟ όταν έχεις αρκετές πληροφορίες.
3. Κάθε ερώτηση πρέπει να έχει 2-5 επιλογές που ο χρήστης θα πατήσει (ΧΩΡΙΣ πληκτρολόγηση).
4. ΜΗΝ εμφανίζεις επιλογές που δεν αντιστοιχούν σε διαθέσιμα κρασιά στο κατάστημα.
5. ΜΗΝ ρωτάς κάτι αν η απάντηση είναι προφανής (π.χ. αν υπάρχουν μόνο κόκκινα κρασιά, μην ρωτάς χρώμα).
6. Κάθε ερώτηση πρέπει να περιορίζει σημαντικά τα αποτελέσματα.
7. Χρησιμοποίησε ζεστό, κομψό ύφος στα Ελληνικά (πληθυντικό ευγενείας).
8. Πάντα να συμπεριλαμβάνεις μία "ανοιχτή" / "δεν έχω προτίμηση" / "surprise me" επιλογή.

ΜΟΡΦΗ JSON ΓΙΑ ΝΕΑ ΕΡΩΤΗΣΗ:
{
  "type": "question",
  "question": {
    "id": "unique_id",
    "title": "Κύριο κείμενο ερώτησης",
    "subtitle": "Προαιρετική σύντομη επεξήγηση",
    "dimension": "occasion|food|colour|body|budget|taste|style",
    "options": [
      {"id": "opt_1", "label": "Κείμενο επιλογής", "emoji": "🍷", "description": "Σύντομη περιγραφή"},
      ...
    ]
  }
}

ΜΟΡΦΗ JSON ΟΤΑΝ ΕΙΣΑΙ ΕΤΟΙΜΟΣ ΝΑ ΠΡΟΤΕΙΝΕΙΣ:
{
  "type": "ready_to_recommend",
  "search_context": "Μία σύντομη περίληψη προτιμήσεων πελάτη για αναζήτηση στην κάβα"
}
"""


def _build_inventory_summary(wines: List[Dict[str, Any]]) -> str:
    """Build a compact inventory summary for the AI."""
    colours = set()
    types = set()
    bodies = set()
    prices = []
    food_pairings = set()
    varietals = set()

    for w in wines:
        if w.get("colour"):
            colours.add(w["colour"])
        if w.get("type"):
            types.add(w["type"])
        if w.get("body"):
            bodies.add(w["body"])
        if w.get("price"):
            try:
                prices.append(float(w["price"]))
            except (ValueError, TypeError):
                pass
        for fp in w.get("food_pairing", []):
            food_pairings.add(fp)
        for v in w.get("varietal_makeup", []):
            varietals.add(v)

    price_min = min(prices) if prices else 0
    price_max = max(prices) if prices else 0

    return (
        f"ΔΙΑΘΕΣΙΜΟ ΑΠΟΘΕΜΑ ({len(wines)} κρασιά):\n"
        f"- Χρώματα: {', '.join(sorted(colours)) or 'N/A'}\n"
        f"- Τύποι: {', '.join(sorted(types)) or 'N/A'}\n"
        f"- Σώμα: {', '.join(sorted(bodies)) or 'N/A'}\n"
        f"- Εύρος τιμών: €{price_min:.0f} - €{price_max:.0f}\n"
        f"- Ποικιλίες: {', '.join(sorted(varietals)) or 'N/A'}\n"
        f"- Food pairing tags: {', '.join(sorted(food_pairings)) or 'N/A'}\n"
    )


def _fetch_store_wines(db, store_id: str) -> List[Dict[str, Any]]:
    """Fetch wines available in a specific store."""
    store_ref = db.collection("stores").document(store_id)
    store_doc = store_ref.get()
    
    if not store_doc.exists:
        logger.warning("Store not found, falling back to all wines", store_id=store_id)
        # Fallback: return all wines
        all_docs = db.collection("wines").limit(50).get()
        return [_clean_wine(d.to_dict()) for d in all_docs]
    
    store_data = store_doc.to_dict()
    wine_skus = store_data.get("wine_skus", [])
    
    if not wine_skus:
        logger.warning("Store has no wine_skus", store_id=store_id)
        return []
    
    # Batch fetch wines by SKU
    wines = []
    for sku in wine_skus:
        doc = db.collection("wines").document(sku).get()
        if doc.exists:
            wines.append(_clean_wine(doc.to_dict()))
    
    logger.info("Fetched store wines", store_id=store_id, count=len(wines))
    return wines


def _clean_wine(wine: Dict[str, Any]) -> Dict[str, Any]:
    """Remove embedding and other large fields for processing."""
    w = dict(wine)
    w.pop("embedding", None)
    return w


def _call_llm(client, model_name: str, system_prompt: str, user_prompt: str) -> str:
    """Call Gemini with JSON response format."""
    response = client.models.generate_content(
        model=model_name,
        contents=[
            genai_types.Content(
                role="user",
                parts=[genai_types.Part.from_text(text=user_prompt)]
            )
        ],
        config=genai_types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
        ),
    )
    return response.text or ""


def _mcda_score(wine: Dict[str, Any], answers: List[Dict[str, Any]]) -> float:
    """
    Multi-Criteria Decision Analysis scoring.
    Each answered dimension contributes a weighted score.
    """
    score = 0.0
    
    for ans in answers:
        dimension = ans.get("dimension", "")
        label = ans.get("label", "").lower()
        option_id = ans.get("option_id", "")
        
        # Skip "no preference" / wildcard answers
        if "surprise" in label or "προτίμηση" in label or "εκπλήξτε" in label:
            continue
        
        if dimension == "colour":
            colour_map = {
                "κόκκινο": "Red", "red": "Red",
                "λευκό": "White", "white": "White",
                "ροζέ": "Rosé", "rosé": "Rosé", "rose": "Rosé",
                "αφρώδες": "Sparkling", "sparkling": "Sparkling",
            }
            for key, val in colour_map.items():
                if key in label and wine.get("colour") == val:
                    score += 3.0
                    break
                    
        elif dimension == "body":
            body_map = {
                "ελαφρ": "Light", "light": "Light",
                "μέτρι": "Medium", "medium": "Medium",
                "πλούσι": "Full", "δυνατ": "Full", "full": "Full",
            }
            for key, val in body_map.items():
                if key in label and wine.get("body") == val:
                    score += 2.0
                    break
                    
        elif dimension == "budget":
            try:
                price = float(wine.get("price", 0))
                # Try to extract budget range from label
                import re
                numbers = re.findall(r'\d+', label)
                if len(numbers) >= 2:
                    low, high = float(numbers[0]), float(numbers[1])
                    if low <= price <= high:
                        score += 2.5
                elif len(numbers) == 1:
                    limit = float(numbers[0])
                    if "+" in label or "πάνω" in label:
                        if price >= limit:
                            score += 2.5
                    else:
                        if price <= limit:
                            score += 2.5
            except (ValueError, TypeError):
                pass
                
        elif dimension == "food":
            # Check food pairing overlap
            food_pairings = [fp.lower() for fp in wine.get("food_pairing", [])]
            if any(keyword in " ".join(food_pairings) for keyword in label.split()):
                score += 2.5
                
        elif dimension == "type":
            type_map = {
                "αφρώδες": "Sparkling", "sparkling": "Sparkling",
                "ενισχυμένο": "Fortified", "fortified": "Fortified",
                "γλυκό": "Dessert", "dessert": "Dessert",
            }
            for key, val in type_map.items():
                if key in label and wine.get("type") == val:
                    score += 2.0
                    break
        
        # Generic text match for other dimensions
        elif dimension in ("occasion", "taste", "style"):
            raw_desc = wine.get("raw_description", "").lower()
            tasting = json.dumps(wine.get("tasting_notes", {}), ensure_ascii=False).lower()
            combined = raw_desc + " " + tasting
            words = [w for w in label.split() if len(w) > 2]
            matches = sum(1 for w in words if w in combined)
            if matches > 0:
                score += min(matches * 0.5, 2.0)
    
    return score


def initialize_quiz(data: dict) -> dict:
    """
    Initialize a new quiz session.
    Returns the first question with options based on store inventory.
    """
    store_id = data.get("storeId", "default")
    
    db = firestore.client()
    client = LLMConfig.get_client()
    model = LLMConfig.get_model_name(simple=True)
    
    # 1. Fetch store wines
    wines = _fetch_store_wines(db, store_id)
    if not wines:
        return {"status": "error", "message": "Δεν βρέθηκαν κρασιά σε αυτό το κατάστημα."}
    
    # 2. Build inventory summary
    inventory_summary = _build_inventory_summary(wines)
    
    # 3. Generate first question
    prompt = (
        f"{inventory_summary}\n\n"
        "Αυτή είναι η ΠΡΩΤΗ ερώτηση του quiz. Ξεκίνα με κάτι φιλικό και γενικό "
        "(π.χ. περίσταση, διάθεση, ή αν θα συνοδεύουν φαγητό). "
        "Δημιούργησε μία ερώτηση σε μορφή JSON."
    )
    
    response_text = _call_llm(client, model, QUIZ_ORCHESTRATOR_PROMPT, prompt)
    
    try:
        result = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error("Failed to parse LLM quiz response", raw=response_text[:200])
        return {"status": "error", "message": "Σφάλμα στη δημιουργία ερώτησης."}
    
    # 4. Create session
    session_id = str(uuid.uuid4())
    user_id = data.get("userId", "anonymous")
    
    session_ref = db.collection("users").document(user_id).collection("quiz_sessions").document(session_id)
    session_ref.set({
        "sessionId": session_id,
        "storeId": store_id,
        "answers": [],
        "inventorySummary": inventory_summary,
        "wineSkus": [w.get("sku") for w in wines],
        "createdAt": datetime.now(timezone.utc),
    })
    
    logger.info("Quiz initialized", session_id=session_id, store_id=store_id, wine_count=len(wines))
    
    return {
        "status": "success",
        "sessionId": session_id,
        "question": result.get("question", result),
    }


def next_question(data: dict) -> dict:
    """
    Process an answer and return the next question or final recommendation.
    """
    session_id = data.get("sessionId")
    user_id = data.get("userId", "anonymous")
    answer = data.get("answer", {})  # {questionId, optionId, label, dimension}
    
    if not session_id:
        return {"status": "error", "message": "Missing sessionId"}
    
    db = firestore.client()
    client = LLMConfig.get_client()
    model = LLMConfig.get_model_name(simple=True)
    
    # 1. Load session
    session_ref = db.collection("users").document(user_id).collection("quiz_sessions").document(session_id)
    session_doc = session_ref.get()
    
    if not session_doc.exists:
        return {"status": "error", "message": "Session not found"}
    
    session_data = session_doc.to_dict()
    answers = session_data.get("answers", [])
    inventory_summary = session_data.get("inventorySummary", "")
    wine_skus = session_data.get("wineSkus", [])
    store_id = session_data.get("storeId", "default")
    
    # 2. Append new answer
    answers.append(answer)
    session_ref.update({"answers": answers})
    
    # 3. Build conversation context for AI
    answers_text = "\n".join([
        f"- Ερώτηση ({a.get('dimension', '?')}): Απάντηση = \"{a.get('label', '?')}\""
        for a in answers
    ])
    
    prompt = (
        f"{inventory_summary}\n\n"
        f"ΑΠΑΝΤΗΣΕΙΣ ΠΟΥ ΕΧΕΙ ΔΩΣΕΙ Ο ΠΕΛΑΤΗΣ ΜΕΧΡΙ ΤΩΡΑ:\n{answers_text}\n\n"
        f"Αριθμός ερωτήσεων μέχρι τώρα: {len(answers)}\n\n"
        "Αποφάσισε: Χρειάζεσαι ΑΛΛΗ ερώτηση, ή έχεις αρκετές πληροφορίες για πρόταση;\n"
        "Αν χρειάζεσαι ερώτηση, δημιούργησε μία νέα (ΔΙΑΦΟΡΕΤΙΚΗ από τις προηγούμενες).\n"
        "Αν είσαι έτοιμος, απάντησε με type: ready_to_recommend.\n"
        "ΜΟΝΟ JSON."
    )
    
    response_text = _call_llm(client, model, QUIZ_ORCHESTRATOR_PROMPT, prompt)
    
    try:
        result = json.loads(response_text)
    except json.JSONDecodeError:
        logger.error("Failed to parse LLM quiz response", raw=response_text[:200])
        return {"status": "error", "message": "Σφάλμα στη δημιουργία ερώτησης."}
    
    # 4. Route: next question or recommendation
    if result.get("type") == "ready_to_recommend":
        logger.info("Quiz ready to recommend", session_id=session_id, answer_count=len(answers))
        return _generate_recommendation(db, client, session_id, store_id, wine_skus, answers, result.get("search_context", ""))
    
    logger.info("Quiz generated next question", session_id=session_id, answer_count=len(answers))
    return {
        "status": "success",
        "type": "question",
        "sessionId": session_id,
        "question": result.get("question", result),
        "answerCount": len(answers),
    }


def _generate_recommendation(
    db, client, session_id: str, store_id: str,
    wine_skus: List[str], answers: List[Dict], search_context: str
) -> dict:
    """
    Generate final wine recommendation using MCDA + vector search + CellarMaster.
    """
    # 1. Fetch full wine data
    wines = []
    for sku in wine_skus:
        doc = db.collection("wines").document(sku).get()
        if doc.exists:
            wines.append(doc.to_dict())
    
    # 2. MCDA scoring
    scored_wines = []
    for w in wines:
        clean = _clean_wine(w)
        mcda = _mcda_score(clean, answers)
        scored_wines.append({"wine": clean, "mcda_score": mcda, "has_embedding": "embedding" in w})
    
    # Sort by MCDA score (descending)
    scored_wines.sort(key=lambda x: x["mcda_score"], reverse=True)
    
    # 3. Vector search for semantic matching
    try:
        embed_text = search_context or " ".join([a.get("label", "") for a in answers])
        embed_response = client.models.embed_content(
            model=LLMConfig.get_embedding_model_name(),
            contents=embed_text,
        )
        query_vector = Vector(embed_response.embeddings[0].values)
        
        wines_ref = db.collection("wines")
        vector_docs = wines_ref.find_nearest(
            vector_field="embedding",
            query_vector=query_vector,
            distance_measure=DistanceMeasure.COSINE,
            limit=10,
            distance_result_field="vector_distance"
        ).get()
        
        # Build a vector rank map (sku -> rank)
        vector_rank = {}
        for i, doc in enumerate(vector_docs):
            d = doc.to_dict()
            if d.get("sku") in wine_skus:  # Only count store wines
                vector_rank[d["sku"]] = i
        
        # Combined scoring: MCDA weight (0.6) + vector rank weight (0.4)  
        for sw in scored_wines:
            sku = sw["wine"].get("sku", "")
            v_rank = vector_rank.get(sku)
            if v_rank is not None:
                # Lower rank = better, normalize to 0-1 scale
                vector_score = max(0, (10 - v_rank)) / 10.0
                sw["combined_score"] = sw["mcda_score"] * 0.6 + vector_score * 5.0 * 0.4
            else:
                sw["combined_score"] = sw["mcda_score"] * 0.6
        
        scored_wines.sort(key=lambda x: x.get("combined_score", 0), reverse=True)
        
    except Exception as e:
        logger.warning("Vector search failed, using MCDA only", error=str(e))
        for sw in scored_wines:
            sw["combined_score"] = sw["mcda_score"]
    
    # 4. Get top candidates
    top_wines = [sw["wine"] for sw in scored_wines[:3]]
    
    if not top_wines:
        return {
            "status": "success",
            "type": "result",
            "sessionId": session_id,
            "prose": "Λυπάμαι, δεν βρέθηκε κάποιο κρασί που να ταιριάζει στις προτιμήσεις σας.",
            "wines": [],
        }
    
    # 5. Call CellarMaster for prose recommendation
    answers_text = "\n".join([f"- {a.get('dimension', '?')}: {a.get('label', '?')}" for a in answers])
    wines_text = json.dumps(top_wines, indent=2, ensure_ascii=False, default=str)
    
    cellar_prompt = (
        f"Προτιμήσεις πελάτη (από quiz):\n{answers_text}\n\n"
        f"Κορυφαία κρασιά από τη βαθμολογία:\n{wines_text}\n\n"
        "Φτιάξε μια κομψή, προσωπική σύσταση JSON."
    )
    
    from expert.solution import SYSTEM_PROMPT as CELLAR_PROMPT
    
    model_complex = LLMConfig.get_model_name(complex=True)
    cellar_response = _call_llm(client, model_complex, CELLAR_PROMPT, cellar_prompt)
    
    try:
        parsed = json.loads(cellar_response)
        prose = parsed.get("prose_recommendation", cellar_response)
        rec_wines = parsed.get("recommended_wines", [])
    except json.JSONDecodeError:
        prose = cellar_response
        rec_wines = [{"sku": w.get("sku"), "name": w.get("name"), "price": w.get("price"), "why_it_fits": ""} for w in top_wines]
    
    logger.info("Quiz recommendation generated", session_id=session_id, wine_count=len(rec_wines))
    
    return {
        "status": "success",
        "type": "result",
        "sessionId": session_id,
        "prose": prose,
        "wines": rec_wines,
    }
