import os
import json
from google import genai
from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector

MOCK_WINES = [
    {
        "sku": "WINE-001",
        "name": "Chateau Sea Breeze",
        "raw_description": "A crisp, refreshing white wine with distinct notes of lemon zest, green apple, and sea salt. Perfect for a warm summer day, it pairs beautifully with grilled shrimp, white fish, and light garden salads.",
        "colour": "White",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Sauvignon Blanc"],
        "alcohol_percent": 12.5,
        "body": "Light",
        "tasting_notes": {
            "aroma": ["Lemon", "Green Apple", "Sea Salt"],
            "taste": ["Citrus", "Mineral"],
            "after_taste": "Crisp and zesty"
        },
        "food_pairing": ["Grilled Shrimp", "White fish", "Salad"],
        "price": 18.50,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-002",
        "name": "Midnight Velvet Reserve",
        "raw_description": "A deeply complex, full-bodied red wine boasting dark cherry, blackberry, and hints of smooth vanilla and dark chocolate. It has velvety tannins and pairs luxuriously with steak, heavy stews, and sharp aged cheeses.",
        "colour": "Red",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Cabernet Sauvignon", "Merlot"],
        "alcohol_percent": 14.5,
        "body": "Full",
        "tasting_notes": {
            "aroma": ["Dark Cherry", "Vanilla", "Chocolate"],
            "taste": ["Blackberry", "Oak"],
            "after_taste": "Smooth and lingering"
        },
        "food_pairing": ["Steak", "Stews", "Aged Cheese"],
        "price": 45.00,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-003",
        "name": "Golden Spark Cuvée",
        "raw_description": "An elegant, lively bubbly wine featuring bright aromas of toasted brioche, pear, and fine citrus. It celebrates any occasion and matches flawlessly with oysters, caviar, and fried appetizers.",
        "colour": "White",
        "type": "Sparkling",
        "co2": "Sparkling",
        "varietal_makeup": ["Chardonnay", "Pinot Noir"],
        "alcohol_percent": 11.5,
        "body": "Medium",
        "tasting_notes": {
            "aroma": ["Toasted Brioche", "Pear", "Citrus"],
            "taste": ["Green Apple", "Yeast"],
            "after_taste": "Clean and effervescent"
        },
        "food_pairing": ["Oysters", "Fried Appetizers", "Caviar"],
        "price": 65.00,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-004",
        "name": "Sunset Blush Rosé",
        "raw_description": "A delicate and dry pink wine offering subtle hints of wild strawberry, watermelon, and white peach. It's incredibly drinkable and is the perfect companion for spicy Thai food, goat cheese, or simply sipping by the pool.",
        "colour": "Rosé",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Grenache", "Syrah"],
        "alcohol_percent": 12.0,
        "body": "Light",
        "tasting_notes": {
            "aroma": ["Strawberry", "Watermelon", "White Peach"],
            "taste": ["Red Berries", "Floral"],
            "after_taste": "Dry and crisp"
        },
        "food_pairing": ["Spicy Thai", "Goat Cheese", "Charcuterie"],
        "price": 22.00,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-005",
        "name": "Earthy Roots Pinot",
        "raw_description": "A fantastic expression of terroir, this medium-bodied red showcases tart cherry, mushroom, and forest floor aromatics. Its bright acidity cuts right through roasted poultry, pork belly, and mushroom risotto.",
        "colour": "Red",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Pinot Noir"],
        "alcohol_percent": 13.0,
        "body": "Medium",
        "tasting_notes": {
            "aroma": ["Cherry", "Mushroom", "Forest Floor"],
            "taste": ["Tart Cherry", "Earthy"],
            "after_taste": "Bright and acidic"
        },
        "food_pairing": ["Roasted Poultry", "Mushroom Risotto", "Pork Belly"],
        "price": 35.00,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-006",
        "name": "Sunny Slope Chenin",
        "raw_description": "A gorgeous, slightly off-dry white wine. It balances high acidity with luscious flavors of honey, baked apple, and chamomile. It is absolutely brilliant with spicy Indian curries or sweet and sour dishes.",
        "colour": "White",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Chenin Blanc"],
        "alcohol_percent": 11.0,
        "body": "Light",
        "tasting_notes": {
            "aroma": ["Honey", "Baked Apple", "Chamomile"],
            "taste": ["Sweet Apple", "Citrus"],
            "after_taste": "Off-dry and vibrant"
        },
        "food_pairing": ["Indian Curry", "Sweet and Sour Pork"],
        "price": 28.50,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-007",
        "name": "Bold Spice Shiraz",
        "raw_description": "A very intense and jammy red wine characterized by crushed black pepper, dark plum, and leather. The robust spice profile makes it an undeniable hit with sticky BBQ ribs, smoked brisket, and grilled sausages.",
        "colour": "Red",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Shiraz"],
        "alcohol_percent": 15.0,
        "body": "Full",
        "tasting_notes": {
            "aroma": ["Black Pepper", "Plum", "Leather"],
            "taste": ["Jammy Fruit", "Spice"],
            "after_taste": "Spicy and warm"
        },
        "food_pairing": ["BBQ Ribs", "Smoked Brisket", "Sausages"],
        "price": 26.00,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-008",
        "name": "Aged Oak Reserve White",
        "raw_description": "A classic heavily oaked white wine. Creamy and rich, it heavily features butter, toasted nuts, and ripe tropical fruits like pineapple and mango. Pair this big wine with lobster tail, rich cream sauces, or roasted chicken.",
        "colour": "White",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Chardonnay"],
        "alcohol_percent": 14.0,
        "body": "Full",
        "tasting_notes": {
            "aroma": ["Butter", "Toasted Oak", "Pineapple"],
            "taste": ["Mango", "Cream"],
            "after_taste": "Rich and buttery"
        },
        "food_pairing": ["Lobster", "Cream Pastas", "Roasted Chicken"],
        "price": 55.00,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-009",
        "name": "Alpine Crisp Green",
        "raw_description": "Bone dry and incredibly sharp, this bright white offers intense green pepper, gooseberry, and fresh cut grass aromas. Its extremely zesty profile cuts through rich fried foods, goat cheese tarts, and fresh asparagus.",
        "colour": "White",
        "type": "Still",
        "co2": "Still",
        "varietal_makeup": ["Sauvignon Blanc"],
        "alcohol_percent": 12.0,
        "body": "Light",
        "tasting_notes": {
            "aroma": ["Green Pepper", "Gooseberry", "Cut Grass"],
            "taste": ["Tart Lime", "Herbal"],
            "after_taste": "Pungent and zesty"
        },
        "food_pairing": ["Fried Foods", "Goat Cheese", "Asparagus"],
        "price": 19.90,
        "enrichment_status": "ENRICHED"
    },
    {
        "sku": "WINE-010",
        "name": "Ruby Sweet Fortified",
        "raw_description": "A luscious, sweet fortified red wine packed with aromas of fig, raisin, and dark chocolate. Serve slightly chilled after a meal alongside dark chocolate desserts, blue cheese, or dried fruits.",
        "colour": "Red",
        "type": "Fortified",
        "co2": "Still",
        "varietal_makeup": ["Touriga Nacional"],
        "alcohol_percent": 20.0,
        "body": "Full",
        "tasting_notes": {
            "aroma": ["Fig", "Raisin", "Dark Chocolate"],
            "taste": ["Sweet Berries", "Syrup"],
            "after_taste": "Sweet and warming"
        },
        "food_pairing": ["Dark Chocolate", "Blue Cheese", "Dried Fruits"],
        "price": 42.00,
        "enrichment_status": "ENRICHED"
    }
]

