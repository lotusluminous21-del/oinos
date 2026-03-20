import json
from typing import Dict, Any, List
from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from firebase_admin import firestore
from core.llm_config import LLMConfig
from core.logger import get_logger

logger = get_logger("expert.retriever")

def _apply_filters(docs: list, filters: dict, strict: bool = True) -> list:
    results = []
    for doc in docs:
        w = doc.to_dict()
        
        # Always check colour and type if they exist in filters
        if filters.get("colour") and w.get("colour") != filters["colour"]:
            continue
        if filters.get("type") and w.get("type") != filters["type"]:
            continue
            
        if strict:
            if filters.get("body") and w.get("body") != filters["body"]:
                continue
            # Budget check
            max_budget = filters.get("max_budget")
            if max_budget and "price" in w:
                try:
                    if float(w["price"]) > float(max_budget):
                        continue
                except ValueError:
                    pass

        # Cleanup massive vector payload
        w.pop("embedding", None)
        # We KEEP vector_distance because the LLM needs it to know relevance.
        
        results.append(w)
        if len(results) >= 5:
            break
            
    return results

class CellarRetriever:
    def __init__(self):
        self.db = firestore.client()
        self.genai_client = LLMConfig.get_client()
        
    def retrieve(self, history: List[Dict[str, str]], query_json: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            # Build context from last 5 exchanges
            chat_context = "\n".join([f"{msg.get('role', 'user').upper()}: {msg.get('content', '')}" for msg in history[-5:]])
            
            embed_response = self.genai_client.models.embed_content(
                model=LLMConfig.get_embedding_model_name(),
                contents=chat_context,
            )
            query_vector = Vector(embed_response.embeddings[0].values)
            
            wines_ref = self.db.collection("wines")
            
            # Fetch broad semantic matches first (top 20)
            docs = wines_ref.find_nearest(
                vector_field="embedding",
                query_vector=query_vector,
                distance_measure=DistanceMeasure.COSINE,
                limit=20,
                distance_result_field="vector_distance"
            ).get()
            
            if not isinstance(query_json, dict):
                query_json = {}
                
            # Pass 1: Strict filters
            results = _apply_filters(docs, query_json, strict=True)
            
            # Pass 2: Relaxed filters if 0 results
            if not results:
                logger.warning("Pass 1 found 0 results. Relaxing filters (Pass 2).", filters=query_json)
                results = _apply_filters(docs, query_json, strict=False)
                
            # Pass 3: Ultimate fallback - just return top 3 semantic matches
            if not results:
                logger.warning("Pass 2 found 0 results. Falling back to pure semantic match.", filters=query_json)
                results = _apply_filters(docs, {}, strict=False)[:3]
                
            logger.info("Retriever found wines", count=len(results), skus=[r.get("sku") for r in results])
            return results
            
        except Exception as e:
            logger.error("Hybrid search failed", exc_info=True)
            return []
