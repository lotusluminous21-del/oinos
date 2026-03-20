import os
import sys
import random
import firebase_admin
from firebase_admin import credentials, firestore
from google import genai
from google.cloud.firestore_v1.vector import Vector

# Add parent directory to path to import from functions/
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from seed_wines import MOCK_WINES
from core.llm_config import LLMConfig

def init_firebase():
    if not firebase_admin._apps:
        try:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {'projectId': 'oinos-33896'})
        except:
            firebase_admin.initialize_app()
    return firestore.client()

def generate_100_wines():
    wines = []
    # We have 10 base wines. We will create 10 unique variations of each to reach 100.
    vintages = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
    
    sku_counter = 1
    for base_wine in MOCK_WINES:
        for vintage in vintages:
            # Create a shallow copy
            wine = dict(base_wine)
            wine['sku'] = f"WINE-{sku_counter:03d}"
            wine['name'] = f"{base_wine['name']} Vintage {vintage}"
            
            # Adjust price slightly based on vintage (older = more expensive usually)
            age_premium = (2024 - vintage) * (base_wine['price'] * 0.05)
            wine['price'] = round(base_wine['price'] + age_premium, 2)
            
            wines.append(wine)
            sku_counter += 1
            
    return wines

def main():
    db = init_firebase()
    
    PROJECT_ID = "oinos-33896"
    REGION = "global"
    client = genai.Client(vertexai=True, project=PROJECT_ID, location=REGION)
    
    wines = generate_100_wines()
    print(f"Generated {len(wines)} realistic mock wines based on established seed.")
    
    batch = db.batch()
    count = 0
    total = 0
    
    for wine in wines:
        # Generate embedding
        description_for_embedding = f"Name: {wine['name']}. Description: {wine['raw_description']}. Food pairings: {', '.join(wine['food_pairing'])}. Price: €{wine['price']}"
        
        try:
            response = client.models.embed_content(
                model=LLMConfig.get_embedding_model_name(),
                contents=description_for_embedding,
            )
            embedding_floats = response.embeddings[0].values
            wine['embedding'] = Vector(embedding_floats)
        except Exception as e:
            print(f"Failed to embed {wine['sku']}: {e}")
            # Do not proceed without embeddings if we want them to show up in vector search
        
        doc_ref = db.collection("wines").document(wine["sku"])
        batch.set(doc_ref, wine)
        count += 1
        total += 1
        
        if count == 20: # Smaller batch size to prevent hitting limit too quickly with embeddings
            batch.commit()
            batch = db.batch()
            count = 0
            print(f"Uploaded {total}/100 wines...")
            
    if count > 0:
        batch.commit()
        
    print(f"Uploaded a total of {total} enriched wines with embeddings to Firestore collection 'wines'.")
    
    # Create the store
    store_id = "default"
    # Take 50-60 random wines from the 100 for the store
    store_skus = [w["sku"] for w in random.sample(wines, 55)]
    
    store_data = {
        "id": store_id,
        "name": "Dev Testing Store",
        "wine_skus": store_skus,
        "active": True
    }
    
    db.collection("stores").document(store_id).set(store_data)
    print(f"Created store '{store_id}' with {len(store_skus)} wines assigned.")

if __name__ == "__main__":
    main()
