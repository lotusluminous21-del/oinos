# functions/expert_v2/solution_builder.py
# Owns: Reassembling a Solution dynamically from searchable Shopify products.
# Now entirely product-driven based on "sequence_step" metafields.

from __future__ import annotations
import uuid
from typing import Any, List, Dict
from .schema import KnowledgeState, Solution, SolutionStep
from .color_system import build_color_context

# ─── Canonical Painting Stages (Order & Identity) ───────────────────────────
SEQUENCE_ORDER = [
    "Προετοιμασία/Καθαριστικό",
    "Ενισχυτικό Πρόσφυσης",
    "Αστάρι",
    "Βασικό Χρώμα",
    "Βερνίκι",
    "Γυαλιστικό",
    "Άλλο"
]

STEP_HINTS = {
    "Προετοιμασία/Καθαριστικό": {
        "desc": "Καθαρισμός και απολίπανση της επιφάνειας για τέλεια πρόσφυση.",
        "tips": ["Χρησιμοποιήστε καθαρό πανί χωρίς χνούδι", "Επιμείνετε στις γωνίες και τις ενώσεις"],
        "warnings": ["Η κακή απολίπανση είναι η κύρια αιτία αποκόλλησης της βαφής"]
    },
    "Ενισχυτικό Πρόσφυσης": {
        "desc": "Ειδικό υπόστρωμα που εξασφαλίζει ότι η βαφή θα 'δέσει' με το υλικό (π.χ. πλαστικό).",
        "tips": ["1-2 πολύ λεπτά περάσματα", "Μην το αφήσετε να στεγνώσει τελείως πριν το αστάρι (υγρό σε υγρό)"],
        "warnings": ["Απαραίτητο για άβαφα πλαστικά"]
    },
    "Αστάρι": {
        "desc": "Δημιουργία ομοιόμορφης βάσης και κάλυψη μικρο-ανωμαλιών.",
        "tips": ["2-3 γεμάτα χέρια", "Τρίψτε ελαφρά με P400-P600 αφού στεγνώσει"],
        "warnings": ["Μην βάφετε απευθείας πάνω σε γυμνό μέταλλο χωρίς αστάρι"]
    },
    "Βασικό Χρώμα": {
        "desc": "Εφαρμογή της απόχρωσης σε λεπτές στρώσεις.",
        "tips": ["Flash time 10-15 λεπτά μεταξύ στρώσεων", "Κρατήστε σταθερή απόσταση 20-25cm"],
        "warnings": ["Προσοχή στα 'τρεξίματα' αν βάφετε πολύ κοντά"]
    },
    "Βερνίκι": {
        "desc": "Τελική επίστρωση για λάμψη, βάθος και προστασία από τον ήλιο.",
        "tips": ["2 χέρια είναι συνήθως αρκετά", "Το πρώτο χέρι αχνό, το δεύτερο γεμάτο"],
        "warnings": ["Περιμένετε τουλάχιστον 30 λεπτά μετά το χρώμα πριν το βερνίκι"]
    },
    "Γυαλιστικό": {
        "desc": "Τελικό φινίρισμα για την αφαίρεση τυχόν ατελειών (dust nibs).",
        "tips": ["Περιμένετε 48 ώρες για πλήρη σκλήρυνση", "Χρησιμοποιήστε ποιοτική αλοιφή"],
        "warnings": ["Μην πιέζετε υπερβολικά τον αλοιφαδόρο"]
    }
}

def _get_difficulty(state: KnowledgeState) -> str:
    equipment = state.confirmed_facts.get("equipment_level") or "aerosol"
    if equipment == "spray_gun": return "advanced"
    if equipment == "basic": return "intermediate"
    return "beginner"

def _get_time(state: KnowledgeState) -> str:
    ptype = state.project_type
    size = state.confirmed_facts.get("damage_size", "medium")
    times = {
        "damage_repair": {"small": "2-3 ώρες", "medium": "4-6 ώρες", "large": "1 ημέρα"},
        "new_parts": {"new_raw": "5-8 ώρες", "used": "8-12 ώρες"},
    }
    t = times.get(ptype, "4-6 ώρες")
    return t.get(size, "4-6 ώρες") if isinstance(t, dict) else t

def build_solution(state: KnowledgeState, products: List[Dict[str, Any]]) -> Solution:
    """
    Assembles a Solution by grouping found products.
    If no products, provides Expert Instructions as fallbacks.
    """
    try:
        ptype = state.project_type
        color_ctx = build_color_context(state.confirmed_facts)
        
        # 1. Group products by sequence step
        steps_map: Dict[str, List[Dict]] = {}
        for p in products:
            seq = p.get("sequence_step") or "Άλλο"
            if seq not in steps_map: steps_map[seq] = []
            steps_map[seq].append(p)

        # 2. Construct steps
        final_steps: List[SolutionStep] = []
        total_price = 0.0
        
        from core.logger import get_logger
        l = get_logger("solution_builder")
        l.info("solution_builder: Starting solution assembly", incoming_products_count=len(products))

        idx = 1
        for stage in SEQUENCE_ORDER:
            prods = steps_map.get(stage, [])
            hints = STEP_HINTS.get(stage, {"desc": "Οδηγίες εφαρμογής", "tips": [], "warnings": []})
            
            l.info(f"solution_builder: Processing stage '{stage}'", products_found=len(prods))
            
            # Show the step ONLY if we have products
            if prods:
                handles = [p["handle"] for p in prods]
                
                # Sum prices
                for p in prods:
                    try:
                        price_val = str(p.get("price", "0")).replace('€', '').strip()
                        total_price += float(price_val)
                    except: pass

                final_steps.append(SolutionStep(
                    order=idx,
                    title=stage,
                    description=hints["desc"],
                    tips=hints["tips"],
                    warnings=hints["warnings"],
                    product_handles=handles
                ))
                idx += 1
            else:
                l.warning(f"solution_builder: Stage '{stage}' dropped - no products found")

        # 3. Dynamic Title
        base_title = "Εξατομικευμένο Πλάνο Βαφής"
        if ptype == "damage_repair": base_title = "Πλάνο Επισκευής Ζημιάς"
        elif ptype == "new_parts": base_title = "Βαφή Καινούριου Εξαρτήματος"
        
        if color_ctx.get("color_family"):
            base_title += f" ({color_ctx['color_family'].capitalize()})"

        # 4. Assumptions
        assumptions = []
        if color_ctx.get("recommended_code"):
            assumptions.append(f"Recommended Code: {color_ctx['recommended_code']} ({color_ctx.get('recommended_code_name')})")

        return Solution(
            id=str(uuid.uuid4()),
            title=base_title,
            project_type=ptype,
            difficulty=_get_difficulty(state),
            estimated_time=_get_time(state),
            steps=final_steps,
            total_price=round(total_price, 2),
            total_products=len([h for s in final_steps for h in s.product_handles]),
            assumptions=assumptions
        )
    except Exception as e:
        from core.logger import get_logger
        l = get_logger("solution_builder")
        l.error("solution_builder: CRITICAL FAILURE during assembly", exc_info=e, 
                state=state.model_dump(), product_count=len(products))
        raise e
