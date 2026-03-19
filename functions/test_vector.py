import firebase_admin
from firebase_admin import credentials, firestore

try:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred, {'projectId': 'oinos-33896'})
except Exception:
    firebase_admin.initialize_app()

db = firestore.client()

from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure

query_vector = Vector([0.0]*768)

try:
    docs = db.collection("wines").find_nearest(
        vector_field="embedding",
        query_vector=query_vector,
        distance_measure=DistanceMeasure.COSINE,
        limit=1,
        distance_result_field="vector_distance"
    ).get()
    print("SUCCESS")
except Exception as e:
    print(str(e))
