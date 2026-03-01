from typing import Any, Dict, List, Optional
from .schema import KnowledgeState, ProjectDomain, ProjectType, ConfidenceLevel, InferredValue, KnowledgeGaps

DEFAULTS = {
    'colorType': 'solid',
    'equipmentLevel': 'basic',
    'skillLevel': 'intermediate',
    'rustPresent': False,
}

def create_initial_state() -> KnowledgeState:
    return KnowledgeState()

def has_value(state: KnowledgeState, field: str) -> bool:
    if field in state.confirmed_facts:
        return True
    inferred = state.inferred_facts.get(field)
    if inferred and inferred.confidence == ConfidenceLevel.HIGH:
        return True
    return False

def get_effective_value(state: KnowledgeState, field: str) -> Any:
    if field in state.confirmed_facts:
        return state.confirmed_facts[field]
    
    inferred = state.inferred_facts.get(field)
    if inferred and inferred.confidence == ConfidenceLevel.HIGH:
        return inferred.value
        
    return DEFAULTS.get(field)

def update_gaps(state: KnowledgeState) -> KnowledgeState:
    ptype = state.project_type
    
    if not ptype or ptype == ProjectType.UNKNOWN:
        state.gaps = KnowledgeGaps(critical=['projectType'])
        return state

    critical: List[str] = []
    important: List[str] = []
    optional: List[str] = []

    # --- AUTOMOTIVE ---
    if ptype == ProjectType.DAMAGE_REPAIR:
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

    elif ptype == ProjectType.NEW_PARTS:
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'partCondition'): critical.append('partCondition')
        if not has_value(state, 'colorType'): critical.append('colorType')
        else:
            # For metallic/pearl, the exact OEM color code is non-negotiable
            color_type_val = get_effective_value(state, 'colorType')
            if color_type_val in ('metallic', 'pearl') and not has_value(state, 'colorCode'):
                critical.append('colorCode')
            elif not has_value(state, 'colorCode'):
                important.append('colorCode')

    elif ptype == ProjectType.RESTORATION:
        if not has_value(state, 'currentPaintCondition'): critical.append('currentPaintCondition')
        if not has_value(state, 'scope'): critical.append('scope')
        if not has_value(state, 'material'): important.append('material')
        if not has_value(state, 'colorType'): important.append('colorType')
        if not has_value(state, 'existingPaintType'): important.append('existingPaintType')

    elif ptype == ProjectType.PROTECTIVE:
        if not has_value(state, 'paintCorrectionNeeded'): important.append('paintCorrectionNeeded')
        if not has_value(state, 'desiredProtection'): important.append('desiredProtection')
        if not has_value(state, 'existingCoating'): optional.append('existingCoating')

    elif ptype == ProjectType.CUSTOM:
        if not has_value(state, 'targetSurface'): critical.append('targetSurface')
        if not has_value(state, 'desiredEffect'): critical.append('desiredEffect')
        if not has_value(state, 'colorType'): important.append('colorType')
        if not has_value(state, 'material'): important.append('material')

    # --- MARINE ---
    elif ptype == ProjectType.MARINE_ANTIFOULING:
        if not has_value(state, 'environment'): critical.append('environment')
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'currentPaintCondition'): important.append('currentPaintCondition')
        
    elif ptype == ProjectType.MARINE_GELCOAT:
        if not has_value(state, 'damageDepth'): critical.append('damageDepth')
        if not has_value(state, 'damageSize'): important.append('damageSize')
        
    elif ptype == ProjectType.MARINE_TOPSIDE:
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'colorType'): important.append('colorType')
        
    elif ptype == ProjectType.MARINE_WOOD:
        if not has_value(state, 'currentPaintCondition'): critical.append('currentPaintCondition')

    # --- STRUCTURAL ---
    elif ptype == ProjectType.STRUCTURAL_MASONRY:
        if not has_value(state, 'environment'): critical.append('environment')
        if not has_value(state, 'currentPaintCondition'): important.append('currentPaintCondition')
        
    elif ptype == ProjectType.STRUCTURAL_WOOD:
        if not has_value(state, 'environment'): critical.append('environment')
        if not has_value(state, 'currentPaintCondition'): important.append('currentPaintCondition')
        
    elif ptype == ProjectType.STRUCTURAL_METAL:
        if not has_value(state, 'rustPresent'): critical.append('rustPresent')
        if not has_value(state, 'colorType'): important.append('colorType')
        
    elif ptype == ProjectType.STRUCTURAL_INTERIOR:
        if not has_value(state, 'material'): important.append('material')
        if not has_value(state, 'currentPaintCondition'): important.append('currentPaintCondition')
        
    elif ptype == ProjectType.GENERAL_PAINTING:
        if not has_value(state, 'material'): critical.append('material')
        if not has_value(state, 'environment'): critical.append('environment')

    else:
        # Catch-all for unknown project types to prevent empty solutions
        if not has_value(state, 'material'): critical.append('material')
        important.append('projectTypeClarification')

    if not has_value(state, 'equipmentLevel'): optional.append('equipmentLevel')
    if not has_value(state, 'vehicleInfo'): optional.append('vehicleInfo')

    state.gaps = KnowledgeGaps(critical=critical, important=important, optional=optional)
    return state

