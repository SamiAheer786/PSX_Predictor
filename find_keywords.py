import requests
import json

BASE_URL = "https://api.askanalyst.com.pk/api"
ID = 1

endpoints = {
    "financials": f"companyfinancialnew/{ID}?companyfinancial=true&test=true",
    "ratios": f"rationew/{ID}",
    "stock_price_data": f"stockpricedatanew/{ID}",
    "balance_sheet": f"bs/{ID}"
}

keywords = ["debt", "cash", "enterprise", "ev", "loan"]

print(f"Searching for keywords {keywords} in endpoints for ID {ID}...\n")

for name, path in endpoints.items():
    url = f"{BASE_URL}/{path}"
    print(f"--- {name.upper()} ---")
    try:
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            text = res.text.lower()
            data = res.json()
            
            found = []
            for kw in keywords:
                if kw in text:
                    found.append(kw)
            
            if found:
                print(f"Use '{name}'? Found keywords: {found}")
                # Recursively search keys in json to find exact path
                def search_keys(obj, path=""):
                    if isinstance(obj, dict):
                        for k, v in obj.items():
                            if any(kw in k.lower() for kw in keywords):
                                print(f"  Match: {path}.{k} = {v}")
                            search_keys(v, f"{path}.{k}")
                    elif isinstance(obj, list):
                         for i, item in enumerate(obj):
                            search_keys(item, f"{path}[{i}]")
                
                # Limit search depth/breadth for readability
                # search_keys(data) 
                
                # Custom search for Ratios structure
                if name == "ratios" and isinstance(data, list):
                    for section in data:
                        sec_name = section.get('section', '')
                        if "valuation" in sec_name.lower():
                            print("  Checking Valuation section...")
                            for item in section.get('data', []):
                                label = item.get('label', '')
                                if any(kw in label.lower() for kw in keywords):
                                    print(f"    Found in Valuation: {label} = {item.get('data', [])[-1] if item.get('data') else 'No Data'}")
            else:
                print("  No keywords found.")

        else:
            print(f"Failed: {res.status_code}")
    except Exception as e:
        print(f"Error: {e}")
    print("\n")
