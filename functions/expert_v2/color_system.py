# functions/expert_v2/color_system.py
# Owns: All color intelligence — VIN lookup, color code suggestions, description matching.
# Pure data + API calls. No LLM, no state decisions.

from __future__ import annotations
import requests
from typing import Optional
from core.logger import get_logger

log = get_logger("expert_v2.color_system")

# ─── Color family → common Greek automotive shade families ──────────────────
COLOR_FAMILIES: dict[str, list[str]] = {
    "black":   ["μαύρο", "μαυρο", "black", "noir", "schwarz", "nero"],
    "white":   ["άσπρο", "ασπρο", "λευκό", "λευκο", "white", "blanc", "weiss"],
    "silver":  ["ασημί", "ασημι", "ασημένιο", "silver", "silber", "argent", "γκρι μεταλλικό"],
    "grey":    ["γκρι", "γκρι", "grey", "gray", "grau", "gris"],
    "red":     ["κόκκινο", "κοκκινο", "red", "rouge", "rot", "rosso"],
    "blue":    ["μπλε", "blue", "bleu", "blau", "azzurro", "γαλάζιο", "γαλαζιο"],
    "green":   ["πράσινο", "πρασινο", "green", "vert", "grün", "verde"],
    "brown":   ["καφέ", "καφε", "brown", "brun", "braun", "marrone", "μπεζ"],
    "orange":  ["πορτοκαλί", "πορτοκαλι", "orange"],
    "yellow":  ["κίτρινο", "κιτρινο", "yellow", "jaune", "gelb", "giallo"],
    "beige":   ["μπεζ", "beige", "creme", "cream"],
    "purple":  ["μωβ", "μοβ", "purple", "violet", "lila", "viola"],
    "gold":    ["χρυσό", "χρυσο", "gold", "or"],
}

# Common automotive color codes by family (for suggestion when user doesn't know exact code)
COMMON_COLOR_CODES: dict[str, list[dict]] = {
    "black": [
        {"code": "040", "name": "Super Black", "brands": ["Nissan", "Toyota", "Infiniti"]},
        {"code": "668", "name": "Jet Black", "brands": ["BMW"]},
        {"code": "A1", "name": "Brilliant Black", "brands": ["Audi", "VW", "Skoda"]},
        {"code": "L041", "name": "Deep Black Pearl", "brands": ["VW", "Porsche", "SEAT"]},
        {"code": "197", "name": "Black Sapphire", "brands": ["BMW"]},
    ],
    "white": [
        {"code": "NH-578", "name": "Taffeta White", "brands": ["Honda"]},
        {"code": "QM1", "name": "Pearl White", "brands": ["Hyundai", "Kia"]},
        {"code": "W09", "name": "Alpine White", "brands": ["BMW"]},
        {"code": "LY9C", "name": "Candy White", "brands": ["VW", "Audi", "SEAT"]},
        {"code": "PW7", "name": "Bright White", "brands": ["Jeep", "Chrysler", "Dodge"]},
    ],
    "silver": [
        {"code": "1C0", "name": "Reflex Silver", "brands": ["VW", "Audi"]},
        {"code": "775", "name": "Space Grey", "brands": ["BMW"]},
        {"code": "NH-700M", "name": "Alabaster Silver", "brands": ["Honda"]},
        {"code": "KH3", "name": "Lunar Silver", "brands": ["Honda"]},
        {"code": "S", "name": "Titanium Silver", "brands": ["Hyundai", "Kia"]},
    ],
    "grey": [
        {"code": "A2", "name": "Daytona Grey Pearl", "brands": ["Audi"]},
        {"code": "M7U", "name": "Magnetic Grey", "brands": ["Toyota"]},
        {"code": "475", "name": "Mineral Grey", "brands": ["BMW"]},
        {"code": "LH7X", "name": "Indium Grey", "brands": ["VW", "Audi"]},
    ],
    "red": [
        {"code": "R81", "name": "San Marino Red", "brands": ["Honda"]},
        {"code": "C3", "name": "Cherry Red", "brands": ["Hyundai"]},
        {"code": "300", "name": "Rallye Red", "brands": ["Honda"]},
        {"code": "A3", "name": "Misano Red Pearl", "brands": ["Audi"]},
        {"code": "C08", "name": "Chili Red", "brands": ["BMW", "Mini"]},
    ],
    "blue": [
        {"code": "B539M", "name": "Estoril Blue", "brands": ["BMW"]},
        {"code": "LX5W", "name": "Sepang Blue", "brands": ["VW", "Audi"]},
        {"code": "NH-565M", "name": "Royal Blue Pearl", "brands": ["Honda"]},
        {"code": "8X8", "name": "Reef Blue", "brands": ["Hyundai"]},
    ],
}


