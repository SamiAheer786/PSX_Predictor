import requests
import json
import os

def check_data():
    base_url = "http://localhost:8000/api"
    
    print("Fetching Balance Sheet...")
    try:
        bs = requests.get(f"{base_url}/company/1/balance-sheet").json()
        with open("debug_bs.json", "w") as f:
            json.dump(bs, f, indent=2)
        print("Balance Sheet saved. Keys:", bs.keys() if isinstance(bs, dict) else "Not a dict")
        if 'annual' in bs:
            print("First item in annual:", json.dumps(bs['annual'][0], indent=2))
    except Exception as e:
        print("BS Error:", e)

    print("\nFetching Cash Flow...")
    try:
        cf = requests.get(f"{base_url}/company/1/cash-flow").json()
        with open("debug_cf.json", "w") as f:
            json.dump(cf, f, indent=2)
        print("Cash Flow saved. Keys:", cf.keys() if isinstance(cf, dict) else "Not a dict")
        if 'annual' in cf:
             if len(cf['annual']) > 0:
                print("First item in annual:", json.dumps(cf['annual'][0], indent=2))
             else:
                print("Annual list is empty")
    except Exception as e:
        print("CF Error:", e)

if __name__ == "__main__":
    check_data()
