import requests
import json
import os

def check_data():
    base_url = "http://localhost:8000/api"
    
    print("Fetching Overview...")
    try:
        overview = requests.get(f"{base_url}/company/1/overview").json()
        with open("debug_overview.json", "w") as f:
            json.dump(overview, f, indent=2)
        print("Overview saved. Keys:", overview.keys() if isinstance(overview, dict) else "Not a dict")
        
    except Exception as e:
        print("Overview Error:", e)

if __name__ == "__main__":
    check_data()
