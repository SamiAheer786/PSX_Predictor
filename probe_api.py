import requests
import json

BASE_URL = "https://api.askanalyst.com.pk/api"

endpoints_to_test = [
    "company_info/1",
    "company_profile/1",
    "overview/1",
    "summary/1",
    "stockchartnew/1",
    "rationew/1",  # Check full content
    "financials/1",
    "market_data/1"
]

def format_value(v):
    if isinstance(v, (dict, list)):
        return f"[{type(v).__name__}]"
    return str(v)

print(f"Testing endpoints on {BASE_URL}...")

for ep in endpoints_to_test:
    url = f"{BASE_URL}/{ep}"
    print(f"\nScanning: {ep}")
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            print(f"  [SUCCESS] Status: {res.status_code}")
            
            # If it's a list, print first item keys
            if isinstance(data, list):
                if len(data) > 0:
                    print("  Keys (first item):", list(data[0].keys()))
                    print("  Sample:", json.dumps(data[0], indent=2)[:200])
                else:
                    print("  [Empty List]")
            # If it's a dict, print keys
            elif isinstance(data, dict):
                print("  Keys:", list(data.keys()))
                # Look for specific keywords
                keywords = ["return", "yield", "debt", "cash", "enterprise", "valuation"]
                found = {k: format_value(v) for k, v in data.items() if any(kw in k.lower() for kw in keywords)}
                if found:
                    print("  [POTENTIAL MATCHES]:", found)
                else:
                    print("  Sample:", json.dumps(data, indent=2)[:200])
            else:
                print("  Type:", type(data))
        else:
            print(f"  [FAILED] Status: {res.status_code}")
    except Exception as e:
        print(f"  [ERROR] {str(e)}")
