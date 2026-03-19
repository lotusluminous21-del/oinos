import os
from firebase_admin import initialize_app, credentials
import json

# Or if testing against prod, ensure GOOGLE_APPLICATION_CREDENTIALS is set

try:
    initialize_app()
except ValueError:
    pass

from expert.orchestrator import run_pipeline

data = {
    "sessionId": "test-session-123",
    "userId": "test-user-123",
    "message": "Γεια! Ψάχνω ένα κόκκινο κρασί για μοσχαρίσια μπριζόλα, ιδανικά κάτω από 40 ευρώ."
}

print("Running pipeline...")
res = run_pipeline(data)
print("\nPipeline Result:")
print(json.dumps(res, indent=2, ensure_ascii=False))
