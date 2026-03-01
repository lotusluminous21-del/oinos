import asyncio
import os
import sys
import io

# Force UTF-8 for stdout/stderr
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add functions dir to python path to resolve imports correctly
# Add functions dir to python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from expert.agent import PaintExpertAgent
from expert.schema import KnowledgeState

# Mock products for testing
mock_marine_products = [
    {
        "title": "Marine Prep Spray",
        "category": "Προετοιμασία/Καθαριστικό",
        "tags": ["marine", "cleaner"],
        "surfaces": ["Fiberglass", "Ξύλο"],
        "price": "14.50"
    },
    {
        "title": "SeaGuard Bottom Paint",
        "category": "Βασικό Χρώμα",
        "tags": ["marine", "antifouling"],
        "surfaces": ["Fiberglass", "Ξύλο"],
        "price": "95.00"
    }
]

async def run_test():
    agent = PaintExpertAgent()
    
    print("====================================")
    print("TEST 1: Marine Antifouling Flow")
    print("====================================")
    
    # 1. First statement - no state
    user_msg_1 = "Έχω ένα μικρό πολυεστερικό σκάφος (fiberglass) και θέλω να βάψω τα ύφαλα του με μουράβια. Είναι έξω από το νερό τώρα."
    print(f"\nUser: {user_msg_1}")
    initial_state = KnowledgeState()
    
    response_1 = await agent.chat(user_msg_1, current_state=initial_state)
    
    print(f"\nAI Answer: {response_1.answer}")
    if response_1.question:
        print(f"AI Follow-up Question: {response_1.question.text} (Gap ID: {response_1.question.id})")
    print(f"Ready for solution: {response_1.ready_for_solution}")
    
    if response_1.state:
        print("\nExtracted Context:")
        print(f"- Domain: {response_1.state.get('domain')}")
        print(f"- Type: {response_1.state.get('project_type')}")
        print(f"- Gaps: {response_1.state.get('gaps')}")

if __name__ == "__main__":
    asyncio.run(run_test())
