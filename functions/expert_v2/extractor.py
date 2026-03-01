from __future__ import annotations
import json
from google import genai
from google.genai import types

from .schema import KnowledgeState
from core.logger import get_logger
from core.llm_config import LLMConfig

log = get_logger("expert_v2.extractor")

_MODEL_EXTRACT = LLMConfig.get_model_name(complex=False)  # gemini-2.5-flash-lite

EXTRACTION_SYSTEM_PROMPT = """
You are a fact extractor for a paint expert system.
Your ONLY job is to read the user's message and update the KnowledgeState JSON.

FIELD MAPPING RULES:
- domain: 'automotive' | 'marine' | 'structural'
- project_type: 'damage_repair' | 'new_parts' | 'restoration' | 'protective' |
                'marine_antifouling' | 'marine_gelcoat' | 'marine_topside' |
                'structural_masonry' | 'structural_wood' | 'structural_metal'
- material: 'metal' | 'plastic' | 'fiberglass' | 'wood'
- damage_depth: 'surface' | 'to_primer' | 'to_metal'
- damage_size: 'small' | 'medium' | 'large' | 'panel'
- rust_present: 'yes' | 'no'
- color_type: 'solid' | 'metallic' | 'pearl'
- color_code: exact string e.g. 'NH-578', 'RAL 9005', '040', 'LY9B'
- color_description: natural language description e.g. 'dark blue peugeot', 'silver metallic', 'λευκό του πάγου'
- part_condition: 'new_raw' | 'new_primed' | 'used'
- equipment_level: 'aerosol' | 'basic' | 'spray_gun'
- vehicle_make, vehicle_model, vehicle_year: strings
- vin: string if a VIN was provided

CONFIDENCE for inferred_facts:
- confirmed_facts: user EXPLICITLY stated this
- inferred_facts: {"field": {"value": "...", "confidence": "HIGH"|"MEDIUM"|"LOW", "source": "text"}}
- Only include HIGH confidence inferences

JUNK REFUSAL:
- If the user says "I don't know", "δεν ξέρω", "maybe", or expresses uncertainty, DO NOT extract a value for that field in confirmed_facts.
- CRITICAL: NEVER extract placeholder strings like "[κωδικός χρώματος]", "[color code]", or similar. If you don't have a real value, leave it out.
- Ignore generic filler text.
- If the user says they don't know the color CODE, leave 'color_code' empty. Do not guess.

User may write in Greek or English.
OUTPUT: Return ONLY the updated KnowledgeState JSON. No commentary.
"""


def extract_facts_sync(
    message: str,
    history: list[dict],
    current_state: KnowledgeState,
    client: genai.Client,
) -> KnowledgeState:
    """
    Synchronous LLM call to extract facts from user message.
    Returns updated KnowledgeState.
    """
    context_lines = []
    for h in history[-6:]:
        role = "User" if h.get("role") == "user" else "Assistant"
        context_lines.append(f"{role}: {h.get('content', '')}")

    extraction_prompt = f"""CURRENT STATE:
{current_state.model_dump_json(indent=2)}

CONVERSATION CONTEXT:
{chr(10).join(context_lines) if context_lines else '(first message)'}

NEW USER MESSAGE:
{message}

Update and return the KnowledgeState JSON with any new facts from the user message.
Only add/update fields you are confident about. Do not remove existing confirmed_facts."""

    try:
        response = client.models.generate_content(
            model=_MODEL_EXTRACT,
            contents=[extraction_prompt],
            config=types.GenerateContentConfig(
                system_instruction=EXTRACTION_SYSTEM_PROMPT,
                response_mime_type="application/json",
                temperature=0.0,
                max_output_tokens=1024,
            )
        )

        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        updated_dict = json.loads(raw)
        log.info("extractor: LLM response parsed",
                 new_confirmed=list(updated_dict.get("confirmed_facts", {}).keys()),
                 domain=updated_dict.get("domain"),
                 project_type=updated_dict.get("project_type"))

        # Safe merge
        merged = current_state.model_dump()
        new_confirmed = updated_dict.get("confirmed_facts", {})
        merged["confirmed_facts"].update(new_confirmed)
        
        # Add new inferences, but only if they aren't in confirmed_facts
        for field, val in updated_dict.get("inferred_facts", {}).items():
            if field not in merged["confirmed_facts"]:
                merged["inferred_facts"][field] = val
                
        # CRITICAL: If a field is now confirmed, it MUST be removed from inferences
        for field in list(merged["inferred_facts"].keys()):
            if field in merged["confirmed_facts"]:
                del merged["inferred_facts"][field]

        if merged.get("domain") in ("unknown", None, "") and updated_dict.get("domain"):
            merged["domain"] = updated_dict["domain"]
        if merged.get("project_type") in ("unknown", None, "") and updated_dict.get("project_type"):
            merged["project_type"] = updated_dict["project_type"]

        return KnowledgeState(**merged)

    except Exception as e:
        log.error("extractor: failed", exc_info=e,
                  message_preview=message[:80])
        return current_state
