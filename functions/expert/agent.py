import json
import os
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from pydantic import ValidationError

from core.logger import get_logger
from ai.config import AIConfig
from .schema import ExpertChatResponse, ExpertChatRequest, KnowledgeState, ExpertQuestion
from .state_manager import update_gaps, get_most_important_gap, is_ready_for_solution, get_effective_value, get_options_for_gap
from .solution_generator import generate_solution
from .tools import search_products, get_paint_rules, lookup_vin, search_vehicle_specs

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
        Your job is to read the user's message and the current conversation history, and extract the technical facts about their painting project into the precise JSON/Pydantic schema provided.
        Identify the ProjectDomain (automotive, marine, structural), the MaterialType, DamageDepth, Environment, etc.
        If a user mentions a boat, it's marine. If a user mentions a wall or a gate, it's structural.
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
1. **Try Vague First**: If the user provides Year/Make/Model (e.g., '2016 VW Golf Black'), use `search_vehicle_specs` and your inner knowledge to identify the exact OEM color names and WHERE the paint sticker is located.
2. **Request VIN as Fallback**: ONLY ask for a VIN if the info is too vague or conflicting.
3. **Motorbikes/Marine**: Use `search_vehicle_specs` to find paint locations (e.g., 'Under the seat' or 'Head tube').

### CURRENT STATE
- Domain: {state.project_context.project_domain}
- Type: {state.project_context.project_type}
- Missing Critical Info: {gaps_str}

### THE PHYSICS OF PAINT
- Standard Sequences:
{sequences_str}
- Compatibility Rules:
{compatibility_str}

### TOOLS
- `search_products`: Find the exact products in our store.
- `lookup_vin`: Decode a VIN for cars/trucks for ultimate precision.
- `search_vehicle_specs`: Find where paint codes are on specific brands and common colors.

