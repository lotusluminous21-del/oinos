import subprocess
import json

cmd = [
    "gcloud", "firestore", "indexes", "composite", "create",
    "--project=oinos-33896",
    "--collection-group=wines",
    "--query-scope=COLLECTION",
    "--field-config",
    "field-path=embedding,vector-config={\"dimension\":768,\"flat\":{}}"
]

print("Executing:", " ".join(cmd))

result = subprocess.run(cmd, capture_output=True, text=True)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)

if result.returncode != 0:
    print("Failed. Trying alpha command...")
    cmd_alpha = [
        "gcloud", "alpha", "firestore", "indexes", "fields", "create",
        "--project=oinos-33896",
        "--collection-group=wines",
        "--field=embedding",
        "--type=vector",
        "--vector-config={\"dimension\":768,\"flat\":{}}"
    ]
    result2 = subprocess.run(cmd_alpha, capture_output=True, text=True)
    print("STDOUT2:", result2.stdout)
    print("STDERR2:", result2.stderr)
