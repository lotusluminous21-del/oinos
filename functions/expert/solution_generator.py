import time
from typing import List, Dict, Any
from .schema import KnowledgeState
from .state_manager import get_effective_value
from .product_matcher import match_products_for_step

def calculate_difficulty(state: KnowledgeState) -> str:
    ptype = state.project_type
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
        "title": "Καθαρισμός & Προετοιμασία",
        "description": "Καθαρίστε διεξοδικά την περιοχή για να αφαιρέσετε το κερί, τα λίπη και τη σκόνη.",
        "tips": ["Χρησιμοποιήστε αποστεωτικό ή απορρυπαντικό", "Στεγνώστε εντελώς με μικροΐνα"],
        "warnings": ["Μην χρησιμοποιείτε αλκοόλ σε ευαίσθητα πλαστικά"],
        "products": [p['handle'] for p in match_products_for_step("cleaning", state, products)]
    })
    order += 1

    if depth != 'surface':
        steps.append({
            "order": order,
            "title": "Λείανση",
            "description": "Λειάνετε προσεκτικά τα άκρα της ζημιάς για να τα ομαλοποιήσετε.",
            "tips": ["Χρησιμοποιήστε μέτριο κόκκο γυαλόχαρτο", "Μην λειαίνετε έξω από την περιοχή της ζημιάς"],
            "warnings": ["Φορέστε μάσκα για να αποφύγετε την εισπνοή σκόνης βαφής"],
            "products": [p['handle'] for p in match_products_for_step("abrasives", state, products)]
        })
        order += 1

    if rust:
        steps.append({
            "order": order,
            "title": "Αντισκωριακή Επεξεργασία",
            "description": "Μετατρέψτε ή αφαιρέστε τη σκουριά για να αποτρέψετε την υποτροπή.",
            "tips": ["Βουρτσίστε πρώτα τη χαλαρή σκουριά", "Αφήστε τον μετατροπέα να σκληρυνθεί πλήρως"],
            "warnings": ["Οι μετατροπείς σκουριάς είναι όξινοι – χρησιμοποιήστε γάντια"],
            "products": [p['handle'] for p in match_products_for_step("rust-treatments", state, products)]
        })
        order += 1

    if depth in ['to-primer', 'to-metal']:
        steps.append({
            "order": order,
            "title": "Αστάρωμα",
            "description": "Εφαρμόστε αστάρι για να γεμίσετε το βάθος και να εξασφαλίσετε πρόσφυση.",
            "tips": ["Ψεκάστε σε λεπτά στρώματα", "Αφήστε να στεγνώσει και λειάνετε ελαφρά"],
            "warnings": ["Ξαναδιαβρέψτε/καθαρίστε την επιφάνεια μετά τη λείανση ασταριού"],
            "products": [p['handle'] for p in match_products_for_step("primers", state, products)]
        })
        order += 1

    if depth != 'surface':
        steps.append({
            "order": order,
            "title": "Βασικό Χρώμα (Base Coat)",
            "description": "Εφαρμόστε το χρώμα που ταιριάζει με το αυτοκίνητό σας.",
            "tips": ["Εφαρμόστε σε λεπτά στρώματα", "Αφήστε 10-15 λεπτά μεταξύ στρωμάτων"],
            "warnings": ["Ελέγξτε πρώτα τη συμφωνία χρώματος σε δοκιμαστικό χαρτί"],
            "products": [p['handle'] for p in match_products_for_step("base-coats", state, products)]
        })
        order += 1

    steps.append({
        "order": order,
        "title": "Βερνίκι & Polish",
        "description": "Προστατέψτε τη νέα βαφή και ενταχθείτε στο φινίρισμα του υπόλοιπου πάνελ.",
        "tips": ["Το βερνίκι είναι απαραίτητο για UV προστασία", "Περιμένετε 24ω πριν το polish"],
        "warnings": ["Βεβαιωθείτε ότι το βασικό χρώμα είναι ξηρό πριν βερνικώσετε"],
        "products": [p['handle'] for p in match_products_for_step("polishing", state, products)]
    })

    return steps

