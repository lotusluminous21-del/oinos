import time
from typing import List, Dict, Any
from .schema import KnowledgeState
from .state_manager import get_effective_value
from .product_matcher import match_products_for_step

def calculate_difficulty(state: KnowledgeState) -> str:
    ptype = state.project_context.project_type
    depth = get_effective_value(state, 'damageDepth')
    size = get_effective_value(state, 'damageSize')
    rust = get_effective_value(state, 'rustPresent')
    color_type = get_effective_value(state, 'colorType')

    if ptype in ['custom-finishes', 'restoration']: return 'advanced'
    if depth == 'to-metal' and rust: return 'advanced'
    if depth in ['to-primer', 'to-metal']: return 'intermediate'
    if size in ['panel', 'full-part']: return 'advanced'
    if color_type in ['pearl', 'tricoat']: return 'advanced'
    if size == 'large': return 'intermediate'
    
    return 'beginner'

def generate_damage_repair_steps(state: KnowledgeState, products: List[Dict]) -> List[Dict]:
    steps = []
    depth = get_effective_value(state, 'damageDepth')
    rust = get_effective_value(state, 'rustPresent')
    order = 1

    steps.append({
        "order": order,
        "title": "Clean & Prep",
        "description": "Thoroughly clean the area to remove wax, grease, and dirt.",
        "tips": ["Use a degreaser or dish soap", "Dry completely with a microfiber towel"],
        "warnings": ["Do not use alcohol as it might affect sensitive plastics"],
        "products": [p['handle'] for p in match_products_for_step("cleaning", state, products)]
    })
    order += 1

    if depth != 'surface':
        steps.append({
            "order": order,
            "title": "Sand",
            "description": "Carefully sand the damaged edges to smooth them out.",
            "tips": ["Use medium grit sandpaper", "Do not sand too far outside the damage area"],
            "warnings": ["Wear a mask to avoid inhaling paint dust"],
            "products": [p['handle'] for p in match_products_for_step("abrasives", state, products)]
        })
        order += 1

    if rust:
        steps.append({
            "order": order,
            "title": "Rust Treatment",
            "description": "Convert or remove the existing rust to prevent it from coming back.",
            "tips": ["Ensure loose rust is brushed off first", "Let the converter cure fully"],
            "warnings": ["Rust converters are acidic, use gloves"],
            "products": [p['handle'] for p in match_products_for_step("rust-treatments", state, products)]
        })
        order += 1

    if depth in ['to-primer', 'to-metal']:
        steps.append({
            "order": order,
            "title": "Prime",
            "description": "Apply primer to fill the depth and provide adhesion for the paint.",
            "tips": ["Spray light coats", "Wait for it to dry and lightly sand smooth"],
            "warnings": ["Clean the surface again after sanding primer"],
            "products": [p['handle'] for p in match_products_for_step("primers", state, products)]
        })
        order += 1

    if depth != 'surface':
        steps.append({
            "order": order,
            "title": "Base Coat (Color)",
            "description": "Apply your matching paint color.",
            "tips": ["Apply in thin layers", "Allow 10-15 minutes between coats"],
            "warnings": ["Check color match on a test card first"],
            "products": [p['handle'] for p in match_products_for_step("base-coats", state, products)]
        })
        order += 1

    steps.append({
        "order": order,
        "title": "Clear Coat & Polish",
        "description": "Protect the new paint and blend the finish to match the rest of the panel.",
        "tips": ["Clear coat is crucial for UV protection", "Wait 24h before polishing"],
        "warnings": ["Ensure base coat is touch-dry before clear coating"],
        "products": [p['handle'] for p in match_products_for_step("polishing", state, products)]
    })

    return steps