def set_project_domain(state: KnowledgeState, domain: ProjectDomain) -> KnowledgeState:
    state.domain = domain
    return update_gaps(state)

def set_project_type(state: KnowledgeState, ptype: str) -> KnowledgeState:
    state.project_type = ptype
    return update_gaps(state)

def confirm_fact(state: KnowledgeState, field: str, value: Any) -> KnowledgeState:
    state.confirmed_facts[field] = value
    if field in state.inferred_facts:
        del state.inferred_facts[field]
    return update_gaps(state)

def infer_fact(state: KnowledgeState, field: str, value: Any, confidence: ConfidenceLevel, source: str) -> KnowledgeState:
    if field in state.confirmed_facts:
        return state
    state.inferred_facts[field] = InferredValue(value=value, confidence=confidence, source=source)
    return update_gaps(state)

def get_most_important_gap(state: KnowledgeState) -> Optional[str]:
    if state.gaps.critical: return state.gaps.critical[0]
    if state.gaps.important: return state.gaps.important[0]
    return None

def is_ready_for_solution(state: KnowledgeState) -> bool:
    if not state.project_type or state.project_type == ProjectType.UNKNOWN:
        return False
    if len(state.gaps.critical) > 0:
        return False
    # Require at least 1 explicitly confirmed fact (not just inferred)
    # This prevents jumping to a solution on the very first message
    if len(state.confirmed_facts) == 0:
        return False
    return True

def get_gap_label(gap_id: str) -> str:
    """Maps technical gap IDs to human-readable Greek labels."""
    labels = {
        'projectType': 'Τύπος Έργου',
        'material': 'Υλικό Επιφάνειας',
        'damageDepth': 'Βάθος Ζημιάς',
        'damageSize': 'Μέγεθος Ζημιάς',
        'partCondition': 'Κατάσταση Εξαρτήματος',
        'colorType': 'Τύπος Χρώματος',
        'colorCode': 'Κωδικός Χρώματος',
        'rustPresent': 'Ύπαρξη Σκουριάς',
        'environment': 'Περιβάλλον Χρήσης',
        'equipmentLevel': 'Διαθέσιμος Εξοπλισμός',
        'currentPaintCondition': 'Κατάσταση Υπάρχουσας Βαφής',
        'vehicleInfo': 'Πληροφορίες Οχήματος'
    }
    return labels.get(gap_id, gap_id)

