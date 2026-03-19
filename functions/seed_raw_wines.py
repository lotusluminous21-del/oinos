import firebase_admin
from firebase_admin import credentials, firestore

MOCK_WINES = [
    {
        "sku": "WINE-001",
        "name": "Chateau Sea Breeze",
        "raw_description": "A crisp, refreshing white wine with distinct notes of lemon zest, green apple, and sea salt. Perfect for a warm summer day, it pairs beautifully with grilled shrimp, white fish, and light garden salads.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-002",
        "name": "Midnight Velvet Reserve",
        "raw_description": "A deeply complex, full-bodied red wine boasting dark cherry, blackberry, and hints of smooth vanilla and dark chocolate. It has velvety tannins and pairs luxuriously with steak, heavy stews, and sharp aged cheeses.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-003",
        "name": "Golden Spark Cuvée",
        "raw_description": "An elegant, lively bubbly wine featuring bright aromas of toasted brioche, pear, and fine citrus. It celebrates any occasion and matches flawlessly with oysters, caviar, and fried appetizers.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-004",
        "name": "Sunset Blush Rosé",
        "raw_description": "A delicate and dry pink wine offering subtle hints of wild strawberry, watermelon, and white peach. It's incredibly drinkable and is the perfect companion for spicy Thai food, goat cheese, or simply sipping by the pool.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-005",
        "name": "Earthy Roots Pinot",
        "raw_description": "A fantastic expression of terroir, this medium-bodied red showcases tart cherry, mushroom, and forest floor aromatics. Its bright acidity cuts right through roasted poultry, pork belly, and mushroom risotto.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-006",
        "name": "Sunny Slope Chenin",
        "raw_description": "A gorgeous, slightly off-dry white wine. It balances high acidity with luscious flavors of honey, baked apple, and chamomile. It is absolutely brilliant with spicy Indian curries or sweet and sour dishes.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-007",
        "name": "Bold Spice Shiraz",
        "raw_description": "A very intense and jammy red wine characterized by crushed black pepper, dark plum, and leather. The robust spice profile makes it an undeniable hit with sticky BBQ ribs, smoked brisket, and grilled sausages.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-008",
        "name": "Aged Oak Reserve White",
        "raw_description": "A classic heavily oaked white wine. Creamy and rich, it heavily features butter, toasted nuts, and ripe tropical fruits like pineapple and mango. Pair this big wine with lobster tail, rich cream sauces, or roasted chicken.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-009",
        "name": "Alpine Crisp Green",
        "raw_description": "Bone dry and incredibly sharp, this bright white offers intense green pepper, gooseberry, and fresh cut grass aromas. Its extremely zesty profile cuts through rich fried foods, goat cheese tarts, and fresh asparagus.",
        "enrichment_status": "PENDING"
    },
    {
        "sku": "WINE-010",
        "name": "Ruby Sweet Fortified",
        "raw_description": "A luscious, sweet fortified red wine packed with aromas of fig, raisin, and dark chocolate. Serve slightly chilled after a meal alongside dark chocolate desserts, blue cheese, or dried fruits.",
        "enrichment_status": "PENDING"
    }
]

def seed_firebase():
    # Initialize using default credentials
    try:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'projectId': 'oinos-33896',
        })
    except Exception:
        # If it fails, rely on existing initialization (if any)
        try:
            firebase_admin.initialize_app()
        except:
            pass

    db = firestore.client()
    batch = db.batch()
    
    for wine in MOCK_WINES:
        doc_ref = db.collection('wines').document(wine['sku'])
        batch.set(doc_ref, wine)
        print(f"Prepared RAW insertion for {wine['sku']}")
        
    batch.commit()
    print("Successfully seeded 10 'PENDING' wines. The Firestore trigger will automatically enrich and embed them!")

if __name__ == "__main__":
    seed_firebase()
