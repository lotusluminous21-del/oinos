# functions/expert_v2/question_bank.py
# Owns: Static Greek question definitions. Pure data — no logic, no LLM.
# Every possible question the system can ask is defined exactly once, here.

from .schema import ExpertQuestion, QuestionOption

QUESTIONS: dict[str, ExpertQuestion] = {

    # ── Project identification ──────────────────────────────────────────────
    "domain": ExpertQuestion(
        id="domain",
        text="Σε τι είδους επιφάνεια αναφέρεστε;",
        type="multiple-choice",
        options=[
            QuestionOption(id="automotive", label="Αυτοκίνητο / Όχημα", value="automotive",
                           description="Αμάξωμα, πόρτες, φτερά, προφυλακτήρες"),
            QuestionOption(id="marine", label="Σκάφος / Θαλάσσιο", value="marine",
                           description="Γάστρα, κατάστρωμα, πλευρά"),
            QuestionOption(id="structural", label="Κτήριο / Κατασκευή", value="structural",
                           description="Τοίχοι, μέταλλο, ξύλο, εξωτ. επιφάνειες"),
        ]
    ),

    "project_type": ExpertQuestion(
        id="project_type",
        text="Τι είδους εργασία θέλετε να κάνετε;",
        type="multiple-choice",
        options=[
            QuestionOption(id="damage_repair", label="Επισκευή Ζημιάς", value="damage_repair",
                           description="Γρατζουνιές, βαθουλώματα, αποφλοιώσεις"),
            QuestionOption(id="new_parts", label="Βαφή Καινούριου Εξαρτήματος", value="new_parts",
                           description="Νέα πόρτα, καπό, φτερό — από μηδέν"),
            QuestionOption(id="restoration", label="Αποκατάσταση / Ολική Επαναβαφή", value="restoration",
                           description="Πλήρης ανακαίνιση βαφής"),
            QuestionOption(id="protective", label="Προστατευτικές Επικαλύψεις", value="protective",
                           description="Κεραμική, PPF, αδιαβροχοποίηση"),
        ]
    ),

    # ── Surface material ────────────────────────────────────────────────────
    "material": ExpertQuestion(
        id="material",
        text="Ποιο είναι το υλικό της επιφάνειας;",
        type="multiple-choice",
        help_text="Πόρτες, καπό, φτερά είναι συνήθως μέταλλο. Προφυλακτήρες είναι πλαστικό.",
        options=[
            QuestionOption(id="metal", label="Μέταλλο", value="metal",
                           description="Πόρτες, καπό, φτερά, γάστρα"),
            QuestionOption(id="plastic", label="Πλαστικό", value="plastic",
                           description="Προφυλακτήρες, πλαίσια καθρεφτών"),
            QuestionOption(id="fiberglass", label="Fiberglass / Πολυεστέρας", value="fiberglass",
                           description="Σκάφη, custom body kits"),
            QuestionOption(id="wood", label="Ξύλο", value="wood",
                           description="Εσωτερικά, ξύλινα δομικά"),
        ]
    ),

    # ── Damage specifics ────────────────────────────────────────────────────
    "damage_depth": ExpertQuestion(
        id="damage_depth",
        text="Πόσο βαθιά είναι η ζημιά;",
        type="multiple-choice",
        help_text="Περάστε το νύχι σας: αν πιάνει, είναι πιο βαθιά από γρατζουνιά.",
        options=[
            QuestionOption(id="surface", label="Επιφανειακό", value="surface",
                           description="Μόνο γρατζουνιές στο χρώμα"),
            QuestionOption(id="to_primer", label="Βαθύ — ως το Αστάρι", value="to_primer",
                           description="Φαίνεται γκρι/λευκό κάτω"),
            QuestionOption(id="to_metal", label="Πολύ Βαθύ — ως το Μέταλλο", value="to_metal",
                           description="Φαίνεται το γυμνό/γυαλιστερό μέταλλο"),
        ]
    ),

    "damage_size": ExpertQuestion(
        id="damage_size",
        text="Πόσο μεγάλη είναι η ζημιά;",
        type="multiple-choice",
        options=[
            QuestionOption(id="small", label="Μικρή (μέγεθος κέρματος)", value="small"),
            QuestionOption(id="medium", label="Μεσαία (μέγεθος παλάμης)", value="medium"),
            QuestionOption(id="large", label="Μεγάλη (πάνω από πυγμή)", value="large"),
            QuestionOption(id="panel", label="Ολόκληρο Πάνελ / Εξάρτημα", value="panel"),
        ]
    ),

    "rust_present": ExpertQuestion(
        id="rust_present",
        text="Υπάρχει σκουριά στην περιοχή;",
        type="multiple-choice",
        help_text="Κοιτάξτε για πορτοκαλί/καφέ χρωματισμό γύρω από τη ζημιά.",
        options=[
            QuestionOption(id="yes", label="Ναι, υπάρχει σκουριά", value="yes",
                           description="Πορτοκαλί/καφέ χρώμα ή πρήξιμο"),
            QuestionOption(id="no", label="Όχι, είναι καθαρό", value="no",
                           description="Μόνο χρώμα ή γυμνό μέταλλο"),
        ]
    ),

    # ── Color specifics ─────────────────────────────────────────────────────
    "color_type": ExpertQuestion(
        id="color_type",
        text="Τι τύπος χρώματος είναι η επιφάνεια;",
        type="multiple-choice",
        help_text="Το μεταλλικό έχει σπίθες, το περλέ αλλάζει χρώμα ανάλογα τη γωνία.",
        options=[
            QuestionOption(id="solid", label="Συμπαγές (Solid)", value="solid",
                           description="Ένα χρώμα, χωρίς αντανακλάσεις"),
            QuestionOption(id="metallic", label="Μεταλλικό (Metallic)", value="metallic",
                           description="Σπίθες και βάθος στο χρώμα"),
            QuestionOption(id="pearl", label="Περλέ (Pearl / Tricoat)", value="pearl",
                           description="Αλλάζει χρώμα ανάλογα τη γωνία"),
        ]
    ),

    "color_code": ExpertQuestion(
        id="color_code",
        text="Ποιος είναι ο κωδικός χρώματος;",
        type="text",
        help_text="Βρείτε τον στο ταμπελάκι του κατασκευαστή (π.χ., σασί αυτοκινήτου, προδιαγραφές υλικού). Μοιάζει με: 'NH-578', 'RAL 9005', '040'."
    ),

    "color_description": ExpertQuestion(
        id="color_description",
        text="Περιγράψτε το χρώμα όσο καλύτερα μπορείτε.",
        type="text",
        help_text="Π.χ. 'Σκούρο μπλε μεταλλικό Peugeot', 'Λευκό του πάγου' ή 'Ασημί της Mercedes'."
    ),

    # ── Part condition (new parts) ───────────────────────────────────────────
    "part_condition": ExpertQuestion(
        id="part_condition",
        text="Σε ποια κατάσταση είναι η επιφάνεια / εξάρτημα;",
        type="multiple-choice",
        options=[
            QuestionOption(id="new_raw", label="Καινούριο — Άβαφο / Γυμνό", value="new_raw",
                           description="Δεν έχει βαφεί ποτέ"),
            QuestionOption(id="new_primed", label="Καινούριο — Με εργοστασιακό αστάρι", value="new_primed",
                           description="Έτοιμο για βαφή"),
            QuestionOption(id="used", label="Μεταχειρισμένο — Με Παλιά Βαφή", value="used",
                           description="Έχει παλιά βαφή πάνω"),
        ]
    ),

    # ── Equipment ───────────────────────────────────────────────────────────
    "equipment_level": ExpertQuestion(
        id="equipment_level",
        text="Τι εξοπλισμό έχετε διαθέσιμο;",
        type="multiple-choice",
        options=[
            QuestionOption(id="aerosol", label="Spray Cans μόνο", value="aerosol",
                           description="Κουτάκια σπρέι, χωρίς compressor"),
            QuestionOption(id="basic", label="Βασικός εξοπλισμός", value="basic",
                           description="Πινέλα, ρολό, μικρά εργαλεία"),
            QuestionOption(id="spray_gun", label="Πιστόλι βαφής + Compressor", value="spray_gun",
                           description="Επαγγελματικός εξοπλισμός"),
        ]
    ),
}
