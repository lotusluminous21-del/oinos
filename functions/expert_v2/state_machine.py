# functions/expert_v2/state_machine.py
# Owns: All state transition logic. Pure Python — NO LLM, no I/O, no side effects.

from __future__ import annotations
from typing import Optional
from .schema import KnowledgeState
from .question_bank import QUESTIONS, ExpertQuestion


# ─── Gap definitions by project type ────────────────────────────────────────
GAP_RULES: dict[str, tuple[list[str], list[str]]] = {
    "damage_repair": (
        ["damage_depth", "material", "color_type"],
        ["damage_size", "rust_present", "equipment_level"],
    ),
    "new_parts": (
        ["material", "part_condition", "color_type"],
        ["color_code", "equipment_level"],
    ),
    "restoration": (
        ["material", "color_type"],
        ["color_code", "equipment_level"],
    ),
    "protective": (
        ["material"],
        ["equipment_level"],
    ),
    "marine_antifouling": (["material"], ["equipment_level"]),
    "marine_gelcoat": (["damage_depth", "damage_size"], []),
    "marine_topside": (["material", "color_type"], []),
    "structural_masonry": ([], ["equipment_level"]),
    "structural_wood": ([], ["equipment_level"]),
    "structural_metal": (["rust_present"], ["color_type", "equipment_level"]),
}

# Map project types → domain (prevents domain from ever being 'unknown')
DOMAIN_MAP = {
    "damage_repair": "automotive", "new_parts": "automotive",
    "restoration": "automotive", "protective": "automotive",
    "marine_antifouling": "marine", "marine_gelcoat": "marine",
    "marine_topside": "marine", "marine_wood": "marine",
    "structural_masonry": "structural", "structural_wood": "structural",
    "structural_metal": "structural",
}


def _is_confirmed(state: KnowledgeState, field: str) -> bool:
    """Returns True only if the field is in confirmed_facts (explicit user input)."""
    v = state.confirmed_facts.get(field)
    return v is not None and v != ""


def _has_any_value(state: KnowledgeState, field: str) -> bool:
    """Returns True if confirmed OR high-confidence inferred."""
    if _is_confirmed(state, field):
        return True
    inferred = state.inferred_facts.get(field)
    if inferred and inferred.get("confidence") in ("HIGH", "high"):
        return True
    return False


def compute_gaps(state: KnowledgeState) -> KnowledgeState:
    """
    Recompute gaps. Critical fields require EXPLICIT confirmation.
    Important fields may use high-confidence inferences.
    """
    ptype = state.project_type

    if ptype in ("unknown", None, ""):
        state.gaps = {"critical": ["project_type"], "important": [], "optional": []}
        return state

    # Auto-set domain from project type — never leave it as 'unknown'
    if state.domain in ("unknown", None, ""):
        state.domain = DOMAIN_MAP.get(ptype, "automotive")

    rules = GAP_RULES.get(ptype, (["material"], []))
    critical_fields, important_fields = rules

    critical: list[str] = []
    important: list[str] = []

    # Critical gaps MUST have explicit confirmation from the user
    for f in critical_fields:
        if not _is_confirmed(state, f):
            critical.append(f)

    # Universal Color requirement: At least one of color_code or color_description
    # must be confirmed for ALL projects (except maybe very specialized non-paint ones)
    has_confirmed_code = bool(state.confirmed_facts.get("color_code"))
    has_confirmed_desc = bool(state.confirmed_facts.get("color_description"))

    if not has_confirmed_code and not has_confirmed_desc:
        # If the last thing asked was color_code and it's still missing, pivot to description
        if state.last_asked_id == "color_code":
            if "color_description" not in critical:
                critical.append("color_description")
        else:
            # Otherwise, ask for code first as default
            if "color_code" not in critical:
                critical.append("color_code")

    # Important gaps use high-confidence inferences too
    for f in important_fields:
        if f not in critical and f not in ("color_code", "color_description") and not _has_any_value(state, f):
            important.append(f)

    if not _has_any_value(state, "equipment_level") and "equipment_level" not in critical + important:
        important.append("equipment_level")

    state.gaps = {"critical": critical, "important": important, "optional": []}
    return state


def skip_stuck_gap(state: KnowledgeState, last_asked_id: str | None) -> KnowledgeState:
    """
    Prevent infinite loops. Critical fields (except color_code/project_type) 
    can eventually be skipped IF the user is totally stuck.
    """
    if not last_asked_id:
        return state

    critical = state.gaps.get("critical", [])
    important = state.gaps.get("important", [])

    # NEVER skip project_type or color requirements for sensitive jobs
    if last_asked_id in ("project_type", "color_code", "color_description"):
        return state

    if last_asked_id in critical:
        critical = [f for f in critical if f != last_asked_id]
        state.gaps["critical"] = critical
        state.gaps.setdefault("optional", []).append(last_asked_id)
    elif last_asked_id in important:
        important = [f for f in important if f != last_asked_id]
        state.gaps["important"] = important
        state.gaps.setdefault("optional", []).append(last_asked_id)

    return state


def is_ready_for_solution(state: KnowledgeState) -> bool:
    """
    Solution ready when:
    1. project_type is known
    2. No critical gaps remain (e.g. material, condition, color gate)
    3. At least 1 fact was EXPLICITLY confirmed
    """
    if state.project_type in ("unknown", None, ""):
        return False
        
    critical = state.gaps.get("critical", [])
    if len(critical) > 0:
        return False
        
    if len(state.confirmed_facts) == 0:
        return False
        
    # Extra check for ALL projects: must have color_code or color_description
    if not state.confirmed_facts.get("color_code") and not state.confirmed_facts.get("color_description"):
        return False
        
    return True


def get_next_question(state: KnowledgeState) -> Optional[ExpertQuestion]:
    """Returns the next question to ask, or None if ready."""
    gaps = state.gaps
    ordered_gaps = gaps.get("critical", []) + gaps.get("important", [])
    for gap in ordered_gaps:
        question = QUESTIONS.get(gap)
        if question:
            return question
    return None
