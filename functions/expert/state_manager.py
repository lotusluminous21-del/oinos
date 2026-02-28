from typing import Any, Dict, List, Optional
from .schema import KnowledgeState, ProjectDomain, ConfidenceLevel, InferredValue, KnowledgeGaps

DEFAULTS = {
    'colorType': 'solid',
    'equipmentLevel': 'basic',
    'skillLevel': 'intermediate',
    'rustPresent': False,
}

def create_initial_state() -> KnowledgeState:
    return KnowledgeState()

def has_value(state: KnowledgeState, field: str) -> bool:
    if field in state.confirmed:
        return True
    inferred = state.inferred.get(field)
    if inferred and inferred.confidence == ConfidenceLevel.HIGH:
        return True
    return False

def get_effective_value(state: KnowledgeState, field: str) -> Any:
    if field in state.confirmed:
        return state.confirmed[field]
    
    inferred = state.inferred.get(field)
    if inferred and inferred.confidence == ConfidenceLevel.HIGH:
        return inferred.value
        
    return DEFAULTS.get(field)

def update_gaps(state: KnowledgeState) -> KnowledgeState:
    ptype = state.project_context.project_type
    
    if not ptype:
        state.gaps = KnowledgeGaps(critical=['projectType'])
        return state

    critical: List[str] = []
    important: List[str] = []
    optional: List[str] = []

    # --- AUTOMOTIVE ---
    if ptype == 'damage-repair':
        if not has_value(state, 'damageDepth'): critical.append('damageDepth')
        if not has_value(state, 'material'):
            depth = get_effective_value(state, 'damageDepth')
            if depth and depth != 'surface':
                critical.append('material')
        if not has_value(state, 'colorType'): important.append('colorType')
        if not has_value(state, 'damageSize'): important.append('damageSize')
        if not has_value(state, 'rustPresent'):
            mat = get_effective_value(state, 'material')
            depth = get_effective_value(state, 'damageDepth')
            if mat == 'metal' and depth and depth != 'surface':
                important.append('rustPresent')

    elif ptype == 'new-parts-painting':
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'partCondition'): critical.append('partCondition')
        if not has_value(state, 'colorCode') and not has_value(state, 'colorType'):
            important.append('colorType')

    elif ptype == 'restoration':
        if not has_value(state, 'currentPaintCondition'): critical.append('currentPaintCondition')
        if not has_value(state, 'scope'): critical.append('scope')
        if not has_value(state, 'material'): important.append('material')
        if not has_value(state, 'colorType'): important.append('colorType')
        if not has_value(state, 'existingPaintType'): important.append('existingPaintType')

    elif ptype == 'protective-coatings':
        if not has_value(state, 'paintCorrectionNeeded'): important.append('paintCorrectionNeeded')
        if not has_value(state, 'desiredProtection'): important.append('desiredProtection')
        if not has_value(state, 'existingCoating'): optional.append('existingCoating')

    elif ptype == 'custom-finishes':
        if not has_value(state, 'targetSurface'): critical.append('targetSurface')
        if not has_value(state, 'desiredEffect'): critical.append('desiredEffect')
        if not has_value(state, 'colorType'): important.append('colorType')
        if not has_value(state, 'material'): important.append('material')

    # --- MARINE ---
    elif ptype == 'marine-antifouling':
        if not has_value(state, 'environment'): critical.append('environment')
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'currentPaintCondition'): important.append('currentPaintCondition')
        
    elif ptype == 'marine-gelcoat-repair':
        if not has_value(state, 'damageDepth'): critical.append('damageDepth')
        if not has_value(state, 'damageSize'): important.append('damageSize')
        
    elif ptype == 'marine-topside-paint':
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'colorType'): important.append('colorType')
        
    elif ptype == 'marine-wood-varnish':
        if not has_value(state, 'currentPaintCondition'): critical.append('currentPaintCondition')

    # --- STRUCTURAL ---
    elif ptype == 'structural-masonry-protection':
        if not has_value(state, 'environment'): critical.append('environment')
        if not has_value(state, 'currentPaintCondition'): important.append('currentPaintCondition')
        
    elif ptype == 'structural-wood-staining':
        if not has_value(state, 'environment'): critical.append('environment')
        if not has_value(state, 'currentPaintCondition'): critical.append('currentPaintCondition')
        
    elif ptype == 'structural-metal-gate-fence':
        if not has_value(state, 'rustPresent'): critical.append('rustPresent')
        if not has_value(state, 'colorType'): important.append('colorType')
        
    elif ptype == 'structural-interior-wall':
        if not has_value(state, 'material'): important.append('material')
        if not has_value(state, 'currentPaintCondition'): important.append('currentPaintCondition')
        
    elif ptype == 'general-painting':
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'environment'): critical.append('environment')

    if not has_value(state, 'equipmentLevel'): optional.append('equipmentLevel')
    if not has_value(state, 'vehicleInfo'): optional.append('vehicleInfo')

    state.gaps = KnowledgeGaps(critical=critical, important=important, optional=optional)
    return state