def generate_marine_steps(state: KnowledgeState, products: List[Dict]) -> List[Dict]:
    steps = []
    ptype = state.project_context.project_type
    order = 1

    prep_prods = match_products_for_step('Προετοιμασία/Καθαριστικό', state, products)
    if not prep_prods:
        prep_prods = match_products_for_step('cleaning', state, products)

    steps.append({
        "order": order,
        "title": "Hull/Deck Preparation",
        "description": "Clean the marine surface thoroughly, removing salt, algae, and loose material.",
        "tips": ["Use a marine-grade degreaser", "Pressure wash if possible"],
        "warnings": ["Ensure hull is completely dry before repair"],
        "products": [p['handle'] for p in prep_prods]
    })
    order += 1

    if ptype == 'marine-antifouling':
        steps.append({
            "order": order,
            "title": "Antifouling Application",
            "description": "Apply antifouling bottom paint to prevent marine growth.",
            "tips": ["Ensure the hull is completely dry", "Apply two coats, with an extra coat on the waterline"],
            "warnings": ["Avoid painting over transducers or anodes"],
            "products": [p['handle'] for p in match_products_for_step('Βασικό Χρώμα', state, products)]
        })
    elif ptype == 'marine-gelcoat-repair':
        steps.append({
            "order": order,
            "title": "Gelcoat Repair",
            "description": "Fill the blister or crack with marine gelcoat or epoxy.",
            "tips": ["Mix hardener precisely", "Sand flush after curing"],
            "warnings": ["Keep temperatures above 15°C for proper curing"],
            "products": [p['handle'] for p in match_products_for_step('fillers', state, products)]
        })
    else:
        steps.append({
            "order": order,
            "title": "Marine Topcoat",
            "description": "Apply UV-resistant marine topside paint.",
            "tips": ["Use the roll and tip method for a smooth finish"],
            "warnings": ["Protect from dew for at least 6 hours after application"],
            "products": [p['handle'] for p in match_products_for_step('Βασικό Χρώμα', state, products)]
        })

    return steps

def generate_structural_steps(state: KnowledgeState, products: List[Dict]) -> List[Dict]:
    steps = []
    order = 1

    steps.append({
        "order": order,
        "title": "Surface Cleaning",
        "description": "Remove dirt, loose paint, and debris.",
        "tips": ["Wire brush for metal", "Power wash for masonry/wood"],
        "warnings": ["Check for structural rot or rust damage"],
        "products": [p['handle'] for p in match_products_for_step('Προετοιμασία/Καθαριστικό', state, products)]
    })
    order += 1

    rust = get_effective_value(state, 'rustPresent')
    if rust:
        steps.append({
            "order": order,
            "title": "Rust Conversion",
            "description": "Treat the rusted structural metal.",
            "tips": ["Allow 24 hours to cure until black"],
            "warnings": ["Do not wash after conversion; wait for full cure"],
            "products": [p['handle'] for p in match_products_for_step('rust-treatments', state, products)]
        })
        order += 1

    steps.append({
        "order": order,
        "title": "Application",
        "description": "Apply the structural paint or stain.",
        "tips": ["Follow the grain for wood", "Ensure full coverage on porous masonry"],
        "warnings": ["Avoid application during high humidity"],
        "products": [p['handle'] for p in match_products_for_step('Βασικό Χρώμα', state, products)]
    })

    return steps

def generate_solution(state: KnowledgeState, available_products: List[Dict]) -> Dict[str, Any]:
    project_domain = state.project_context.project_domain.value if state.project_context.project_domain else 'automotive'
    ptype = state.project_context.project_type
    
    steps = []

    if project_domain == 'automotive':
        if ptype == 'damage-repair':
            steps = generate_damage_repair_steps(state, available_products)
        else:
            steps = [{
                "order": 1,
                "title": "Automotive Custom/Restoration",
                "description": "Follow general preparation, painting, and finishing guidelines.",
                "tips": ["Always prep well", "Take your time"],
                "warnings": ["Use consistent light conditions"],
                "products": [p['handle'] for p in match_products_for_step('cleaning', state, available_products)]
            }]
    elif project_domain == 'marine':
        steps = generate_marine_steps(state, available_products)
    elif project_domain == 'structural':
        steps = generate_structural_steps(state, available_products)
    else:
        steps = [{
            "order": 1,
            "title": "General Painting Plan",
            "description": "Follow general preparation, painting, and finishing guidelines.",
            "tips": ["Always prep well", "Take your time"],
            "warnings": ["Ensure compatibility between layers"],
            "products": [p['handle'] for p in match_products_for_step('cleaning', state, available_products)]
        }]

    total_price = 0
    total_products = 0

    # Calculate price based on original product objects before step conversion
    used_handles = set()
    for step in steps:
        for h in step.get('products', []):
            used_handles.add(h)
    
    suggested_products = [p for p in available_products if p.get('handle') in used_handles]

    for sp in suggested_products:
        try:
            price = float(sp.get('price', 0))
            qty = sp.get('quantity', 1)
            total_price += price * qty
            total_products += qty
        except (ValueError, TypeError):
            pass
            
    assumptions = []
    if get_effective_value(state, 'damageDepth') == 'unknown':
        assumptions.append("Assuming standard surface damage for base calculation.")

    return {
        "id": f"sol-{int(time.time())}",
        "title": f"Your {str(ptype).replace('-', ' ').title()} Plan",
        "projectType": ptype,
        "difficulty": calculate_difficulty(state),
        "estimatedTime": "2-4 hours",
        "steps": steps,
        "totalPrice": total_price,
        "totalProducts": total_products,
        "suggested_products": suggested_products,
        "assumptions": assumptions
    }
