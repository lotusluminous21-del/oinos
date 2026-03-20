import json
from firebase_admin import firestore
from google import genai
from google.genai import types

def process_wine_update(event):
    """
    Handles background Firestore writes for wines.
    When enrichment_status goes to PENDING, we run GenAI to populate the ADK schema.
    """
    if not event.data or not event.data.after or not event.data.after.exists:
        return
        
    doc_ref = event.data.after.reference
    after_data = event.data.after.to_dict() or {}
    status = after_data.get("enrichment_status")
    
    if status != "PENDING":
        return
        
    print(f"Enriching wine SKU: {after_data.get('sku')}")
    
    try:
        # Mark as processing
        doc_ref.update({"enrichment_status": "PROCESSING"})
        
        # Hypothetical raw description
        raw_description = after_data.get("raw_description", "")
        
        if not raw_description:
            doc_ref.update({"enrichment_status": "FAILED", "enrichment_message": "No raw description found."})
            return

        from core.llm_config import LLMConfig
        client = LLMConfig.get_client()
        model_id = LLMConfig.get_model_name(complex=True)
        
        prompt = f"""
        Extract the following wine structured data from this raw description:
        "{raw_description}"
        
        Output valid JSON matching this schema exactly:
        {{
            "colour": "String",
            "type": "String",
            "co2": "Still | Sparkling",
            "varietal_makeup": ["String"],
            "alcohol_percent": 13.5,
            "body": "String",
            "tasting_notes": {{
                "aroma": ["String"],
                "taste": ["String"],
                "after_taste": "String"
            }},
            "food_pairing": ["String"]
        }}
        """
        
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        enriched_data = json.loads(response.text)
        
        # Generate semantic embedding for Vector Search
        description_for_embedding = f"Name: {after_data.get('name', '')}. Type: {enriched_data.get('type')}. Color: {enriched_data.get('colour')}. Profile: {', '.join(enriched_data.get('tasting_notes', {}).get('taste', []))} and {', '.join(enriched_data.get('tasting_notes', {}).get('aroma', []))}. Pairs with: {', '.join(enriched_data.get('food_pairing', []))}."
        
        embed_response = client.models.embed_content(
            model=LLMConfig.get_embedding_model_name(),
            contents=description_for_embedding,
        )
        
        from google.cloud.firestore_v1.vector import Vector
        embedding_floats = embed_response.embeddings[0].values
        enriched_data["embedding"] = Vector(embedding_floats)

        enriched_data["enrichment_status"] = "ENRICHED"
        enriched_data["enrichment_message"] = "Successfully enriched via Gemini and generated Vector."
        
        doc_ref.update(enriched_data)
        print(f"Successfully enriched wine SKU: {after_data.get('sku')}")
        
    except Exception as e:
        print(f"Error enriching wine {after_data.get('sku')}: {e}")
        doc_ref.update({"enrichment_status": "FAILED", "enrichment_message": str(e)})