def set_project_domain(state: KnowledgeState, domain: ProjectDomain) -> KnowledgeState:
    state.project_context.project_domain = domain
    return update_gaps(state)

def set_project_type(state: KnowledgeState, ptype: str) -> KnowledgeState:
    state.project_context.project_type = ptype
    return update_gaps(state)

def confirm_fact(state: KnowledgeState, field: str, value: Any) -> KnowledgeState:
    state.confirmed[field] = value
    if field in state.inferred:
        del state.inferred[field]
    return update_gaps(state)

def infer_fact(state: KnowledgeState, field: str, value: Any, confidence: ConfidenceLevel, source: str) -> KnowledgeState:
    if field in state.confirmed:
        return state
    state.inferred[field] = InferredValue(value=value, confidence=confidence, source=source)
    return update_gaps(state)

def get_most_important_gap(state: KnowledgeState) -> Optional[str]:
    if state.gaps.critical: return state.gaps.critical[0]
    if state.gaps.important: return state.gaps.important[0]
    return None

def is_ready_for_solution(state: KnowledgeState) -> bool:
    if not state.project_context.project_type: return False
    return len(state.gaps.critical) == 0

def get_options_for_gap(gap_id: str) -> Optional[List[Dict[str, str]]]:
    """Returns standard Greek options for critical project gaps."""
    options_map = {
        'material': [
            {'id': 'metal', 'label': 'Γυμνό Μέταλλο (Bare Metal)', 'value': 'metal'},
            {'id': 'plastic', 'label': 'Πλαστικό', 'value': 'plastic'},
            {'id': 'fiberglass', 'label': 'Fiberglass / Πολυεστέρας', 'value': 'fiberglass'},
            {'id': 'wood', 'label': 'Ξύλο', 'value': 'wood'}
        ],
        'damageDepth': [
            {'id': 'surface', 'label': 'Επιφανειακό (Εκδορές/Γρατζουνιές)', 'value': 'surface'},
            {'id': 'to-primer', 'label': 'Βαθύ (Μέχρι το Αστάρι)', 'value': 'to-primer'},
            {'id': 'to-metal', 'label': 'Πολύ Βαθύ (Μέχρι το Μέταλλο)', 'value': 'to-metal'}
        ],
        'rustPresent': [
            {'id': 'yes', 'label': 'Ναι, υπάρχει σκουριά', 'value': 'yes'},
            {'id': 'no', 'label': 'Όχι, είναι καθαρό', 'value': 'no'}
        ],
        'envrionment': [
            {'id': 'salt-water', 'label': 'Θαλασσινό Νερό', 'value': 'salt-water'},
            {'id': 'fresh-water', 'label': 'Γλυκό Νερό', 'value': 'fresh-water'}
        ]
    }
    return options_map.get(gap_id)