def generate_marine_steps(state: KnowledgeState, products: List[Dict]) -> List[Dict]:
    steps = []
    ptype_raw = state.project_type
    ptype = ptype_raw.value if hasattr(ptype_raw, 'value') else str(ptype_raw)
    order = 1

    prep_prods = match_products_for_step('Προετοιμασία/Καθαριστικό', state, products)
    if not prep_prods:
        prep_prods = match_products_for_step('cleaning', state, products)

    steps.append({
        "order": order,
        "title": "Προετοιμασία Γάστρας/Καταστρώματος",
        "description": "Καθαρίστε διεξοδικά την επιφάνεια, αφαιρώντας αλάτι, φύκια και χαλαρό υλικό.",
        "tips": ["Χρησιμοποιήστε θαλάσσιο αποστεωτικό", "Πλύνετε με πίεση αν είναι δυνατόν"],
        "warnings": ["Βεβαιωθείτε ότι η γάστρα είναι τελείως στεγνή πριν τη συνέχεια"],
        "products": [p['handle'] for p in prep_prods]
    })
    order += 1

    if ptype == 'marine-antifouling':
        steps.append({
            "order": order,
            "title": "Εφαρμογή Αντιρρυπαντικής Βαφής",
            "description": "Εφαρμόστε αντιρρυπαντικό χρώμα πυθμένα για αποτροπή θαλάσσιας ανάπτυξης.",
            "tips": ["Βεβαιωθείτε ότι η γάστρα είναι τελείως στεγνή", "Εφαρμόστε δύο στρώματα, με ένα επιπλέον στη γραμμή νερού"],
            "warnings": ["Αποφύγετε βαφή πάνω από ηχοβολιστές ή ανόδια"],
            "products": [p['handle'] for p in match_products_for_step('Βασικό Χρώμα', state, products)]
        })
    elif ptype == 'marine-gelcoat-repair':
        steps.append({
            "order": order,
            "title": "Επισκευή Gelcoat",
            "description": "Γεμίστε τη φυσαλίδα ή την ρωγμή με θαλάσσιο gelcoat ή εποξική ρητίνη.",
            "tips": ["Αναμείξτε τον σκληρυντή με ακρίβεια", "Λειάνετε μετά τη σκλήρυνση"],
            "warnings": ["Κρατήστε θερμοκρασίες άνω των 15°C για σωστή σκλήρυνση"],
            "products": [p['handle'] for p in match_products_for_step('fillers', state, products)]
        })
    else:
        steps.append({
            "order": order,
            "title": "Θαλάσσιο Topcoat",
            "description": "Εφαρμόστε UV-ανθεκτική θαλάσσια βαφή πλευρών.",
            "tips": ["Χρησιμοποιήστε τη μέθοδο roll-and-tip για λείο φινίρισμα"],
            "warnings": ["Προστατέψτε από δρόσο για τουλάχιστον 6 ώρες μετά"],
            "products": [p['handle'] for p in match_products_for_step('Βασικό Χρώμα', state, products)]
        })

    return steps

def generate_structural_steps(state: KnowledgeState, products: List[Dict]) -> List[Dict]:
    steps = []
    order = 1

    steps.append({
        "order": order,
        "title": "Καθαρισμός Επιφάνειας",
        "description": "Αφαιρέστε σκόνη, χαλαρή βαφή και αποθέσεις.",
        "tips": ["Χαλύβδινη βούρτσα για μέταλλα", "Πλύσιμο με πίεση για τοιχοποιία/ξύλο"],
        "warnings": ["Ελέγξτε για δομική σήψη ή ζημιά από σκουριά"],
        "products": [p['handle'] for p in match_products_for_step('Προετοιμασία/Καθαριστικό', state, products)]
    })
    order += 1

    rust = get_effective_value(state, 'rustPresent')
    if rust:
        steps.append({
            "order": order,
            "title": "Μετατροπή Σκουριάς",
            "description": "Επεξεργαστείτε τη σκουριωμένη δομική μεταλλική επιφάνεια.",
            "tips": ["Αφήστε 24 ώρες να σκληρυνθεί ώσπου να μαυρίσει"],
            "warnings": ["Μην ξεπλύνετε μετά τη μετατροπή – περιμένετε πλήρη σκλήρυνση"],
            "products": [p['handle'] for p in match_products_for_step('rust-treatments', state, products)]
        })
        order += 1

    steps.append({
        "order": order,
        "title": "Εφαρμογή Χρώματος",
        "description": "Εφαρμόστε τη δομική βαφή ή λάκα.",
        "tips": ["Ακολουθήστε τη ροή σε ξύλο", "Εξασφαλίστε πλήρη κάλυψη σε πορώδη τοιχοποιία"],
        "warnings": ["Αποφύγετε εφαρμογή σε υψηλή υγρασία"],
        "products": [p['handle'] for p in match_products_for_step('Βασικό Χρώμα', state, products)]
    })

    return steps

