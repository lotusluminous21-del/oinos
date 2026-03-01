# functions/expert_v2/main.py — V2 (Synchronous + Full Admin Logging)
# Owns: Orchestration only. Wires modules in order, logs every step.

from __future__ import annotations
import traceback
from google import genai

from .schema import KnowledgeState, ExpertChatRequest, ExpertChatResponse
from . import extractor, conversationalist, solution_builder, color_system
from .state_machine import compute_gaps, is_ready_for_solution, get_next_question, skip_stuck_gap

from core.logger import get_logger
from core.llm_config import LLMConfig

log = get_logger("expert_v2.main")


def _get_client():
    return LLMConfig.get_client()


def handle_expert_chat(req_data: dict) -> dict:
    """
    Main orchestration — synchronous.
    Flow: parse → extract → state_machine → decide → products → converse → assemble
    """
    client = _get_client()

    # ── 1. Parse request ─────────────────────────────────────────────────────
    try:
        req = ExpertChatRequest(**req_data)
        log.info("expert_v2: request parsed", message_preview=req.message[:80],
                 history_turns=len(req.history))
    except Exception as e:
        log.error("expert_v2: failed to parse request", exc_info=e, raw=str(req_data)[:200])
        return ExpertChatResponse(answer="Σφάλμα ανάγνωσης αιτήματος.").model_dump()

    current_state = KnowledgeState(**req.state) if req.state else KnowledgeState()
    log.info("expert_v2: initial state",
             domain=current_state.domain,
             project_type=current_state.project_type,
             confirmed_count=len(current_state.confirmed_facts))

    # ── VIN check ─────────────────────────────────────────────────────────────
    msg_upper = req.message.strip().upper().replace(" ", "")
    if len(msg_upper) == 17 and msg_upper.isalnum():
        try:
            import sys, os
            sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
            from expert.tools import lookup_vin
            vin_result = lookup_vin(req.message.strip())
            if vin_result and vin_result.get("make"):
                current_state.confirmed_facts["vehicle_make"] = vin_result["make"]
                current_state.confirmed_facts["vehicle_model"] = vin_result.get("model", "")
                current_state.confirmed_facts["vehicle_year"] = str(vin_result.get("year", ""))
                current_state.confirmed_facts["vin"] = req.message.strip()
                current_state.domain = "automotive"
                log.info("expert_v2: VIN decoded", vin=req.message.strip(), **vin_result)
        except Exception as e:
            log.warning("expert_v2: VIN lookup failed", exc_info=e)

    # ── 2. Extract facts (Agent 1, sync) ──────────────────────────────────────
    confirmed_before = set(current_state.confirmed_facts.keys())
    try:
        current_state = extractor.extract_facts_sync(
            message=req.message,
            history=req.history,
            current_state=current_state,
            client=client,
        )
        log.info("expert_v2: extraction complete",
                 confirmed=list(current_state.confirmed_facts.keys()),
                 inferred=list(current_state.inferred_facts.keys()),
                 domain=current_state.domain,
                 project_type=current_state.project_type)
    except Exception as e:
        log.error("expert_v2: extraction failed", exc_info=e)

    confirmed_now = set(current_state.confirmed_facts.keys())
    newly_confirmed = {k: current_state.confirmed_facts[k]
                       for k in confirmed_now - confirmed_before}

    # ── 3. State machine (pure Python) ────────────────────────────────────────
    try:
        current_state = compute_gaps(current_state)

        # Skip-if-stuck: if the same gap persisted despite user answering, advance
        current_state = skip_stuck_gap(current_state, current_state.last_asked_id)

        ready = is_ready_for_solution(current_state)
        next_question = None if ready else get_next_question(current_state)

        # Record which question we're asking this turn
        current_state.last_asked_id = next_question.id if next_question else None

        log.info("expert_v2: state machine",
                 confirmed_count=len(current_state.confirmed_facts),
                 critical_gaps=current_state.gaps.get("critical", []),
                 important_gaps=current_state.gaps.get("important", []),
                 ready=ready,
                 next_question=next_question.id if next_question else None)
    except Exception as e:
        log.error("expert_v2: state machine failed", exc_info=e)
        ready = False
        next_question = None

    # ── 4. Products + Solution ─────────────────────────────────────────────────
    products: list[dict] = []
    solution = None
    suggested_products: list[dict] = []
    safety_warnings: list[str] = []

    if ready:
        try:
            # sequence-driven search: try to find products for ALL logical steps
            from expert.tools import search_products
            all_products = []
            
            # Map logical steps to candidate search terms/categories (Greek store)
            search_targets = [
                {"cat": "Προετοιμασία & Καθαρισμός", "query": ""},
                {"cat": "Αστάρια & Υποστρώματα", "query": ""},
                {"cat": "Χρώματα Βάσης", "query": current_state.confirmed_facts.get("color_description") or ""},
                {"cat": "Βερνίκια & Φινιρίσματα", "query": ""}
            ]
            
            # If plastic, add adhesion promoter as a targeted query in primer category
            if current_state.confirmed_facts.get("material") == "plastic":
                search_targets.insert(1, {"cat": "Αστάρια & Υποστρώματα", "query": "Πρόσφυσης Πλαστικών"})

            log.info("expert_v2: starting sequence-driven product search", stages=len(search_targets))
            
            for target in search_targets:
                # Omit empty queries so we just fetch by category
                q = target["query"].strip() if target["query"] else None
                
                filters = {
                    "category": target["cat"],
                    "chemical_base": current_state.confirmed_facts.get("chemical_base"),
                    "surfaces": [current_state.confirmed_facts.get("material")] if current_state.confirmed_facts.get("material") else None,
                    "query": q
                }
                
                log.info(f"expert_v2: executing search for stage '{target['cat']}'", **filters)
                stage_products = search_products(**filters)
                
                if not stage_products:
                    log.warning(f"expert_v2: 0 products found for stage '{target['cat']}'", **filters)
                else:
                    log.info(f"expert_v2: found {len(stage_products)} products for stage '{target['cat']}'")
                
                all_products.extend(stage_products)

            # Remove duplicates by handle
            seen = set()
            products = []
            for p in all_products:
                if p["handle"] not in seen:
                    products.append(p)
                    seen.add(p["handle"])

            suggested_products = products[:5]
            log.info("expert_v2: total unique products found", count=len(products))
        except Exception as e:
            log.error("expert_v2: product search sequence failed", exc_info=e)

        try:
            solution = solution_builder.build_solution(current_state, products)
            log.info("expert_v2: solution built", 
                     title=solution.title, 
                     steps=len(solution.steps), 
                     total_products=solution.total_products)
        except Exception as e:
            log.error("expert_v2: solution builder failed", exc_info=e)

        depth = current_state.confirmed_facts.get("damage_depth")
        rust = current_state.confirmed_facts.get("rust_present")
        if depth == "to_metal" or rust == "yes":
            safety_warnings.append(
                "Προσοχή: Εκτεθειμένο μέταλλο σκουριάζει γρήγορα. "
                "Ολοκληρώστε εντός 48 ωρών από το τρίψιμο."
            )

    # ── 5. Generate conversational text (Agent 2, sync) ────────────────────────
    answer = "Κατάλαβα!"
    try:
        answer = conversationalist.generate_response_sync(
            newly_confirmed=newly_confirmed,
            next_question_id=next_question.id if next_question else None,
            next_question_text=next_question.text if next_question else None,
            is_ready=ready,
            client=client,
            history=req.history,
            confirmed_facts=current_state.confirmed_facts,
        )
        log.info("expert_v2: answer generated", answer_preview=answer[:100])
    except Exception as e:
        log.error("expert_v2: conversationalist failed", exc_info=e)
        if ready:
            answer = "Εξαιρετικά! Έχω όλες τις πληροφορίες που χρειάζομαι."
        elif next_question:
            answer = "Χρειάζομαι ακόμα μία πληροφορία."

    # ── 6. Assemble response ───────────────────────────────────────────────────
    response = ExpertChatResponse(
        answer=answer,
        question=next_question,
        solution=solution,
        ready_for_solution=ready,
        suggested_products=suggested_products,
        safety_warnings=safety_warnings,
        state=current_state.model_dump(),
    )

    log.info("expert_v2: response assembled",
             has_question=next_question is not None,
             has_solution=solution is not None,
             ready=ready)

    return response.model_dump()


def expert_chat_v2(req) -> dict:
    """Firebase HTTPS Callable entry point — synchronous wrapper."""
    try:
        data = req.data if hasattr(req, "data") else req
        return handle_expert_chat(data)
    except Exception as e:
        tb = traceback.format_exc()
        log.error("expert_v2: unhandled crash in expert_chat_v2", exc_info=e, traceback=tb)
        return ExpertChatResponse(
            answer="Συγγνώμη, προέκυψε ένα τεχνικό πρόβλημα. Παρακαλώ δοκιμάστε ξανά."
        ).model_dump()
