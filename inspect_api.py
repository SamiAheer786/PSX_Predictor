import requests
import json

def get_data(path):
    url = f"https://api.askanalyst.com.pk/api/{path}"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        return {"error": str(e)}

print("--- BALANCE SHEET (BS) ---")
bs = get_data("bs/1")
print(json.dumps(bs, indent=2)[:500]) # Print first 500 chars

print("\n--- INCOME STATEMENT (IS) ---")
is_data = get_data("is/1")
print(json.dumps(is_data, indent=2)[:500])

print("\n--- RATIOS ---")
ratios = get_data("rationew/1")
print(json.dumps(ratios, indent=2)[:500])