def detect_color_family(user_text: str) -> Optional[str]:
    """
    Detects color family from free-text input. Returns family key or None.
    """
    text_lower = user_text.lower()
    for family, keywords in COLOR_FAMILIES.items():
        for kw in keywords:
            if kw in text_lower:
                return family
    return None


def suggest_color_codes(
    color_family: str,
    vehicle_make: Optional[str] = None,
) -> list[dict]:
    """
    Returns a short list of likely color codes for a family.
    Prioritizes codes that match the vehicle make if known.
    """
    candidates = COMMON_COLOR_CODES.get(color_family, [])
    if not candidates:
        return []

    if vehicle_make:
        make_upper = vehicle_make.upper()
        # Score: match if make is in the code's brand list
        scored = []
        for c in candidates:
            brands_upper = [b.upper() for b in c.get("brands", [])]
            score = 2 if make_upper in brands_upper else 1
            scored.append((score, c))
        scored.sort(key=lambda x: -x[0])
        return [x[1] for x in scored[:4]]

    return candidates[:4]


def lookup_vin(vin: str) -> dict:
    """
    Decodes VIN using NHTSA vPIC API (free, no key).
    Returns make, model, year, body_class.
    """
    log.info("color_system: VIN lookup", vin=vin)
    try:
        url = f"https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{vin}?format=json"
        r = requests.get(url, timeout=8)
        data = r.json()
        result = data.get("Results", [{}])[0]
        make = result.get("Make", "").strip()
        model = result.get("Model", "").strip()
        year = result.get("ModelYear", "").strip()
        body = result.get("BodyClass", "").strip()
        if make:
            log.info("color_system: VIN decoded", make=make, model=model, year=year)
            return {"make": make, "model": model, "year": year, "body_class": body, "source": "NHTSA"}
        return {"error": "VIN decoded but make not found"}
    except Exception as e:
        log.error("color_system: VIN lookup failed", exc_info=e)
        return {"error": str(e)}


def build_color_context(confirmed_facts: dict) -> dict:
    """
    Synthesizes all color intelligence from the current confirmed state.
    Returns a dict that enriches the state / solution builder.
    """
    color_code = confirmed_facts.get("color_code")
    color_description = confirmed_facts.get("color_description")
    color_type = confirmed_facts.get("color_type")
    vehicle_make = confirmed_facts.get("vehicle_make")

    result: dict = {}

    if color_code:
        result["color_code"] = color_code
        result["color_source"] = "user_provided"

    if color_description and not color_code:
        family = detect_color_family(color_description)
        if family:
            suggestions = suggest_color_codes(family, vehicle_make)
            result["color_family"] = family
            result["color_description"] = color_description
            result["color_suggestions"] = suggestions
            result["color_source"] = "description_matched"
            if suggestions:
                # Use the top suggestion as a soft recommendation
                result["recommended_code"] = suggestions[0]["code"]
                result["recommended_code_name"] = suggestions[0]["name"]
        else:
            result["color_description"] = color_description
            result["color_source"] = "description_unmatched"

    return result