def generate_solution(state: KnowledgeState, available_products: List[Dict]) -> Dict[str, Any]:
    project_domain = state.domain.value if hasattr(state.domain, 'value') else str(state.domain)
    ptype_raw = state.project_type
    ptype = ptype_raw.value if hasattr(ptype_raw, 'value') else str(ptype_raw)
    
    steps = []

    if project_domain == 'automotive':
        if ptype == 'damage-repair':
            steps = generate_damage_repair_steps(state, available_products)
        else:
            steps = [{
                "order": 1,
                "title": "Αυτοκινητιστική Αποκατάσταση / Custom",
                "description": "Ακολουθήστε τις γενικές οδηγίες προετοιμασίας, βαφής και φινιρίσματος.",
                "tips": ["Η καλή προετοιμασία είναι το παν", "Αφιερώστε χρόνο σε κάθε βήμα"],
                "warnings": ["Χρησιμοποιήστε σταθερό φωτισμό για αξιόπιστη αξιολόγηση χρώματος"],
                "products": [p['handle'] for p in match_products_for_step('cleaning', state, available_products)]
            }]
    elif project_domain == 'marine':
        steps = generate_marine_steps(state, available_products)
    elif project_domain == 'structural':
        steps = generate_structural_steps(state, available_products)
    else:
        steps = [{
            "order": 1,
            "title": "Γενικό Πλάνο Βαφής",
            "description": "Ακολουθήστε τις γενικές οδηγίες προετοιμασίας, βαφής και φινιρίσματος.",
            "tips": ["Η καλή προετοιμασία είναι το παν", "Αφιερώστε χρόνο σε κάθε βήμα"],
            "warnings": ["Βεβαιωθείτε για τη συμβατότητα μεταξύ στρωμάτων"],
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
        assumptions.append("Γίνεται παραδοχή τυπικής επιφανειακής ζημιάς για βασικό υπολογισμό.")

    # Build a human-readable Greek project type title
    project_type_labels = {
        'damage-repair': 'Επισκευή Ζημιάς',
        'new-parts-painting': 'Βαφή Καινούριου Εξαρτήματος',
        'restoration': 'Αποκατάσταση',
        'protective-coatings': 'Προστατευτικές Επικαλύψεις',
        'custom-finishes': 'Custom Φινίρισμα',
        'marine-antifouling': 'Θαλάσσιο Αντιρρυπαντικό',
        'marine-gelcoat-repair': 'Επισκευή Gelcoat',
        'marine-topside-paint': 'Θαλάσσια Βαφή Πλευρών',
        'marine-wood-varnish': 'Θαλάσσιο Λούστρο Ξύλου',
        'structural-masonry-protection': 'Προστασία Τοιχοποιίας',
        'structural-wood-staining': 'Βαφή Ξύλου',
        'structural-metal-gate-fence': 'Βαφή Μεταλλικής Κατασκευής',
        'structural-interior-wall': 'Εσωτερική Βαφή Τοίχου',
        'general-painting': 'Γενική Βαφή',
    }
    title_label = project_type_labels.get(str(ptype), str(ptype).replace('-', ' ').title())

    return {
        "id": f"sol-{int(time.time())}",
        "title": f"Πλάνο: {title_label}",
        "projectType": ptype,
        "difficulty": calculate_difficulty(state),
        "estimatedTime": "2-4 ώρες",
        "steps": steps,
        "totalPrice": total_price,
        "totalProducts": total_products,
        "suggested_products": suggested_products,
        "assumptions": assumptions
    }
