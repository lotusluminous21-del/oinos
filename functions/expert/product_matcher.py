from typing import List, Dict, Any, Literal
from .schema import KnowledgeState
from .state_manager import get_effective_value

def match_products_for_step(
    step_category: str,
    state: KnowledgeState,
    available_products: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Scores and filters raw Shopify products against the current knowledge state.
    Ported strictly from product-matcher.ts.
    """
    selected = []
    material = get_effective_value(state, 'material')
    project_domain = state.project_context.project_domain

    # Mapping normalized MaterialType to Greek SurfaceSuitability
    material_to_surface_map = {
        'metal': ['Γυμνό Μέταλλο', 'Αλουμίνιο', 'Σκουριά'],
        'aluminum': ['Αλουμίνιο', 'Γυμνό Μέταλλο'],
        'galvanized': ['Γαλβανιζέ', 'Γυμνό Μέταλλο'],
        'plastic': ['Πλαστικό'],
        'fiberglass': ['Fiberglass', 'Πλαστικό'],
        'wood': ['Ξύλο'],
        'concrete': ['Άλλο'],  # Assuming masonry might fall under other
    }

    target_surfaces = material_to_surface_map.get(material, []) if material else []
    rust_present = get_effective_value(state, 'rustPresent')

    candidates = []
    
    # Filter candidates
    for p in available_products:
        cat = p.get('category', '')
        seq_step = p.get('sequence_step', '')
        tags = [t.lower() for t in p.get('tags', [])]
        
        if cat == step_category or seq_step == step_category or any(step_category.lower() in t for t in tags):
            candidates.append(p)

    scored_candidates = []
    for product in candidates:
        score = 0
        reason = f"Κατάλληλο για {step_category}"
        is_essential = True
        
        surfaces = product.get('surfaces', [])
        special_props = product.get('special_properties', [])
        
        # Surface Match
        if surfaces and target_surfaces:
            if any(s in target_surfaces for s in surfaces):
                score += 5
                reason = f"Ειδικά σχεδιασμένο για {', '.join(surfaces)}"
            elif 'Άλλο' in surfaces or 'Υπάρχον Χρώμα' in surfaces:
                score += 1
            else:
                score -= 10
                
        # Rust special case
        if rust_present and step_category == 'rust-treatments':
            if 'Αντισκωριακό' in special_props:
                score += 10
                reason = "Περιέχει ισχυρά αντισκωριακά συστατικά."
                
        # Domain bumps
        tags = [t.lower() for t in product.get('tags', [])]
        if project_domain == 'marine' and any(t in ['marine', 'boat'] for t in tags):
            score += 5
            reason = "Ναυτιλιακών προδιαγραφών."
            
        # High temp
        env = get_effective_value(state, 'environment')
        if env == 'high-temperature' and 'Υψηλής Θερμοκρασίας' in special_props:
            score += 10
            reason = "Ανθεκτικό στις υψηλές θερμοκρασίες."
        elif env == 'high-temperature' and 'Υψηλής Θερμοκρασίας' not in special_props:
            score -= 20
            
        scored_candidates.append({
            "product": product,
            "score": score,
            "reason": reason,
            "isEssential": is_essential
        })

    # Sort descending
    scored_candidates.sort(key=lambda x: x['score'], reverse=True)

    if scored_candidates and scored_candidates[0]['score'] >= 0:
        best = scored_candidates[0]
        selected.append({
            **best['product'],
            "quantity": 1,
            "isEssential": best['isEssential'],
            "reason": best['reason']
        })

    return selected