def get_options_for_gap(gap_id: str) -> Optional[List[Dict[str, str]]]:
    """Returns standard Greek options for critical project gaps."""
    options_map = {
        'material': [
            {'id': 'metal', 'label': 'Μέταλλο', 'value': 'metal', 'description': 'Πόρτες, καπό, φτερά'},
            {'id': 'plastic', 'label': 'Πλαστικό', 'value': 'plastic', 'description': 'Προφυλακτήρες, πλαίσια'},
            {'id': 'fiberglass', 'label': 'Fiberglass / Πολυεστέρας', 'value': 'fiberglass', 'description': 'Σκάφη, custom body kits'},
            {'id': 'wood', 'label': 'Ξύλο', 'value': 'wood', 'description': 'Εσωτερικά, ξύλινα τμήματα'}
        ],
        'damageDepth': [
            {'id': 'surface', 'label': 'Επιφανειακό', 'value': 'surface', 'description': 'Γρατζουνιές στο χρώμα μόνο'},
            {'id': 'to-primer', 'label': 'Βαθύ – ως το Αστάρι', 'value': 'to-primer', 'description': 'Φαίνεται γκρι/λευκό κάτω'},
            {'id': 'to-metal', 'label': 'Πολύ Βαθύ – ως το Μέταλλο', 'value': 'to-metal', 'description': 'Φαίνεται το γυμνό μέταλλο'}
        ],
        'damageSize': [
            {'id': 'small', 'label': 'Μικρό (μέγεθος κέρματος)', 'value': 'small'},
            {'id': 'medium', 'label': 'Μεσαίο (μέγεθος παλάμης)', 'value': 'medium'},
            {'id': 'large', 'label': 'Μεγάλο (πάνω από πυγμή)', 'value': 'large'},
            {'id': 'panel', 'label': 'Ολόκληρο Πάνελ/Εξάρτημα', 'value': 'panel'}
        ],
        'colorType': [
            {'id': 'solid', 'label': 'Συμπαγές (Solid)', 'value': 'solid', 'description': 'Ένα χρώμα, χωρίς αντανακλάσεις'},
            {'id': 'metallic', 'label': 'Μεταλλικό (Metallic)', 'value': 'metallic', 'description': 'Λάμψη και βάθος'},
            {'id': 'pearl', 'label': 'Περλέ (Pearl / Tricoat)', 'value': 'pearl', 'description': 'Αλλάζει χρώμα στο φως'}
        ],
        'rustPresent': [
            {'id': 'yes', 'label': 'Ναι, υπάρχει σκουριά', 'value': 'yes'},
            {'id': 'no', 'label': 'Όχι, είναι καθαρό', 'value': 'no'}
        ],
        'environment': [
            {'id': 'salt-water', 'label': 'Θαλασσινό Νερό', 'value': 'salt-water'},
            {'id': 'fresh-water', 'label': 'Γλυκό Νερό', 'value': 'fresh-water'},
            {'id': 'exterior', 'label': 'Εξωτερικό (Ήλιος/Βροχή)', 'value': 'exterior'},
            {'id': 'interior', 'label': 'Εσωτερικό', 'value': 'interior'}
        ],
        'partCondition': [
            {'id': 'new-raw', 'label': 'Καινούριο (Άβαφο/Μαύρο)', 'value': 'new-raw', 'description': 'Δεν έχει βαφεί ποτέ'},
            {'id': 'new-primed', 'label': 'Καινούριο (Με Αστάρι)', 'value': 'new-primed', 'description': 'Ανοιχτό γκρι από εργοστάσιο'},
            {'id': 'used', 'label': 'Μεταχειρισμένο', 'value': 'used', 'description': 'Έχει παλιά βαφή πάνω του'}
        ],
        'currentPaintCondition': [
            {'id': 'good', 'label': 'Καλή κατάσταση', 'value': 'good', 'description': 'Χωρίς ρωγμές ή αποφλοίωση'},
            {'id': 'fair', 'label': 'Μέτρια κατάσταση', 'value': 'fair', 'description': 'Μικρές γρατζουνιές/ξεθώριασμα'},
            {'id': 'poor', 'label': 'Κακή κατάσταση', 'value': 'poor', 'description': 'Αποφλοίωση, ρωγμές, σκουριά'}
        ],
        'scope': [
            {'id': 'spot', 'label': 'Σημειακή Επισκευή', 'value': 'spot'},
            {'id': 'panel', 'label': 'Ένα Πάνελ/Εξάρτημα', 'value': 'panel'},
            {'id': 'full', 'label': 'Ολική Επαναβαφή', 'value': 'full'}
        ]
    }
    return options_map.get(gap_id)
