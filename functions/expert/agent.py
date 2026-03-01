import json
import os
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from pydantic import ValidationError

from core.logger import get_logger
from ai.config import AIConfig
from .schema import ExpertChatResponse, ExpertChatRequest, KnowledgeState, ExpertQuestion
from .state_manager import (
    update_gaps,
    get_most_important_gap,
    is_ready_for_solution,
    get_options_for_gap,
    get_gap_label
)
from .solution_generator import generate_solution
from .tools import search_products, get_paint_rules, lookup_vin

logger = get_logger("expert.agent")

class PaintExpertAgent:
    """
    Agentic retrieval system for automotive paint expertise.
    Uses gemini-2.5-flash-lite for cost-effective expert reasoning.
    """

    def __init__(self):
        from core.llm_config import LLMConfig, ModelName

        # Enforce global LLM Provider logic natively (Vertex AI)
        self.client = LLMConfig.get_client()
        self.model = ModelName.SIMPLE.value

    def _get_extraction_instruction(self) -> str:
        return """
        You are the Pavlicevits Expert state extractor.
        Your job is to read the user's message and history to extract technical project details into the JSON schema.

        ### SPECIAL HANDLING: Structured Answers
        - If a message starts with "Επέλεξα: [VALUE]", it means the user just clicked a structured option in the UI.
        - Map this text VALUE back to the most logical technical field.
        - Example: "Επέλεξα: Καινούριο (Άβαφο/Μαύρο)" maps to `confirmed_facts['partCondition'] = 'new-raw'`.
        - Example: "Επέλεξα: Μέταλλο" maps to `confirmed_facts['material'] = 'metal'`.

        ### FIELDS TO EXTRACT:
        1. 'domain': automotive, marine, structural, industrial, woodworking, general.
        2. 'material': SUBSTANCE only (metal, plastic, aluminum, wood, fiberglass).
           - 'car door' is NOT a material. It's a part. Infer 'metal' or 'plastic'.
        3. 'partCondition': new-raw, new-primed, used.
        4. 'damageDepth': surface, to-primer, to-metal.
        5. 'rust': boolean.
        6. 'colorCode': Specific alpha-numeric paint code.
        7. 'colorType': solid, metallic, pearl.
        8. 'vehicleInfo': Structured string about Year/Make/Model.

        CRITICAL: Be extremely precise. Confirmed facts take priority over inferred ones.
        """

    def _get_system_instruction(self, state: KnowledgeState) -> str:
        rules = get_paint_rules()
        gaps_str = "\n".join(state.gaps.critical) if state.gaps.critical else "None"

        # Format rules safely to avoid nested brace issues in the main f-string
        sequences_str = (
            f"- Bare Metal: {', '.join(rules['sequences']['bare_metal'])}\n"
            f"- Plastic: {', '.join(rules['sequences']['plastic'])}\n"
            f"- Wood: {', '.join(rules['sequences']['wood'])}"
        )

        compatibility_str = "\n".join([f"- {r['rule']}: {r['reason']}" for r in rules['compatibility']])

        return f"""
You are the "Pavlicevits Paint Expert", a professional AI assistant for automotive, marine, and DIY surface repairs.
Respond entirely in GREEK, but use English Technical terms if necessary.

### VEHICLE IDENTIFICATION STRATEGY (PRIORITY)
Your goal is to identify the vehicle and its color code with MINIMAL user effort:
1. **Try Vague First**: If the user provides Year/Make/Model, use your internal expertise to identify the exact OEM color names and WHERE the paint sticker is located.
2. **Request VIN as Fallback**: ONLY ask for a VIN if the info is too vague or conflicting.
3. **Internal Expertise**: You are an expert. Answer questions about paint code locations (e.g., 'door jamb', 'under hood') directly from your knowledge.

### CURRENT STATE
- Domain: {state.domain}
- Type: {state.project_type}
- Missing Critical Info: {gaps_str}

### THE PHYSICS OF PAINT
- Standard Sequences:
{sequences_str}
- Compatibility Rules:
{compatibility_str}

### TOOLS
- `search_products`: Find the exact products in our store.
- `lookup_vin`: Decode a 17-character VIN for cars/trucks for ultimate precision.
- `search_vehicle_specs`: Find where paint codes are on specific brands and common colors.

### REASONING PROCESS
1. **Analyze Gaps:** If critical info is missing, ask a clarifying question in Greek.
2. **Identify Vehicle:** Use search or VIN tools to pinpoint the paint color.
3. **Guidance:** Tell the user exactly where their paint code is located.

### CRITICAL RULES FOR RESPONSE GENERATION
7. **MANDATORY COHESION**: If a follow-up question (gap) is identified, your natural language response (answer) MUST directly introduce that question and ONLY that question. Do not ask for other information in the text if a structured question card is being presented.
8. **Language**: Always respond in Greek (Ελληνικά) to the user.
9. **No Stalling**: Do not say "Please wait" or "I am looking that up" unless you are actually finishing a tool call and providing the results in the same turn.
- Only provide a conversational answer AFTER you have all the information from the tools.
"""

    async def _extract_state(self, user_message: str, current_state: KnowledgeState, history: List[Dict[str, str]]) -> KnowledgeState:
        """Uses Structured Outputs to parse the new fact into the existing state."""
        contents = []
        if history:
            for h in history:
                role = "model" if h["role"] == "model" else "user"
                contents.append(types.Content(role=role, parts=[types.Part(text=h.get("content", ""))]))
        
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))
        
        config = types.GenerateContentConfig(
            system_instruction=self._get_extraction_instruction(),
            temperature=0.1,
            response_mime_type="application/json",
            response_schema=KnowledgeState
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config
            )
            data = json.loads(response.text)
            
            # Merge logic: update the incoming state with new confirmed/inferred facts
            # In a real app we'd deep merge. Here we replace for simplicity.
            new_state_data = current_state.dict()
            if "domain" in data: new_state_data["domain"] = data["domain"]
            if "project_type" in data: new_state_data["project_type"] = data["project_type"]
            
            new_state_data["confirmed_facts"].update(data.get("confirmed_facts", {}))
            new_state_data["inferred_facts"].update(data.get("inferred_facts", {}))
            
            # Recompute gaps based on the python rules engine
            merged_state = KnowledgeState(**new_state_data)
            return update_gaps(merged_state)
            
        except Exception as e:
            logger.error(f"State Extraction Failed: {e}")
            return current_state


    async def chat(self, user_message: str, history: List[Dict[str, str]] = None, current_state: KnowledgeState = None) -> ExpertChatResponse:
        """
        Executes the expert chat loop with unified reasoning and formatting.
        """
        state = current_state or KnowledgeState()
        
        # 1. Extraction Pass
        state = await self._extract_state(user_message, state, history)
        
        # Determine Gaps early for cohesion
        ready = is_ready_for_solution(state)
        most_important_gap = get_most_important_gap(state)
        gap_label = get_gap_label(most_important_gap) if most_important_gap else None
        
        contents = []
        if history:
            for h in history:
                role = "model" if h["role"] == "model" else "user"
                contents.append(types.Content(role=role, parts=[types.Part(text=h.get("content", ""))]))
        
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))
        
        try:
            # 1. PEAK/REASONING LOOP
            max_turns = 5
            suggested_products = []
            final_text = ""
            
            system_instruction = self._get_system_instruction(state)
            if most_important_gap:
                system_instruction += f"\n\n### ACTIVE FOCUS\nWe are currently missing critical information: {most_important_gap} ({gap_label}). Your text response MUST prioritize asking for THIS information above all else. Do not ask for multiple things at once if this gap is critical."

            reasoning_config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=[types.Tool(function_declarations=[
                    types.FunctionDeclaration(name="search_products", description="Search the Shopify store for products.", parameters={
                                "type": "OBJECT",
                                "properties": {
                                    "category": {"type": "STRING"},
                                    "chemical_base": {"type": "STRING"},
                                    "surfaces": {"type": "ARRAY", "items": {"type": "STRING"}},
                                    "query": {"type": "STRING"}
                                }
                            }),
                    types.FunctionDeclaration(name="lookup_vin", description="Decode a 17-character VIN.", parameters={
                                "type": "OBJECT",
                                "properties": {
                                    "vin": {"type": "STRING"}
                                },
                                "required": ["vin"]
                            }),
                ])],
                temperature=0.2
            )

            for turn in range(max_turns):
                logger.info(f"Expert Chat Turn {turn+1} Starting")
                
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=reasoning_config
                )
                
                if not response.candidates:
                    logger.error("No candidates returned from LLM")
                    break
                    
                candidate = response.candidates[0]
                if not candidate.content or not candidate.content.parts:
                    logger.error("Empty candidate content")
                    break
                    
                function_calls = [p.function_call for p in candidate.content.parts if p.function_call]
                
                if not function_calls:
                    final_text = (response.text or "").strip()
                    # Defensive: If turn 1 looks like a stall response, force a re-prompt
                    if turn == 0 and any(keyword in final_text.lower() for keyword in ["περιμένετε", "αναζητώ", "wait", "looking up", "μια στιγμή"]):
                        logger.info("Reasoning Stalled with filler. Forcing turn 2.")
                        contents.append(candidate.content)
                        contents.append(types.Content(role="user", parts=[types.Part(text="[SYSTEM: Call the necessary tool now. Do not provide more filler.]")]))
                        continue
                        
                    logger.info(f"Reasoning Complete. Final Text (Reasoned): {final_text[:100]}...")
                    break
                
                logger.info(f"Tool Phase: Model requested {len(function_calls)} tool calls")
                contents.append(candidate.content)
                tool_parts = []
                for fc in function_calls:
                    if fc.name == "search_products":
                        results = search_products(**fc.args)
                        suggested_products.extend(results)
                        logger.info(f"Tool execution: search_products yielded {len(results)} results")
                        tool_parts.append(types.Part.from_function_response(
                            name=fc.name,
                            response={"products": results}
                        ))
                    elif fc.name == "lookup_vin":
                        results = lookup_vin(**fc.args)
                        logger.info(f"Tool execution: lookup_vin decoded vehicle: {results.get('make')} {results.get('model')}")
                        tool_parts.append(types.Part.from_function_response(
                            name=fc.name,
                            response={"vehicle_info": results}
                        ))
                
                contents.append(types.Content(role="tool", parts=tool_parts))
            
            # 2. FORMATTING PASS
            if not final_text or len(final_text) < 10:
                final_text = "Συγγνώμη, δεν μπόρεσα να επεξεργαστώ σωστά τις τεχνικές λεπτομέρειες."
            
            cohesion_note = ""
            if most_important_gap:
                cohesion_note = f"CRITICAL: The UI will display a card asking for '{gap_label}'. Your 'answer' MUST introduce this specific question and match its tone. Do NOT ask for vehicle info if you are asking for {gap_label}."

            formatting_contents = [types.Content(role="user", parts=[types.Part(text=f"""
                INITIAL STATE: {state.json()}
                EXPERT REASONING: {final_text}
                PRODUCT SUGGESTIONS: {json.dumps(suggested_products[:10], ensure_ascii=False)}
                {cohesion_note}
            """)])]
            
            formatting_system_instruction = """
You are a strict JSON formatter for the Pavlicevits Paint Expert system. Your ONLY job is to convert
the provided context into a valid ExpertChatResponse JSON object.

FIELD RULES:
- 'answer': MUST be natural, expert, conversational Greek. Acknowledge what the user said, then briefly
  introduce the question being asked (if any). Keep it concise (2-4 sentences max). Do NOT list products here.
- 'question': Populate this ONLY when there is an ACTIVE FOCUS gap. Use the gap's label for the question
  text in Greek. Set to null if ready_for_solution=True.
- 'ready_for_solution': Set to True ONLY if EXPERT REASONING says critical gaps are resolved.
- 'solution': Set ONLY when ready_for_solution=True. Otherwise null.
- 'suggested_products': Include all products from PRODUCT SUGGESTIONS as a list of dicts with 'handle', 'title', 'price'.
- 'safety_warnings': Include any safety notes from the EXPERT REASONING as a list of Greek strings.
- 'state': Return the INITIAL STATE dict provided, updated with any newly extracted facts.
- NEVER ask for multiple things at once. NEVER add product listings or 'add to cart' instructions in 'answer'.
"""
            formatting_config = types.GenerateContentConfig(
                system_instruction=formatting_system_instruction,
                response_schema=ExpertChatResponse,
                response_mime_type="application/json",
                temperature=0.0
            )
            
            format_response = self.client.models.generate_content(model=self.model, contents=formatting_contents, config=formatting_config)
            
            try:
                if hasattr(format_response, 'parsed') and format_response.parsed:
                    response_obj = format_response.parsed
                else:
                    response_obj = ExpertChatResponse(**json.loads(format_response.text or "{}"))
                
                if not response_obj.answer or len(response_obj.answer) < 15: 
                    response_obj.answer = final_text
                if response_obj.state:
                    state = update_gaps(KnowledgeState(**response_obj.state))
            except Exception as fe:
                response_obj = ExpertChatResponse(answer=final_text)

            # Final Overrides
            final_ready = is_ready_for_solution(state)
            final_gap = get_most_important_gap(state)
            
            response_obj.state = state.dict()
            response_obj.ready_for_solution = final_ready
            
            if not final_ready and final_gap:
                options = get_options_for_gap(final_gap)
                response_obj.question = ExpertQuestion(id=final_gap, text=f"Για να σας δώσω την καλύτερη λύση, χρειάζομαι μια διευκρίνιση: Ποιο είναι το {get_gap_label(final_gap)};", type="multiple-choice" if options else "text", options=options)
            elif final_ready:
                solution_data = generate_solution(state, suggested_products)
                response_obj.solution = solution_data
                response_obj.suggested_products = solution_data.get('suggested_products', [])
            
            return response_obj
            
        except Exception as e:
            logger.error(f"PaintExpertAgent.chat failed: {e}")
            return ExpertChatResponse(
                answer="Λυπάμαι, παρουσιάστηκε ένα πρόβλημα κατά την επεξεργασία του αιτήματός σας.",
                safety_warnings=[f"Σφάλμα: {str(e)}"],
                state=state.dict() if state else None
            )