def generate_embeddings_and_upload():
    # Setup GenAI vertex client
    PROJECT_ID = "oinos-33896"
    REGION = "global"
    client = genai.Client(vertexai=True, project=PROJECT_ID, location=REGION)
    db = firestore.Client(project=PROJECT_ID)

    print("Generating embeddings and uploading to Firestore...")
    
    batch = db.batch()
    
    for wine in MOCK_WINES:
        description_for_embedding = f"Name: {wine['name']}. Description: {wine['raw_description']}. Food pairings: {', '.join(wine['food_pairing'])}. Price: €{wine['price']}"
        
        from core.llm_config import LLMConfig
        response = client.models.embed_content(
            model=LLMConfig.get_embedding_model_name(),
            contents=description_for_embedding,
        )
        
        # Google GenAI `embed_content` response holds a list of embeddings.
        embedding_floats = response.embeddings[0].values
        
        # Add the embedding as a Vector to the wine dict
        wine['embedding'] = Vector(embedding_floats)
        
        doc_ref = db.collection('wines').document(wine['sku'])
        batch.set(doc_ref, wine)
        print(f"Prepared {wine['sku']} - {wine['name']}")
        
    print("Committing to Firestore...")
    batch.commit()
    print("Done! Inserted 10 wines with embeddings.")

if __name__ == "__main__":
    generate_embeddings_and_upload()