### REASONING PROCESS
1. **Analyze Gaps:** If critical info is missing, ask a clarifying question in Greek.
2. **Identify Vehicle:** Use search or VIN tools to pinpoint the paint color.
3. **Guidance:** Tell the user exactly where their paint code is located (e.g., 'Στην κολόνα της πόρτας του οδηγού').
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
            new_state_data["project_context"].update(data.get("project_context", {}))
            new_state_data["confirmed"].update(data.get("confirmed", {}))
            new_state_data["inferred"].update(data.get("inferred", {}))
            
            # Recompute gaps based on the python rules engine
            merged_state = KnowledgeState(**new_state_data)
            return update_gaps(merged_state)
            
        except Exception as e:
            logger.error(f"State Extraction Failed: {e}")
            return current_state


    async def chat(self, user_message: str, history: List[Dict[str, str]] = None, current_state: KnowledgeState = None) -> ExpertChatResponse:
        """
        Executes the expert chat loop with explicit tool handling and the new state engine.
        """
        state = current_state or KnowledgeState()
        
        # 1. Extraction Pass
        state = await self._extract_state(user_message, state, history)
        
        # 2. Check Gaps & If Ready
        ready = is_ready_for_solution(state)
        most_important_gap = get_most_important_gap(state)
        
        
        contents = []
        if history:
            for h in history:
                role = "model" if h["role"] == "model" else "user"
                contents.append(types.Content(role=role, parts=[types.Part(text=h.get("content", ""))]))
        
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))
        
        try:
            # 1. PEAK/REASONING LOOP (No structured output constraint yet)
            # This avoids the model getting confused when trying to call tools while forced to match a JSON schema.
            max_turns = 5
            suggested_products = []
            final_text = ""
            
            # Initial config for reasoning (TOOLS YES, SCHEMA NO)
            reasoning_config = types.GenerateContentConfig(
                system_instruction=self._get_system_instruction(state),
                tools=[types.Tool(
                    function_declarations=[
                        types.FunctionDeclaration(
                            name="search_products",
                            description="Search the Shopify store for products.",
                            parameters={
                                "type": "OBJECT",
                                "properties": {
                                    "category": {"type": "STRING"},
                                    "chemical_base": {"type": "STRING"},
                                    "surfaces": {"type": "ARRAY", "items": {"type": "STRING"}},
                                    "query": {"type": "STRING"}
                                }
                            }
                        ),
                        types.FunctionDeclaration(
                            name="lookup_vin",
                            description="Decode a 17-character VIN for cars and trucks.",
                            parameters={
                                "type": "OBJECT",
                                "properties": {
                                    "vin": {"type": "STRING"}
                                },
                                "required": ["vin"]
                            }
                        ),
                        types.FunctionDeclaration(
                            name="search_vehicle_specs",
                            description="Look up technical details, colors, and paint location guide for any vehicle type.",
                            parameters={
                                "type": "OBJECT",
                                "properties": {
                                    "query": {"type": "STRING", "description": "e.g., '2015 Yamaha R1 color code location'"}
                                },
                                "required": ["query"]
                            }
                        )
                    ]
                )],
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
                    elif fc.name == "search_vehicle_specs":
                        # The agent uses its own search capability or the tool logic
                        results = search_vehicle_specs(**fc.args)
                        logger.info(f"Tool execution: search_vehicle_specs requested: {fc.args.get('query')}")
                        tool_parts.append(types.Part.from_function_response(
                            name=fc.name,
                            response={"specs": results}
                        ))
                
                contents.append(types.Content(role="tool", parts=tool_parts))
            
            # 2. FORMATTING PASS (Structured Output YES, Tools NO)
            # Take the reasoned final_text and the identified suggested_products, and wrap in ExpertChatResponse
            logger.info("Starting Formatting Pass (Phase 2)")

            # SAFETY GUARD: If reasoning failed or returned nonsense, provide a safe fallback in Greek.
            if not final_text or len(final_text) < 10:
                logger.warning("Reasoning pass failed or was too short. Using safety fallback.")
                final_text = "Συγγνώμη, δεν μπόρεσα να επεξεργαστώ σωστά τις τεχνικές λεπτομέρειες για το έργο σας. Παρακαλώ δώστε μου περισσότερες πληροφορίες για την επιφάνεια ή το πρόβλημα που θέλετε να αντιμετωπίσετε."
            
            # The goal here is transformation from Reasoning -> Schema, not new content generation.
            formatting_contents = [
                types.Content(role="user", parts=[types.Part(text=f"The following is a verified expert reasoning for a customer. Transform it into the requested JSON schema.\n\n### EXPERT REASONING:\n{final_text}\n\n### DETECTED PRODUCTS ({len(suggested_products)}):\n{json.dumps(suggested_products[:10], ensure_ascii=False)}")])
            ]
            
            formatting_config = types.GenerateContentConfig(
                system_instruction="You are the Pavlicevits Expert JSON mapper. Your task is to extract the main conversational text from 'EXPERT REASONING' and put it into the 'answer' field. Identify products for the 'suggested_products' field. You are an expert in automotive paint and DIY repairs. Do NOT hallucinate advice about unrelated topics like hair/skincare.",
                response_schema=ExpertChatResponse,
                response_mime_type="application/json",
                temperature=0.0
            )
            
            format_response = self.client.models.generate_content(
                model=self.model,
                contents=formatting_contents,
                config=formatting_config
            )
            
            try:
                if hasattr(format_response, 'parsed') and format_response.parsed:
                    response_obj = format_response.parsed
                else:
                    text = (format_response.text or "{}").strip()
                    if text.startswith("```"):
                        lines = text.split("\n")
                        if lines[0].strip().startswith("```"): lines = lines[1:]
                        if lines and lines[-1].strip().startswith("```"): lines = lines[:-1]
                        text = "\n".join(lines).strip()
                    
                    data = json.loads(text)
                    response_obj = ExpertChatResponse(**data)
                
                # Double check mapping: if LLM failed to copy 'final_text' into 'answer', we force it.
                if not response_obj.answer or len(response_obj.answer) < 20: 
                    response_obj.answer = final_text or response_obj.answer
                    
            except Exception as fe:
                logger.warning(f"Formatting Pass Error, using raw reasoning: {fe}")
                response_obj = ExpertChatResponse(answer=final_text)

            # 3. Dynamic Overrides by State Engine (Truth)
            response_obj.state = state.dict()
            response_obj.ready_for_solution = ready
            
            if not ready and most_important_gap:
                options = get_options_for_gap(most_important_gap)
                response_obj.question = ExpertQuestion(
                    id=most_important_gap,
                    text=f"Για να σας δώσω την καλύτερη λύση, χρειάζομαι μια διευκρίνιση: Ποιο είναι το {most_important_gap};",
                    type="multiple-choice" if options else "text",
                    options=options
                )
            elif ready:
                solution = generate_solution(state, suggested_products)
                response_obj.step_by_step_recipe = [s['title'] + ": " + s['description'] for s in solution['steps']]
                response_obj.suggested_products = solution['suggested_products']
                
            return response_obj
            
        except Exception as e:
            logger.error(f"PaintExpertAgent.chat failed: {e}")
            return ExpertChatResponse(
                answer="Λυπάμαι, παρουσιάστηκε ένα πρόβλημα κατά την επεξεργασία του αιτήματός σας.",
                safety_warnings=[f"Σφάλμα: {str(e)}"]
            )
