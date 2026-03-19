import google.auth
import google.auth.transport.requests
import requests
import json

try:
    creds, project = google.auth.default()
    auth_req = google.auth.transport.requests.Request()
    creds.refresh(auth_req)
    token = creds.token

    url = "https://firestore.googleapis.com/v1/projects/oinos-33896/databases/(default)/collectionGroups/wines/fields/embedding"

    payload = {
      "indexConfig": {
        "indexes": [
          {
            "queryScope": "COLLECTION"
          }
        ]
      }
    }
    
    # According to strict Firestore Admin REST API:
    # A single-field index definition
    # Wait, the best way is creating an explicit index on the collection group.
    
    post_url = "https://firestore.googleapis.com/v1/projects/oinos-33896/databases/(default)/collectionGroups/wines/indexes"
    post_payload = {
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "embedding",
          "vectorConfig": {
            "dimension": 768,
            "flat": {}
          }
        }
      ]
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    resp = requests.post(post_url, headers=headers, json=post_payload)
    print("Status Code:", resp.status_code)
    print("Response:", resp.text)
except Exception as e:
    print("Error:", str(e))
