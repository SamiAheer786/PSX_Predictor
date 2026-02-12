import pandas as pd
import requests
import json
import os

# Find LUCK ID
try:
    df = pd.read_csv("company_name_value.xls") # It might be a CSV despite .xls extension, or real excel. main.py used read_csv.
    luck = df[df['symbol'] == 'LUCK'].iloc[0]
    luck_id = luck['value']
    print(f"LUCK ID: {luck_id}")
except Exception as e:
    print(f"Error reading company file: {e}")
    # Fallback to a known ID if fails, or exit
    exit()

BASE_URL = "https://api.askanalyst.com.pk/api"

def get_data(path, name):
    print(f"\n--- {name} ---")
    try:
        res = requests.get(f"{BASE_URL}/{path}", timeout=10)
        data = res.json()
        # Print a summary of keys and some values
        if isinstance(data, list) and data:
            print(f"List of {len(data)} items. First item keys: {list(data[0].keys())}")
            print(json.dumps(data[0], indent=2))
        elif isinstance(data, dict):
            print(f"Dict keys: {list(data.keys())}")
            print(json.dumps(data, indent=2))
        else:
            print(data)
    except Exception as e:
        print(f"Error fetching {path}: {e}")

get_data(f"stockpricedatanew/{luck_id}", "STOCK DATA")
get_data(f"rationew/{luck_id}", "RATIOS")
# Also check if there is an overview endpoint on askanalyst
get_data(f"companyoverview/{luck_id}", "OVERVIEW (Guess)")
