import requests
import json

BASE_URL = "https://api.askanalyst.com.pk/api"
ID = 1

endpoints = {
    "financials": f"companyfinancialnew/{ID}?companyfinancial=true&test=true",
    "ratios": f"rationew/{ID}",
    "stock_chart": f"stockchartnew/{ID}"
}

print(f"Inspecting endpoints for ID {ID}...\n")

for name, path in endpoints.items():
    url = f"{BASE_URL}/{path}"
    print(f"--- {name.upper()} ({url}) ---")
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list):
                print(f"Type: List [{len(data)} items]")
                if len(data) > 0:
                     # Check for specific keys in list items if it's key-value pairs
                    print("Sample Items:")
                    for i in range(min(5, len(data))):
                        print(f"  {json.dumps(data[i], indent=0)}")
            elif isinstance(data, dict):
                print("Type: Dict")
                print("Keys:", list(data.keys()))
                print("Sample:", json.dumps(data, indent=2)[:500])
        else:
            print(f"Failed: {res.status_code}")
    except Exception as e:
        print(f"Error: {e}")
    print("\n")
